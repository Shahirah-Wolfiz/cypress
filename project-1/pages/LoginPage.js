import { expect } from '@playwright/test';
import { i18n } from '../lib/fixtures.js';
import { LanguageToggle } from './components/LanguageToggle.js';
import { OtpPage } from './OtpPage.js';

/**
 * Page Object for STMS login (/en/unauth/login)
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.path = '/en/unauth/login';
    this.languageToggle = new LanguageToggle(page);
    this.otpPage = new OtpPage(page);

    this.selectors = {
      tenantInput: 'input[name="tenant"]',
      emailInput: 'input[name="email"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
      forgotPasswordLink: 'a[href*="forgot-password"]',
      trustDeviceCheckbox: 'input[type="checkbox"]',
      form: 'form',
    };
  }

  tenantInput() {
    return this.page.locator(this.selectors.tenantInput);
  }

  emailInput() {
    return this.page.locator(this.selectors.emailInput);
  }

  passwordInput() {
    return this.page.locator(this.selectors.passwordInput);
  }

  submitButton() {
    return this.page.locator(this.selectors.submitButton);
  }

  forgotPasswordLink() {
    return this.page.locator(this.selectors.forgotPasswordLink);
  }

  async visit() {
    await this.page.goto(this.path);
  }

  async dontTrustDevice() {
    const checkbox = this.page.locator(`${this.selectors.trustDeviceCheckbox}:visible`).first();
    if ((await checkbox.count()) > 0 && (await checkbox.isChecked())) {
      await checkbox.uncheck({ force: true });
    }
  }

  async switchLanguage(language) {
    await this.languageToggle.switchTo(language, 'login');
  }

  async assertPageLoaded(language = 'nl') {
    const t = i18n[language].login;
    await expect(this.page).toHaveURL(/\/unauth\/login/);
    await this.languageToggle.assertLoginTranslations(t);
    await expect(this.tenantInput()).toBeVisible();
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async fillTenant(value) {
    const input = this.tenantInput();
    await expect(input).toBeEnabled();
    await input.clear();
    if (value) {
      await input.fill(value);
    }
  }

  async fillEmail(value) {
    const input = this.emailInput();
    await expect(input).toBeEnabled();
    await input.clear();
    if (value) {
      await input.fill(value);
      await expect(this.passwordInput()).toBeEnabled({ timeout: 10000 });
    }
  }

  async fillPassword(value) {
    const input = this.passwordInput();
    await expect(input).toBeEnabled({ timeout: 10000 });
    await input.clear();
    if (value) {
      await input.fill(value);
    }
  }

  async fillForm({ tenant = '', email = '', password = '' } = {}) {
    await this.fillTenant(tenant);
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  async submit() {
    await this.submitButton().click();
  }

  async login({ tenant, email, password }) {
    await this.fillForm({ tenant, email, password });
    await this.submit();
  }

  async loginWithOptionalOtp({ tenant, email, password }, otp = '123456') {
    await this.fillForm({ tenant, email, password });
    await this.submit();
    await this.otpPage.handleIfPresent(otp);
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink().click();
  }

  async assertValidationErrors() {
    const invalidInputs = this.page.locator(`${this.selectors.form} input[aria-invalid="true"]`);
    expect(await invalidInputs.count()).toBeGreaterThanOrEqual(1);
  }

  async assertStillOnLoginPage() {
    await expect(this.page).toHaveURL(/\/unauth\/login/);
  }
}
