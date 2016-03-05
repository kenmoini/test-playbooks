import logging
import pytest

log = logging.getLogger(__name__)


def pytest_addoption(parser):
    parser.addoption('--supported-window-sizes',
                     action='store',
                     default='800x600',
                     help='comma-separated list of supported window sizes')


def pytest_generate_tests(metafunc):
    if 'window_size' in metafunc.fixturenames:
        params = metafunc.config.getoption('--supported-window-sizes')
        params = list(set(params.split(',')))
        metafunc.parametrize('window_size', params)


@pytest.fixture(scope='function')
def supported_window_sizes(maximized_window_size, window_size, mozwebqa):
    if window_size == 'maximized':
        return maximized_window_size

    (width, height) = map(int, window_size.split('x'))

    mozwebqa.selenium.set_window_position(0, 0)
    mozwebqa.selenium.set_window_size(width, height)

    return True


@pytest.fixture
def maximized_window_size(mozwebqa):
    log.debug('Calling fixture maximized')

    if mozwebqa.selenium.name == 'chrome':
        (width, height) = mozwebqa.selenium.execute_script(
            'return [screen.width, screen.height];')

        mozwebqa.selenium.set_window_position(0, 0)
        mozwebqa.selenium.set_window_size(width, height)
    else:
        mozwebqa.selenium.maximize_window()

    return True
