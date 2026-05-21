import LoginPage from '../../pages/LoginPage';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage';
import OtpPage from '../../pages/OtpPage';
import DashboardPage from '../../pages/DashboardPage';

describe('STMS Login', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  describe('UI', () => {
    it('should display the login page in the active language', () => {
      cy.contains('label', /Company|Bedrijf/).then(($label) => {
        const language = $label.text().includes('Company') ? 'en' : 'nl';
        LoginPage.assertPageLoaded(language);
      });
    });

  });

  describe('Forgot password', () => {
    it('should open the forgot password page from login', () => {
      LoginPage.clickForgotPassword();
      ForgotPasswordPage.assertPageLoaded();
    });

    it('should open OTP verification page after clicking Verify', () => {
      cy.fixture('login').then(({ validUser }) => {
        LoginPage.clickForgotPassword();
        ForgotPasswordPage.assertPageLoaded();
        ForgotPasswordPage.submitEmailForVerification({
          tenant: validUser.tenant,
          email: validUser.email,
        });
        OtpPage.assertOtpVerificationPage({ context: 'forgot' });
      });
    });
  });

  describe('Language toggle', () => {
    it('should display English labels when EN is selected', () => {
      LoginPage.switchLanguage('en');
      LoginPage.assertPageLoaded('en');
    });

    it('should display Dutch labels when NL is selected', () => {
      LoginPage.switchLanguage('nl');
      LoginPage.assertPageLoaded('nl');
    });

    it('should switch from English to Dutch and update labels', () => {
      LoginPage.switchLanguage('en');
      LoginPage.assertPageLoaded('en');

      LoginPage.switchLanguage('nl');
      LoginPage.assertPageLoaded('nl');
    });

    it('should switch from Dutch to English and update labels', () => {
      LoginPage.switchLanguage('nl');
      LoginPage.assertPageLoaded('nl');

      LoginPage.switchLanguage('en');
      LoginPage.assertPageLoaded('en');
    });
  });

  describe('Validation', () => {
    it('should show validation errors when submitting an empty form', () => {
      LoginPage.submit();
      LoginPage.assertValidationErrors();
      LoginPage.assertStillOnLoginPage();
    });

    it('should show validation errors when password is missing', () => {
      cy.fixture('login').then(({ partialUser }) => {
        LoginPage.fillForm(partialUser);
        LoginPage.submit();
        LoginPage.assertValidationErrors();
        LoginPage.assertStillOnLoginPage();
      });
    });
  });

  describe('Authentication', () => {
    it('should stay on login page with invalid credentials', () => {
      cy.fixture('login').then(({ invalidUser }) => {
        LoginPage.login(invalidUser);
        LoginPage.assertStillOnLoginPage();
      });
    });

    it('should log in successfully and redirect to the dashboard (English)', function () {
      LoginPage.switchLanguage('en');
      LoginPage.assertPageLoaded('en');
      cy.loginWithOptionalOtp();
      DashboardPage.assertPageLoaded('en');
    });

    it('should log in successfully and redirect to the dashboard (Dutch)', function () {
      LoginPage.switchLanguage('nl');
      LoginPage.assertPageLoaded('nl');
      cy.loginWithOptionalOtp();
      DashboardPage.assertPageLoaded('nl');
    });
  });

  describe('OTP (only when shown after login)', function () {
    beforeEach(function () {
      cy.fixture('login').then(({ validUser }) => {
        cy.env(['loginTenant', 'loginEmail', 'loginPassword']).then((env) => {
          const password = env.loginPassword || validUser.password;

          if (!password) {
            this.skip();
          }

          LoginPage.fillForm({
            tenant: env.loginTenant || validUser.tenant,
            email: env.loginEmail || validUser.email,
            password,
          });
          LoginPage.submit();

          cy.get('body', { timeout: 20000 }).then(($body) => {
            if (!OtpPage.isOtpScreen($body)) {
              cy.log('OTP not required for this device — skipping OTP tests');
              this.skip();
            }
          });
        });
      });
    });

    it('should display the OTP verification screen', () => {
      OtpPage.assertPageVisible();
    });

    it('should reach the dashboard with valid OTP', () => {
      cy.fixture('login').then(({ otp }) => {
        OtpPage.fillAndSubmit(otp.valid, { waitForDashboard: true });
        DashboardPage.assertDashboardReady();
      });
    });

    it('should show an error for wrong OTP', () => {
      cy.fixture('login').then(({ otp }) => {
        OtpPage.fillAndSubmit(otp.invalid);
        OtpPage.assertInvalidOtpError();
        OtpPage.assertStillOnOtpScreen();
      });
    });

    it('should return to login when back is pressed', () => {
      OtpPage.clickBack();
      LoginPage.assertStillOnLoginPage();
      LoginPage.getTenantInput().should('be.visible');
    });
  });

  describe('Logout', () => {
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
});
