/**
 * Shared language toggle (EN / NL).
 * Language changes are client-side — verify labels, not URL (/en/ vs /nl/).
 */
class LanguageToggle {
  languages = {
    en: { alt: 'English' },
    nl: { alt: 'Dutch' },
  };

  getToggle(language) {
    const { alt } = this.languages[language];
    return cy.get(`img[alt="${alt}"]`).parent('div').first();
  }

  isContentActive($body, language, page, i18n) {
    const t = i18n[language][page];

    if (page === 'login') {
      return [...$body.find('label')].some((el) => el.innerText.includes(t.tenantLabel));
    }

    return $body.text().includes(t.generalNav);
  }

  assertLoginTranslations(t) {
    cy.contains('label', t.tenantLabel, { timeout: 15000 }).should('be.visible');
    cy.contains('label', t.emailLabel).should('be.visible');
    cy.contains('label', t.passwordLabel).should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.get('a[href*="forgot-password"]').should('be.visible');
    return this;
  }

  clickToggleIfNeeded(language, page, i18n) {
    cy.get('body').then(($body) => {
      if (!this.isContentActive($body, language, page, i18n)) {
        this.getToggle(language).click();
      }
    });
  }

  switchTo(language, page = 'login') {
    cy.fixture('i18n').then((i18n) => {
      const t = i18n[language][page];

      this.clickToggleIfNeeded(language, page, i18n);

      // EN can look selected while labels stay Dutch — toggle away and back (no URL change)
      cy.get('body').then(($body) => {
        if (!this.isContentActive($body, language, page, i18n)) {
          const other = language === 'en' ? 'nl' : 'en';
          this.getToggle(other).click();
          this.getToggle(language).click();
        }
      });

      if (page === 'login') {
        this.assertLoginTranslations(t);
      } else {
        cy.get('p.font-semibold.uppercase', { timeout: 15000 }).should(
          'contain.text',
          t.generalNav
        );
      }
    });

    return this;
  }

  waitForLanguageContent(language, page = 'login') {
    cy.fixture('i18n').then((i18n) => {
      const t = i18n[language][page];

      if (page === 'login') {
        this.assertLoginTranslations(t);
      } else {
        cy.get('p.font-semibold.uppercase', { timeout: 15000 }).should(
          'contain.text',
          t.generalNav
        );
      }
    });
    return this;
  }

  assertActive(language, page = 'login') {
    this.waitForLanguageContent(language, page);
    return this;
  }
}

export default new LanguageToggle();
