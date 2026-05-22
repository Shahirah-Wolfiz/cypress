import { expect } from '@playwright/test';

/**
 * Page Object for forgot password (/en/unauth/forgot-password)
 */
export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;
    this.path = '/en/unauth/forgot-password';

    this.selectors = {
      tenantInput: 'input[name="tenant"]',
      emailInput: 'input[name="email"]',
    };

    this.titlePattern =
      /Forgot Password|Wachtwoord vergeten|Reset Password|Wachtwoord opnieuw instellen/i;
    this.subtitlePattern = /Enter your email|Voer je e-mailadres in/i;
    this.emailLabelPattern = /^(Email|E-mail)$/;
    this.sendCodeButtonPattern = /^(Verify|Verifiëren|Send code|Code versturen)$/i;
    this.otpSentPattern = /OTP sent|code naar|gestuurd|verificatiecode/i;
  }

  tenantInput() {
    return this.page.locator(this.selectors.tenantInput);
  }

  emailInput() {
    return this.page.locator(this.selectors.emailInput);
  }

  async visit() {
    await this.page.goto(this.path);
  }

  async assertPageLoaded() {
    await expect(this.page).toHaveURL(/\/unauth\/forgot-password/, { timeout: 15000 });
    await expect(this.tenantInput()).toBeVisible();
    await expect(this.emailInput()).toBeVisible();
    await expect(this.page.locator('label', { hasText: this.emailLabelPattern })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: this.titlePattern })).toBeVisible();
    await expect(this.page.getByText(this.subtitlePattern)).toBeVisible();
    await expect(
      this.page.locator('button:visible', { hasText: this.sendCodeButtonPattern })
    ).toBeVisible();
  }

  async fillTenant(tenant) {
    const input = this.tenantInput();
    await expect(input).toBeEnabled();
    await input.clear();
    await input.fill(tenant);
  }

  async fillEmail(email) {
    const input = this.emailInput();
    await expect(input).toBeEnabled();
    await input.clear();
    await input.fill(email);
  }

  async fillForm({ tenant = '', email = '' } = {}) {
    await this.fillTenant(tenant);
    await this.fillEmail(email);
  }

  async clickSendCode() {
    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes('forgot-password-email') && res.request().method() === 'POST',
      { timeout: 20000 }
    );

    const button = this.page.locator('button:visible', { hasText: this.sendCodeButtonPattern });
    await expect(button).toBeEnabled({ timeout: 10000 });
    await button.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  }

  async waitForOtpStep() {
    await expect(this.page.getByText(this.otpSentPattern)).toBeVisible({ timeout: 20000 });
  }

  async submitEmailForVerification({ tenant, email }) {
    await this.fillForm({ tenant, email });
    await this.clickSendCode();
    await this.waitForOtpStep();
  }
}
