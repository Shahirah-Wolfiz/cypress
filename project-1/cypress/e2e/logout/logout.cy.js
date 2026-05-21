import LoginPage from '../../pages/LoginPage';
import DashboardPage from '../../pages/DashboardPage';

describe('STMS Logout', () => {
  beforeEach(function () {
    LoginPage.visit();
    cy.loginWithOptionalOtp();
    DashboardPage.assertDashboardReady();
  });

  it('should logout from dashboard and redirect to the login page', () => {
    DashboardPage.logout();
    LoginPage.assertStillOnLoginPage();
    LoginPage.getTenantInput().should('be.visible');
    LoginPage.getEmailInput().should('be.visible');
    LoginPage.getPasswordInput().should('be.visible');
    LoginPage.getSubmitButton().should('be.visible');
  });
});
