import LoginPage from '../../pages/LoginPage';
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

    it('should navigate to forgot password', () => {
      LoginPage.clickForgotPassword();
      cy.url().should('include', '/unauth/forgot-password');
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
      cy.fixture('login').then(({ validUser }) => {
        cy.env(['loginTenant', 'loginEmail', 'loginPassword']).then((env) => {
          const password = env.loginPassword || validUser.password;

          if (!password) {
            this.skip();
          }

          LoginPage.switchLanguage('en');
          LoginPage.assertPageLoaded('en');

          LoginPage.login({
            tenant: env.loginTenant || validUser.tenant,
            email: env.loginEmail || validUser.email,
            password,
          });

          DashboardPage.assertPageLoaded('en');
        });
      });
    });

    it('should log in successfully and redirect to the dashboard (Dutch)', function () {
      cy.fixture('login').then(({ validUser }) => {
        cy.env(['loginTenant', 'loginEmail', 'loginPassword']).then((env) => {
          const password = env.loginPassword || validUser.password;

          if (!password) {
            this.skip();
          }

          LoginPage.switchLanguage('nl');
          LoginPage.assertPageLoaded('nl');

          LoginPage.login({
            tenant: env.loginTenant || validUser.tenant,
            email: env.loginEmail || validUser.email,
            password,
          });

          DashboardPage.assertPageLoaded('nl');
        });
      });
    });
  });
});
