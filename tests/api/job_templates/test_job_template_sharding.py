import logging
import uuid

import pytest

from dateutil import rrule
from datetime import datetime
from dateutil.relativedelta import relativedelta

from tests.api import Base_Api_Test

from towerkit.rrule import RRule
from towerkit.utils import poll_until


log = logging.getLogger(__name__)


@pytest.mark.api
@pytest.mark.destructive
@pytest.mark.usefixtures('authtoken', 'install_enterprise_license_unlimited')
class TestJobTemplateSharding(Base_Api_Test):

    @pytest.fixture
    def sharded_jt_factory(self, factories):
        def r(ct, jt_kwargs=None, host_ct=None):
            if not jt_kwargs:
                jt_kwargs = {}
            if not host_ct:
                host_ct = ct
            jt = factories.v2_job_template(job_shard_count=ct, **jt_kwargs)
            inventory = jt.ds.inventory
            hosts = []
            for i in range(host_ct):
                hosts.append(inventory.related.hosts.post(payload=dict(
                    name='foo{}'.format(i),
                    variables='ansible_connection: local'
                )))
            return jt
        return r

    @pytest.mark.mp_group('JobTemplateSharding', 'isolated_serial')
    def test_job_template_shard_run(self, factories, v2, do_all_jobs_overlap, sharded_jt_factory):
        """Tests that a job template is split into multiple jobs
        and that those run against a 1/3rd subset of the inventory
        """
        jt = sharded_jt_factory(3)

        instance = v2.instances.get(
            rampart_groups__controller__isnull=True,
            capacity__gt=0
        ).results.pop()
        assert instance.capacity > 4, 'Cluster instances not large enough to run this test'
        ig = factories.instance_group()
        ig.add_instance(instance)
        jt.add_instance_group(ig)

        workflow_job = jt.launch()
        workflow_job.wait_until_completed()
        assert workflow_job.is_successful

        # The obvious test that sharding worked - that all hosts have only 1 job
        hosts = jt.ds.inventory.related.hosts.get().results
        assert [host.related.job_host_summaries.get().count for host in hosts] == [1 for i in range(3)]

        jobs = []
        for job in v2.unified_jobs.get(unified_job_node__workflow_job=workflow_job.id).results:
            assert job.get().host_status_counts['ok'] == 1
            jobs.append(job)

        assert do_all_jobs_overlap(jobs)

    @pytest.mark.mp_group('JobTemplateSharding', 'isolated_serial')
    @pytest.mark.parametrize('allow_sim', (True, False))
    def test_job_template_shard_allow_simultaneous(self, factories, v2, do_all_jobs_overlap,
                                                   sharded_jt_factory, allow_sim):
        jt = sharded_jt_factory(2, jt_kwargs=dict(allow_simultaneous=allow_sim))

        instance = v2.instances.get(
            rampart_groups__controller__isnull=True,
            capacity__gt=0
        ).results.pop()
        assert instance.capacity > 5, 'Cluster instances not large enough to run this test'
        ig = factories.instance_group()
        ig.add_instance(instance)
        jt.add_instance_group(ig)

        workflow_jobs = [jt.launch(), jt.launch()]
        for workflow_job in workflow_jobs:
            workflow_job.wait_until_completed()
            assert workflow_job.is_successful

        # The sharded workflow container has configurable allow_simultaneous
        assert do_all_jobs_overlap(workflow_jobs) == allow_sim

        for workflow_job in workflow_jobs:
            jobs = []
            for node in workflow_job.related.workflow_nodes.get().results:
                jobs.append(node.related.job.get())
            # The shards themselves should _always_ be simultaneous
            assert do_all_jobs_overlap(jobs)

    def test_job_template_shard_remainder_hosts(self, factories, sharded_jt_factory):
        """Test the logic for when the host count (= 5) does not match the
        shard count (= 3)
        """
        jt = sharded_jt_factory(3, host_ct=5)
        workflow_job = jt.launch()
        workflow_job.wait_until_completed()
        assert workflow_job.is_successful

        # The obvious test that sharding worked - that all hosts have only 1 job
        hosts = jt.ds.inventory.related.hosts.get().results
        assert [host.related.job_host_summaries.get().count for host in hosts] == [1 for i in range(5)]

        # It must be deterministic which jobs run which hosts
        job_okays = []
        for node in workflow_job.related.workflow_nodes.get(order_by='created').results:
            job = node.related.job.get()
            job_okays.append(job.get().host_status_counts['ok'])
        assert job_okays == [2, 2, 1]

    def test_job_template_shard_properties(self, factories, gce_credential, sharded_jt_factory):
        """Tests that JT properties are used in jobs that sharded
        workflow launches
        """
        jt = sharded_jt_factory(3, jt_kwargs=dict(verbosity=3, timeout=45))
        workflow_job = jt.launch()

        for node in workflow_job.related.workflow_nodes.get().results:
            assert node.verbosity == None

            poll_until(lambda: node.get().job, interval=1, timeout=30)
            job = node.related.job.get()
            assert job.related.create_schedule.get()['prompts'] == {}
            assert job.verbosity == 3
            assert job.timeout == 45

    def test_job_template_shard_prompts(self, gce_credential, sharded_jt_factory):
        """Tests that prompts applied on launch fan out to shards
        """
        jt = sharded_jt_factory(3, jt_kwargs=dict(
            ask_limit_on_launch=True,
            ask_credential_on_launch=True
        ))
        workflow_job = jt.launch(payload=dict(
            limit='foobar',
            credentials=[jt.ds.credential.id, gce_credential.id]
        ))

        for node in workflow_job.related.workflow_nodes.get().results:
            # design decision is to not save prompts on nodes
            assert node.limit == None
            assert node.related.credentials.get().count == 0

            poll_until(lambda: node.get().job, interval=1, timeout=30)
            job = node.related.job.get()
            prompts = job.related.create_schedule.get()['prompts']
            assert prompts['limit'] == 'foobar'
            assert [cred['id'] for cred in prompts['credentials']] == [gce_credential.id]
            assert set(cred.id for cred in job.related.credentials.get().results) == set([
                gce_credential.id, jt.ds.credential.id])

    def test_sharded_job_from_workflow(self, factories, sharded_jt_factory):
        wfjt = factories.workflow_job_template()
        jt = sharded_jt_factory(3)
        node = factories.workflow_job_template_node(
            workflow_job_template=wfjt,
            unified_job_template=jt
        )
        first_wj = wfjt.launch()
        first_wj_node = first_wj.related.workflow_nodes.get().results.pop()
        poll_until(lambda: first_wj_node.get().job, interval=1, timeout=30)
        sharded_job = first_wj_node.related.job.get()
        assert sharded_job.type == 'workflow_job'
        nodes = sharded_job.related.workflow_nodes.get()
        assert nodes.count == 3

        # better check that we didn't get recursion...
        for node in nodes.results:
            poll_until(lambda: node.get().job, interval=1, timeout=30)
            job = node.related.job.get()
            assert job.type == 'job'

    def test_job_template_shard_schedule(self, sharded_jt_factory):
        """Test that schedule runs will work with sharded jobs
        """
        jt = sharded_jt_factory(3)
        schedule = jt.add_schedule(
            rrule=RRule(rrule.MINUTELY, dtstart=datetime.utcnow() + relativedelta(minutes=-1, seconds=+30))
        )
        poll_until(lambda: schedule.related.unified_jobs.get().count == 1, interval=15, timeout=60)
        workflow_job = schedule.related.unified_jobs.get().results.pop()
        # teardown does not delete schedules created in v2
        schedule.delete()

        assert workflow_job.type == 'workflow_job'
        assert workflow_job.job_template == jt.id
        assert workflow_job.related.workflow_nodes.get().count == 3

    def test_job_template_shard_job_long_name(self, sharded_jt_factory, v2):
        uuid_str = str(uuid.uuid4())
        unique_512_name = 'f'*(512-len(uuid_str)) + uuid_str
        jt = sharded_jt_factory(2, jt_kwargs=dict(name=unique_512_name))

        workflow_job = jt.launch()
        workflow_job.wait_until_completed()
        assert workflow_job.is_successful

        for job in v2.unified_jobs.get(unified_job_node__workflow_job=workflow_job.id).results:
            assert job.is_successful

    # TODO: (some kind of test for actual clusters, probably in job execution node assignment)
