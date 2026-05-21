import LoginPage from '../pages/LoginPage';

/**
 * Logs in with valid credentials and completes OTP (123456) only when the screen appears.
 * Skips the test if loginPassword is missing from cypress.env.json.
 */
Cypress.Commands.add('loginWithOptionalOtp', function () {
  cy.fixture('login').then(({ validUser, otp }) => {
    cy.env(['loginTenant', 'loginEmail', 'loginPassword']).then((env) => {
      const password = env.loginPassword || validUser.password;

      if (!password) {
        this.skip();
      }

      LoginPage.loginWithOptionalOtp(
        {
          tenant: env.loginTenant || validUser.tenant,
          email: env.loginEmail || validUser.email,
          password,
        },
        otp.valid
      );
    });
  });
});
