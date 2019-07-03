import os

import fauxfactory
from towerkit import config


class TestLogin(object):

    def test_network_error(self, cli):
        result = cli(['awx', 'login'])
        assert b'There was a network error of some kind trying to reach https://127.0.0.1:443.' in result.stdout  # noqa

    def test_invalid_credentials(self, cli):
        result = cli([
            'awx', 'login', '-k',
            '--conf.host', config.base_url
            ])
        assert b"Error retrieving an OAuth2.0 token (<class 'towerkit.exceptions.Unauthorized'>" in result.stdout  # noqa

    def test_personal_token(self, cli):
        # login *always* prints a shell export that you can source i.e.,
        # export TOWER_TOKEN="abc123"
        result = cli(['awx', 'login'], auth=True)
        token = result.stdout.split(b'=')[1].strip()
        assert token is not None
        result = cli(['awx', 'me', '-k'], env={
            'PATH': os.environ['PATH'],
            'TOWER_HOST': config.base_url,
            'TOWER_TOKEN': token
        })
        assert result.json['count'] == 1
        assert result.json['results'][0]['username'] == config.credentials.default.username  # noqa

    def test_read_scoped_token(self, cli):
        result = cli(['awx', 'login', '--conf.scope', 'read'], auth=True)
        token = result.stdout.split(b'=')[1].strip()

        username = fauxfactory.gen_alphanumeric()
        result = cli([
            'awx', '-k', 'users', 'create', '--username', username
        ], env={
            'PATH': os.environ['PATH'],
            'TOWER_HOST': config.base_url,
            'TOWER_TOKEN': token
        })
        assert result.returncode == 2
        assert b"invalid choice: 'create'" in result.stdout
