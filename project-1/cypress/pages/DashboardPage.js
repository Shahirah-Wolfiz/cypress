import LanguageToggle from './components/LanguageToggle';

/**
 * Page Object for STMS dashboard (/en/d/dashboard)
 */
class DashboardPage {
  path = '/en/d/dashboard';

  selectors = {
    logo: 'img[alt="logo"]',
    generalNav: 'p.font-semibold.uppercase',
    profileAvatar: '.MuiAvatar-root.cursor-pointer',
  };

  switchLanguage(language) {
    LanguageToggle.switchTo(language);
    return this;
  }

  assertLanguageActive(language) {
    LanguageToggle.assertActive(language, 'dashboard');
    return this;
  }

  assertDashboardReady() {
    cy.url({ timeout: 15000 }).should('include', '/d/dashboard');
    cy.title().should('eq', 'Smart Transport');
    cy.get(this.selectors.logo).should('be.visible');
    return this;
  }

  assertPageLoaded(language = 'nl') {
    this.assertDashboardReady();
    cy.fixture('i18n').then((i18n) => {
      const t = i18n[language].dashboard;
      cy.get(this.selectors.generalNav)
        .should('be.visible')
        .and('contain.text', t.generalNav);
    });
    return this;
  }

  openProfileMenu() {
    cy.get(this.selectors.profileAvatar).first().should('be.visible').click();
    cy.contains(/Logout|Uitloggen/i, { timeout: 10000 }).should('be.visible');
    return this;
  }

  clickLogout() {
    cy.contains(/Logout|Uitloggen/i, { timeout: 10000 }).should('be.visible').click();
    return this;
  }

  logout() {
    this.openProfileMenu();
    this.clickLogout();
    return this;
  }
}

export default new DashboardPage();
