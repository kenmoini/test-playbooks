import time
import base
import page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

class LoginPage(base.Base):
    # TODO: This obviously should change. File bug
    _page_title = "AnsibleWorks AWX"
    _login_username_field_locator = (By.ID, 'login-username')
    _login_password_field_locator = (By.ID, 'login-password')
    _login_submit_button_locator = (By.ID, 'login-button')
    _login_demo_ok_button_locator = (By.ID, 'alert_ok_btn')
    _login_license_warning_button_locator = (By.ID, 'alert2_ok_btn')

    @property
    def is_the_current_page(self):
        '''Override the base implementation to make sure that we are actually on the login screen
        and not the actual dashboard
        '''
        return Base.is_the_current_page and self.is_element_visible(*self._login_submit_button_locator)

    @property
    def username(self):
        return self.selenium.find_element(*self._login_username_field_locator)

    @property
    def password(self):
        return self.selenium.find_element(*self._login_password_field_locator)

    @property
    def login_button(self):
        return self.selenium.find_element(*self._login_submit_button_locator)

    @property
    def demo_ok_button(self):
        return self.selenium.find_element(*self._login_demo_ok_button_locator)

    @property
    def license_warning_button(self):
        return self.selenium.find_element(*self._login_license_warning_button_locator)

    def _click_on_login_button(self):
        self.login_button.click()

    def _press_enter_on_login_button(self):
        self.login_button.send_keys(Keys.RETURN)

    def _click_on_login_and_send_window_size(self):
        self.login_button.click()
        driver = self.login_button.parent
        driver.execute_script("""miqResetSizeTimer();""")

    def login(self, user='default'):
        return self.login_with_mouse_click(user)
        # return self.login_with_enter_key(user)

    def login_with_enter_key(self, user='default'):
        return self.__do_login(self._press_enter_on_login_button, user)

    def login_with_mouse_click(self, user='default'):
        return self.__do_login(self._click_on_login_button, user)

    def login_and_send_window_size(self, user='default'):
        return self.__do_login(self._click_on_login_and_send_window_size, user)

    def __do_login(self, continue_function, user='default'):
        self.__set_login_fields(user)
        # Submit field (click submit, press <enter> etc...)
        continue_function()

        # Wait for "busy" throbber to go away
        self._wait_for_results_refresh()

        # Acknowledge DEMO dialog
        try:
            self.demo_ok_button.click()
        except:
            pass

        # Acknowledge license warning dialog
        try:
            self.license_warning_button.click()
        except:
            pass

        # Wait for "busy" throbber to go away
        self._wait_for_results_refresh()

        # FIXME - This should return the correct redirected page
        from dashboard import Dashboard
        return Dashboard(self.testsetup)

    def __set_login_fields(self, user='default'):
        credentials = self.testsetup.credentials[user]
        self.username.send_keys(credentials['username'])
        self.password.send_keys(credentials['password'])

