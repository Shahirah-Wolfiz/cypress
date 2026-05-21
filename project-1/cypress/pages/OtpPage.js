/**
 * Page Object for optional 6-digit OTP step after login
 */
class OtpPage {
  selectors = {
    backButton: '#unauth-back',
    otpDigitInput: 'input[maxlength="1"]',
    loginEmailInput: 'input[name="email"]',
    loginTenantInput: 'input[name="tenant"]',
    loginPasswordInput: 'input[name="password"]',
    otpSubmitButton:
      'button:visible:not([aria-label="Taal"]):not([aria-label="Meldingen"])',
  };

  otpSubmitLabels = /^(Login|Log in|Verify|Verifiëren|Code bevestigen|Confirm code|Inloggen)$/i;

  /**
   * Only true when the OTP UI is actually visible (not hidden i18n strings in the DOM).
   */
  isOtpScreen($body) {
    const hasVisibleLoginFields =
      $body.find(`${this.selectors.loginTenantInput}:visible`).length > 0 ||
      $body.find(`${this.selectors.loginEmailInput}:visible`).length > 0;

    if (hasVisibleLoginFields) {
      return false;
    }

    return $body.find(`${this.selectors.otpDigitInput}:visible`).length >= 6;
  }

  fillOtpDigits(otp) {
    cy.get(`${this.selectors.otpDigitInput}:visible`).should('have.length', 6);
    otp.split('').forEach((digit, index) => {
      cy.get(`${this.selectors.otpDigitInput}:visible`)
        .eq(index)
        .clear()
        .type(digit, { delay: 80 });
    });
    return this;
  }

  clickOtpSubmit() {
    cy.contains('button:visible', this.otpSubmitLabels, { timeout: 10000 })
      .should('not.be.disabled')
      .should('not.have.class', 'Mui-disabled')
      .click();
    return this;
  }

  completeOtp(otp, { waitForDashboard = false } = {}) {
    this.fillOtpDigits(otp);
    this.clickOtpSubmit();

    if (waitForDashboard) {
      cy.location('pathname', { timeout: 30000 }).should('include', '/d/dashboard');
    }

    return this;
  }

  assertPageVisible() {
    cy.get(`${this.selectors.otpDigitInput}:visible`, { timeout: 15000 }).should(
      'have.length',
      6
    );
    return this;
  }

  assertOtpVerificationPage({ context = 'login' } = {}) {
    if (context === 'forgot') {
      cy.contains(/OTP sent|code naar|gestuurd|6 digit|6-cijferige|verification code|verificatiecode/i, {
        timeout: 20000,
      })
        .filter(':visible')
        .should('be.visible');
    }

    this.assertPageVisible();
    cy.contains(/6 digit|6-cijferige|verification code|verificatiecode|2 Step Authentication/i)
      .filter(':visible')
      .should('be.visible');

    if (context === 'login') {
      cy.get(this.selectors.loginEmailInput).should('not.exist');
    } else {
      cy.get(`${this.selectors.loginTenantInput}:visible`).should('have.length', 0);
      cy.get(`${this.selectors.loginEmailInput}:visible`).should('have.length', 0);
      cy.get(`${this.selectors.loginPasswordInput}:visible`).should('have.length', 0);
    }

    return this;
  }

  fillOtp(otp) {
    this.fillOtpDigits(otp);
    return this;
  }

  submit() {
    this.clickOtpSubmit();
    return this;
  }

  fillAndSubmit(otp, options = {}) {
    this.completeOtp(otp, options);
    return this;
  }

  clickBack() {
    cy.get('body').then(($body) => {
      const $back = $body.find(`${this.selectors.backButton}:visible`);
      if ($back.length) {
        cy.get(this.selectors.backButton).filter(':visible').click();
      } else {
        cy.contains(/Terug|Back/i).filter(':visible').click();
      }
    });
    return this;
  }

  assertInvalidOtpError() {
    cy.contains(/Ongeldige code|Invalid code|Invalid Otp/i, { timeout: 10000 })
      .filter(':visible')
      .should('be.visible');
    return this;
  }

  assertStillOnOtpScreen() {
    cy.get(`${this.selectors.otpDigitInput}:visible`).should('have.length', 6);
    return this;
  }

  /**
   * Completes OTP only when the 6-digit inputs are actually visible.
   */
  handleIfPresent(otp) {
    cy.location('pathname', { timeout: 20000 }).should((pathname) => {
      const $body = Cypress.$('body');
      const onDashboard = pathname.includes('/d/dashboard');
      const onOtp = this.isOtpScreen($body);
      expect(onDashboard || onOtp, 'land on dashboard or OTP screen after login').to.equal(
        true
      );
    });

    cy.location('pathname').then((pathname) => {
      if (pathname.includes('/d/dashboard')) {
        cy.log('Dashboard reached — OTP step skipped');
        return;
      }

      cy.get('body').then(($body) => {
        if (this.isOtpScreen($body)) {
          cy.log('OTP screen visible — entering code');
          this.fillOtpDigits(otp);
          this.clickOtpSubmit();
          cy.location('pathname', { timeout: 30000 }).should('include', '/d/dashboard');
        } else {
          cy.log('OTP screen not visible — skipping OTP step');
        }
      });
    });

    return this;
  }
}

export default new OtpPage();
