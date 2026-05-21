import LanguageToggle from './components/LanguageToggle';
import OtpPage from './OtpPage';

/**
 * Page Object for STMS login (/en/unauth/login)
 */
class LoginPage {
  path = '/en/unauth/login';

  selectors = {
    tenantInput: 'input[name="tenant"]',
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    forgotPasswordLink: 'a[href*="forgot-password"]',
    trustDeviceCheckbox: 'input[type="checkbox"]',
    form: 'form',
  };

  visit() {
    cy.visit(this.path);
  }

  /**
   * Do not trust this device — helps trigger OTP on staging for new-device flows.
   */
  dontTrustDevice() {
    cy.get('body').then(($body) => {
      const $checkbox = $body.find(`${this.selectors.trustDeviceCheckbox}:visible`);
      if ($checkbox.length && $checkbox.is(':checked')) {
        cy.wrap($checkbox.first()).uncheck({ force: true });
      }
    });
    return this;
  }

  getTenantInput() {
    return cy.get(this.selectors.tenantInput);
  }

  getEmailInput() {
    return cy.get(this.selectors.emailInput);
  }

  getPasswordInput() {
    return cy.get(this.selectors.passwordInput);
  }

  getSubmitButton() {
    return cy.get(this.selectors.submitButton);
  }

  getForgotPasswordLink() {
    return cy.get(this.selectors.forgotPasswordLink);
  }

  switchLanguage(language) {
    LanguageToggle.switchTo(language);
    return this;
  }

  assertLanguageActive(language) {
    LanguageToggle.assertActive(language, 'login');
    return this;
  }

  assertPageLoaded(language = 'nl') {
    cy.fixture('i18n').then((i18n) => {
      const t = i18n[language].login;

      cy.url().should('include', '/unauth/login');
      LanguageToggle.assertLoginTranslations(t);
      this.getTenantInput().should('be.visible');
      this.getEmailInput().should('be.visible');
      this.getPasswordInput().should('be.visible');
    });
    return this;
  }

  fillTenant(value) {
    this.getTenantInput().should('be.enabled').clear({ force: true });
    if (value) {
      this.getTenantInput().type(value);
    }
    return this;
  }

  fillEmail(value) {
    this.getEmailInput().should('be.enabled').clear({ force: true });
    if (value) {
      this.getEmailInput().type(value);
      this.getPasswordInput().should('be.enabled', { timeout: 10000 });
    }
    return this;
  }

  fillPassword(value) {
    this.getPasswordInput().should('be.enabled', { timeout: 10000 }).clear({ force: true });
    if (value) {
      this.getPasswordInput().type(value);
    }
    return this;
  }

  fillForm({ tenant = '', email = '', password = '' } = {}) {
    this.fillTenant(tenant);
    this.fillEmail(email);
    this.fillPassword(password);
    return this;
  }

  submit() {
    this.getSubmitButton().click();
    return this;
  }

  login({ tenant, email, password }) {
    this.fillForm({ tenant, email, password });
    this.submit();
    return this;
  }

  loginWithOptionalOtp({ tenant, email, password }, otp = '123456') {
    this.fillForm({ tenant, email, password });
    this.submit();
    OtpPage.handleIfPresent(otp);
    return this;
  }

  clickForgotPassword() {
    this.getForgotPasswordLink().click();
    return this;
  }

  assertValidationErrors() {
    cy.get(`${this.selectors.form} input[aria-invalid="true"]`).should(
      'have.length.at.least',
      1
    );
  }

  assertStillOnLoginPage() {
    cy.url().should('include', '/unauth/login');
  }
}

export default new LoginPage();
