import { expect } from '@playwright/test';
import { i18n } from '../lib/fixtures.js';
import { LanguageToggle } from './components/LanguageToggle.js';

/**
 * Page Object for STMS dashboard (/en/d/dashboard)
 */
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.path = '/en/d/dashboard';
    this.languageToggle = new LanguageToggle(page);

    this.selectors = {
      logo: 'img[alt="logo"]',
      generalNav: 'p.font-semibold.uppercase',
      profileAvatar: '.MuiAvatar-root.cursor-pointer',
    };
  }

  async switchLanguage(language) {
    await this.languageToggle.switchTo(language, 'dashboard');
  }

  async assertDashboardReady() {
    await expect(this.page).toHaveURL(/\/d\/dashboard/, { timeout: 15000 });
    await expect(this.page).toHaveTitle('Smart Transport');
    await expect(this.page.locator(this.selectors.logo)).toBeVisible();
  }

  async assertPageLoaded(language = 'nl') {
    await this.assertDashboardReady();
    const t = i18n[language].dashboard;
    await expect(this.page.locator(this.selectors.generalNav)).toContainText(t.generalNav);
  }

  async openProfileMenu() {
    await this.page.locator(this.selectors.profileAvatar).first().click();
    await expect(this.page.getByText(/Logout|Uitloggen/i)).toBeVisible({ timeout: 10000 });
  }

  async clickLogout() {
    await this.page.getByText(/Logout|Uitloggen/i).click();
  }

  async logout() {
    await this.openProfileMenu();
    await this.clickLogout();
  }
}
