# STMS E2E Tests

End-to-end tests for the **Smart Transport Management System (STMS)** staging environment.

This project uses **[Playwright](https://playwright.dev/)** with the Page Object Model.

**Target:** `https://stage.stms.pandagizmo.com`

---

## Documentation

Full setup, credentials, commands, and test flow:

**[README-PLAYWRIGHT.md](./README-PLAYWRIGHT.md)**

---

## Quick start

```bash
cd project-1
npm install
npx playwright install
cp .env.example .env
# Edit .env with your staging password
npm test
```

Interactive UI:

```bash
npm run test:ui
```
