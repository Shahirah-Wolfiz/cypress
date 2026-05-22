import { expect } from '@playwright/test';

/**
 * Page Object for optional 6-digit OTP step after login
 */
export class OtpPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      backButton: '#unauth-back',
      otpDigitInput: 'input[maxlength="1"]',
      loginEmailInput: 'input[name="email"]',
      loginTenantInput: 'input[name="tenant"]',
      loginPasswordInput: 'input[name="password"]',
    };
    this.otpSubmitLabels =
      /^(Login|Log in|Verify|Verifiëren|Code bevestigen|Confirm code|Inloggen)$/i;
  }

  otpDigitInputs() {
    return this.page.locator(`${this.selectors.otpDigitInput}:visible`);
  }

  async isOtpScreen() {
    const loginTenantVisible = await this.page
      .locator(`${this.selectors.loginTenantInput}:visible`)
      .count();
    const loginEmailVisible = await this.page
      .locator(`${this.selectors.loginEmailInput}:visible`)
      .count();

    if (loginTenantVisible > 0 || loginEmailVisible > 0) {
      return false;
    }

    const otpCount = await this.otpDigitInputs().count();
    return otpCount >= 6;
  }

  async fillOtpDigits(otp) {
    const inputs = this.otpDigitInputs();
    await expect(inputs).toHaveCount(6);
    const digits = otp.split('');
    for (let index = 0; index < digits.length; index++) {
      await inputs.nth(index).clear();
      await inputs.nth(index).pressSequentially(digits[index], { delay: 80 });
    }
  }

  async clickOtpSubmit() {
    const button = this.page.locator('button:visible', { hasText: this.otpSubmitLabels });
    await expect(button.first()).toBeEnabled({ timeout: 10000 });
    await expect(button.first()).not.toHaveClass(/Mui-disabled/);
    await button.first().click();
  }

  async completeOtp(otp, { waitForDashboard = false } = {}) {
    await this.fillOtpDigits(otp);
    await this.clickOtpSubmit();

    if (waitForDashboard) {
      await expect(this.page).toHaveURL(/\/d\/dashboard/, { timeout: 30000 });
    }
  }

  async assertPageVisible() {
    await expect(this.otpDigitInputs()).toHaveCount(6, { timeout: 15000 });
  }

  async assertOtpVerificationPage({ context = 'login' } = {}) {
    if (context === 'forgot') {
      await expect(
        this.page.getByText(
          /OTP sent|code naar|gestuurd|6 digit|6-cijferige|verification code|verificatiecode/i
        )
      ).toBeVisible({ timeout: 20000 });
    }

    await this.assertPageVisible();
    await expect(
      this.page.getByText(
        /6 digit|6-cijferige|verification code|verificatiecode|2 Step Authentication/i
      )
    ).toBeVisible();

    if (context === 'login') {
      await expect(this.page.locator(this.selectors.loginEmailInput)).toHaveCount(0);
    } else {
      await expect(this.page.locator(`${this.selectors.loginTenantInput}:visible`)).toHaveCount(0);
      await expect(this.page.locator(`${this.selectors.loginEmailInput}:visible`)).toHaveCount(0);
      await expect(this.page.locator(`${this.selectors.loginPasswordInput}:visible`)).toHaveCount(0);
    }
  }

  async fillAndSubmit(otp, options = {}) {
    await this.completeOtp(otp, options);
  }

  async clickBack() {
    const back = this.page.locator(`${this.selectors.backButton}:visible`);
    if ((await back.count()) > 0) {
      await back.click();
    } else {
      await this.page.getByText(/Terug|Back/i).click();
    }
  }

  async assertInvalidOtpError() {
    await expect(this.page.getByText(/Ongeldige code|Invalid code|Invalid Otp/i)).toBeVisible({
      timeout: 10000,
    });
  }

  async assertStillOnOtpScreen() {
    await expect(this.otpDigitInputs()).toHaveCount(6);
  }

  async handleIfPresent(otp) {
    const deadline = Date.now() + 20000;
    let onDashboard = false;
    let onOtp = false;

    while (Date.now() < deadline) {
      const pathname = new URL(this.page.url()).pathname;
      onDashboard = pathname.includes('/d/dashboard');
      onOtp = await this.isOtpScreen();
      if (onDashboard || onOtp) break;
      await this.page.waitForTimeout(300);
    }

    expect(onDashboard || onOtp).toBeTruthy();

    if (onDashboard) {
      return;
    }

    if (await this.isOtpScreen()) {
      await this.fillOtpDigits(otp);
      await this.clickOtpSubmit();
      await expect(this.page).toHaveURL(/\/d\/dashboard/, { timeout: 30000 });
    }
  }
}
