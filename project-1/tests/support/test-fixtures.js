import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    page.on('pageerror', (error) => {
      if (/Unauthenticated/i.test(error.message)) {
        return;
      }
    });
    await use(page);
  },
});

export { expect };
