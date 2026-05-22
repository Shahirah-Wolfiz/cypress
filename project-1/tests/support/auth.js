import { getLoginCredentials, getOtpValid } from '../../lib/env.js';
import { LoginPage } from '../../pages/LoginPage.js';

export async function loginWithOptionalOtp(page) {
  const creds = getLoginCredentials();
  if (!creds.hasPassword) {
    return { skipped: true };
  }

  const loginPage = new LoginPage(page);
  await loginPage.loginWithOptionalOtp(
    {
      tenant: creds.tenant,
      email: creds.email,
      password: creds.password,
    },
    getOtpValid()
  );

  return { skipped: false };
}
