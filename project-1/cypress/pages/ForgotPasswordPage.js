/**
 * Page Object for forgot password (/en/unauth/forgot-password)
 *
 * Flow: tenant + email → POST /forgot-password-email → 6-digit OTP → Verify
 */
class ForgotPasswordPage {
  path = '/en/unauth/forgot-password';

  selectors = {
    tenantInput: 'input[name="tenant"]',
    emailInput: 'input[name="email"]',
    emailForm: 'form',
  };

  titlePattern =
    /Forgot Password|Wachtwoord vergeten|Reset Password|Wachtwoord opnieuw instellen/i;

  subtitlePattern = /Enter your email|Voer je e-mailadres in/i;

  emailLabelPattern = /^(Email|E-mail)$/;

  sendCodeButtonPattern = /^(Verify|Verifiëren|Send code|Code versturen)$/i;

  otpSentPattern = /OTP sent|code naar|gestuurd|verificatiecode/i;

  visit() {
    cy.visit(this.path);
    return this;
  }

  getTenantInput() {
    return cy.get(this.selectors.tenantInput);
  }

  getEmailInput() {
    return cy.get(this.selectors.emailInput);
  }

  assertPageLoaded() {
    cy.url({ timeout: 15000 }).should('include', '/unauth/forgot-password');
    this.getTenantInput().should('be.visible');
    this.getEmailInput().should('be.visible');
    cy.contains('label', this.emailLabelPattern).should('be.visible');
    cy.contains(this.titlePattern).should('be.visible');
    cy.contains(this.subtitlePattern).should('be.visible');
    cy.contains('button:visible', this.sendCodeButtonPattern).should('be.visible');
    return this;
  }

  fillTenant(tenant) {
    this.getTenantInput().should('be.enabled').clear({ force: true }).type(tenant);
    return this;
  }

  fillEmail(email) {
    this.getEmailInput().should('be.enabled').clear({ force: true }).type(email);
    return this;
  }

  fillForm({ tenant = '', email = '' } = {}) {
    this.fillTenant(tenant);
    this.fillEmail(email);
    return this;
  }

  clickSendCode() {
    cy.intercept('POST', '**/forgot-password-email').as('forgotPasswordEmail');
    cy.contains('button:visible', this.sendCodeButtonPattern, { timeout: 10000 })
      .should('not.be.disabled')
      .click();
    cy.wait('@forgotPasswordEmail', { timeout: 20000 }).its('response.statusCode').should('eq', 200);
    return this;
  }

  waitForOtpStep() {
    cy.contains(this.otpSentPattern, { timeout: 20000 }).filter(':visible').should('be.visible');
    return this;
  }

  submitEmailForVerification({ tenant, email }) {
    this.fillForm({ tenant, email });
    this.clickSendCode();
    this.waitForOtpStep();
    return this;
  }
}

export default new ForgotPasswordPage();
