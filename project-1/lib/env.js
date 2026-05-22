import { login } from './fixtures.js';

export function getLoginCredentials() {
  const password = process.env.LOGIN_PASSWORD || login.validUser.password;
  const tenant = process.env.LOGIN_TENANT || login.validUser.tenant;
  const email = process.env.LOGIN_EMAIL || login.validUser.email;

  return {
    tenant,
    email,
    password: password || '',
    hasPassword: Boolean(password),
  };
}

export function getOtpValid() {
  return process.env.OTP_VALID || login.otp.valid;
}
