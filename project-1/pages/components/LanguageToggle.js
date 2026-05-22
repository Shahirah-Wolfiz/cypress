import { expect } from '@playwright/test';
import { i18n } from '../../lib/fixtures.js';

/**
 * Shared language toggle (EN / NL).
 * Language changes are client-side — verify labels, not URL (/en/ vs /nl/).
 */
export class LanguageToggle {
  constructor(page) {
    this.page = page;
    this.languages = {
      en: { alt: 'English' },
      nl: { alt: 'Dutch' },
    };
  }

  getToggle(language) {
    const { alt } = this.languages[language];
    return this.page.locator(`img[alt="${alt}"]`).locator('xpath=ancestor::div[1]').first();
  }

  async isContentActive(language, pageKey) {
    const t = i18n[language][pageKey];
    if (pageKey === 'login') {
      return (await this.page.locator('label', { hasText: t.tenantLabel }).count()) > 0;
    }
    return (
      (await this.page.locator('p.font-semibold.uppercase', { hasText: t.generalNav }).count()) > 0
    );
  }

  async assertLoginTranslations(t) {
    await expect(this.page.locator('label', { hasText: t.tenantLabel })).toBeVisible({
      timeout: 15000,
    });
    await expect(this.page.locator('label', { hasText: t.emailLabel })).toBeVisible();
    await expect(this.page.locator('label', { hasText: t.passwordLabel })).toBeVisible();
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
    await expect(this.page.locator('a[href*="forgot-password"]')).toBeVisible();
  }

  async clickToggleIfNeeded(language, pageKey) {
    if (!(await this.isContentActive(language, pageKey))) {
      await this.getToggle(language).click();
    }
  }

  async switchTo(language, pageKey = 'login') {
    const t = i18n[language][pageKey];

    await this.clickToggleIfNeeded(language, pageKey);

    if (!(await this.isContentActive(language, pageKey))) {
      const other = language === 'en' ? 'nl' : 'en';
      await this.getToggle(other).click();
      await this.getToggle(language).click();
    }

    if (pageKey === 'login') {
      await this.assertLoginTranslations(t);
    } else {
      await expect(this.page.locator('p.font-semibold.uppercase')).toContainText(t.generalNav, {
        timeout: 15000,
      });
    }
  }

  async assertActive(language, pageKey = 'login') {
    const t = i18n[language][pageKey];
    if (pageKey === 'login') {
      await this.assertLoginTranslations(t);
    } else {
      await expect(this.page.locator('p.font-semibold.uppercase')).toContainText(t.generalNav, {
        timeout: 15000,
      });
    }
  }
}
