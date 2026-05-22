import { test, expect } from '../../support/test-fixtures.js';
import { LoginPage } from '../../../pages/LoginPage.js';
import { ForgotPasswordPage } from '../../../pages/ForgotPasswordPage.js';
import { OtpPage } from '../../../pages/OtpPage.js';
import { DashboardPage } from '../../../pages/DashboardPage.js';
import { login } from '../../../lib/fixtures.js';
import { getLoginCredentials, getOtpValid } from '../../../lib/env.js';
import { loginWithOptionalOtp } from '../../support/auth.js';

test.describe('STMS Login', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).visit();
  });

  test.describe('UI', () => {
    test('should display the login page in the active language', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const label = page.locator('label', { hasText: /Company|Bedrijf/ });
      const text = await label.textContent();
      const language = text.includes('Company') ? 'en' : 'nl';
      await loginPage.assertPageLoaded(language);
    });
  });

  test.describe('Forgot password', () => {
    test('should open the forgot password page from login', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const forgotPage = new ForgotPasswordPage(page);

      await loginPage.clickForgotPassword();
      await forgotPage.assertPageLoaded();
    });

    test('should open OTP verification page after clicking Verify', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const forgotPage = new ForgotPasswordPage(page);
      const otpPage = new OtpPage(page);
      const { validUser } = login;

      await loginPage.clickForgotPassword();
      await forgotPage.assertPageLoaded();
      await forgotPage.submitEmailForVerification({
        tenant: validUser.tenant,
        email: validUser.email,
      });
      await otpPage.assertOtpVerificationPage({ context: 'forgot' });
    });
  });

  test.describe('Language toggle', () => {
    test('should display English labels when EN is selected', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.switchLanguage('en');
      await loginPage.assertPageLoaded('en');
    });

    test('should display Dutch labels when NL is selected', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.switchLanguage('nl');
      await loginPage.assertPageLoaded('nl');
    });

    test('should switch from English to Dutch and update labels', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.switchLanguage('en');
      await loginPage.assertPageLoaded('en');
      await loginPage.switchLanguage('nl');
      await loginPage.assertPageLoaded('nl');
    });

    test('should switch from Dutch to English and update labels', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.switchLanguage('nl');
      await loginPage.assertPageLoaded('nl');
      await loginPage.switchLanguage('en');
      await loginPage.assertPageLoaded('en');
    });
  });

  test.describe('Validation', () => {
    test('should show validation errors when submitting an empty form', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.submit();
      await loginPage.assertValidationErrors();
      await loginPage.assertStillOnLoginPage();
    });

    test('should show validation errors when password is missing', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.fillForm(login.partialUser);
      await loginPage.submit();
      await loginPage.assertValidationErrors();
      await loginPage.assertStillOnLoginPage();
    });
  });

  test.describe('Authentication', () => {
    test('should stay on login page with invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login(login.invalidUser);
      await loginPage.assertStillOnLoginPage();
    });

    test('should log in successfully and redirect to the dashboard (English)', async ({
      page,
    }) => {
      const creds = getLoginCredentials();
      test.skip(!creds.hasPassword, 'Set LOGIN_PASSWORD in .env for login success tests');

      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.switchLanguage('en');
      await loginPage.assertPageLoaded('en');
      await loginWithOptionalOtp(page);
      await dashboardPage.assertPageLoaded('en');
    });

    test('should log in successfully and redirect to the dashboard (Dutch)', async ({ page }) => {
      const creds = getLoginCredentials();
      test.skip(!creds.hasPassword, 'Set LOGIN_PASSWORD in .env for login success tests');

      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.switchLanguage('nl');
      await loginPage.assertPageLoaded('nl');
      await loginWithOptionalOtp(page);
      await dashboardPage.assertPageLoaded('nl');
    });
  });

  test.describe('OTP (only when shown after login)', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      const creds = getLoginCredentials();
      if (!creds.hasPassword) {
        testInfo.skip();
        return;
      }

      const loginPage = new LoginPage(page);
      const otpPage = new OtpPage(page);

      await loginPage.fillForm({
        tenant: creds.tenant,
        email: creds.email,
        password: creds.password,
      });
      await loginPage.submit();

      const otpVisible = await otpPage.isOtpScreen();
      if (!otpVisible) {
        testInfo.skip(true, 'OTP not required for this device — skipping OTP tests');
      }
    });

    test('should display the OTP verification screen', async ({ page }) => {
      await new OtpPage(page).assertPageVisible();
    });

    test('should reach the dashboard with valid OTP', async ({ page }) => {
      const otpPage = new OtpPage(page);
      const dashboardPage = new DashboardPage(page);

      await otpPage.fillAndSubmit(login.otp.valid, { waitForDashboard: true });
      await dashboardPage.assertDashboardReady();
    });

    test('should show an error for wrong OTP', async ({ page }) => {
      const otpPage = new OtpPage(page);

      await otpPage.fillAndSubmit(login.otp.invalid);
      await otpPage.assertInvalidOtpError();
      await otpPage.assertStillOnOtpScreen();
    });

    test('should return to login when back is pressed', async ({ page }) => {
      const otpPage = new OtpPage(page);
      const loginPage = new LoginPage(page);

      await otpPage.clickBack();
      await loginPage.assertStillOnLoginPage();
      await expect(loginPage.tenantInput()).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      const creds = getLoginCredentials();
      test.skip(!creds.hasPassword, 'Set LOGIN_PASSWORD in .env for logout tests');

      await new LoginPage(page).visit();
      await loginWithOptionalOtp(page);
      await new DashboardPage(page).assertDashboardReady();
    });

    test('should logout from dashboard and redirect to the login page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await dashboardPage.logout();
      await loginPage.assertStillOnLoginPage();
      await expect(loginPage.tenantInput()).toBeVisible();
      await expect(loginPage.emailInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
      await expect(loginPage.submitButton()).toBeVisible();
    });
  });
});
