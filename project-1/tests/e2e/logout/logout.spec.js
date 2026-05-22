import { test, expect } from '../../support/test-fixtures.js';
import { LoginPage } from '../../../pages/LoginPage.js';
import { DashboardPage } from '../../../pages/DashboardPage.js';
import { getLoginCredentials } from '../../../lib/env.js';
import { loginWithOptionalOtp } from '../../support/auth.js';

test.describe('STMS Logout', () => {
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
