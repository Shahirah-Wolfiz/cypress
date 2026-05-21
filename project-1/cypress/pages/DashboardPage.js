import LanguageToggle from './components/LanguageToggle';

/**
 * Page Object for STMS dashboard (/en/d/dashboard)
 */
class DashboardPage {
  path = '/en/d/dashboard';

  selectors = {
    logo: 'img[alt="logo"]',
    generalNav: 'p.font-semibold.uppercase',
  };

  switchLanguage(language) {
    LanguageToggle.switchTo(language);
    return this;
  }

  assertLanguageActive(language) {
    LanguageToggle.assertActive(language, 'dashboard');
    return this;
  }

  assertPageLoaded(language = 'nl') {
    cy.fixture('i18n').then((i18n) => {
      const t = i18n[language].dashboard;

      cy.url({ timeout: 15000 }).should('include', this.path);
      cy.title().should('eq', 'Smart Transport');
      cy.get(this.selectors.logo).should('be.visible');
      cy.get(this.selectors.generalNav)
        .should('be.visible')
        .and('contain.text', t.generalNav);
    });
    return this;
  }
}

export default new DashboardPage();
