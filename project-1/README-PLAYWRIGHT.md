# STMS Playwright E2E Tests

End-to-end tests for the **Smart Transport Management System (STMS)** staging login and dashboard, using [Playwright](https://playwright.dev/) with the Page Object Model.

**Target:** `https://stage.stms.pandagizmo.com`

---

## Prerequisites

| Requirement | Version               | Notes          |
| ----------- | --------------------- | -------------- |
| **Node.js** | 18+ (LTS recommended) | Includes `npm` |
| **Git**     | Any recent version    | To clone repo  |

### macOS

1. Install **Node.js** from [nodejs.org](https://nodejs.org/) or `brew install node`
2. Verify:

```bash
node -v
npm -v
```

### Windows

1. Install **Node.js** from [nodejs.org](https://nodejs.org/) (LTS `.msi`)
2. Verify in Command Prompt or PowerShell:

```cmd
node -v
npm -v
```

---

## Clone the repository

Repository: [https://github.com/Shahirah-Wolfiz/cypress](https://github.com/Shahirah-Wolfiz/cypress)

Tests live in the `project-1` folder.

```bash
git clone https://github.com/Shahirah-Wolfiz/cypress.git
cd cypress/project-1
```

**Update an existing clone:**

```bash
cd cypress/project-1
git pull
```

---

## Installation

From the `project-1` directory:

```bash
npm install
npx playwright install
```

`npx playwright install` downloads Chromium (and optionally other browsers). Allow network access if prompted.

---

## Credentials (required for login success tests)

Successful login and logout tests need a real staging password. **Do not commit secrets.**

1. Copy the example env file:

```bash
cp .env.example .env
```

Windows:

```cmd
copy .env.example .env
```

2. Edit `.env`:

```env
LOGIN_TENANT=traders
LOGIN_EMAIL=traders@yopmail.com
LOGIN_PASSWORD=your-actual-password
OTP_VALID=123456
```

`.env` is gitignored. If `LOGIN_PASSWORD` is missing, authentication success tests are **skipped** automatically.

Override at runtime:

```bash
# macOS / Linux
LOGIN_PASSWORD=secret npm run test:login
```

```powershell
# Windows PowerShell
$env:LOGIN_PASSWORD="secret"; npm run test:login
```

---

## Running tests

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm test`           | Headless run of all specs                |
| `npm run test:ui`    | Interactive Playwright UI                |
| `npm run test:headed`| Headless off — see the browser           |
| `npm run test:login` | Login + logout specs only                |
| `npm run test:logout`| Logout spec only                         |
| `npm run report`     | Open HTML report after a run             |

### Examples

```bash
npm test
npm run test:ui
npm run test:login
```

Run a single file:

```bash
npx playwright test tests/e2e/login/login.spec.js
```

Debug step-by-step:

```bash
npx playwright test --debug
```

Artifacts on failure: `test-results/`, `playwright-report/` (gitignored).

---

## OTP (optional step after login)

OTP appears only on **new device / new network**. Most runs go straight to the dashboard.

### Recommended approach: `loginWithOptionalOtp()`

Login and logout tests use **`loginWithOptionalOtp(page)`** from `tests/support/auth.js`:

1. Submit email + password
2. **If OTP screen is visible** → enter `123456` (or `OTP_VALID` from `.env`)
3. **If not** → continue to dashboard

No extra setup when OTP is not required.

```javascript
import { loginWithOptionalOtp } from '../../support/auth.js';

await loginWithOptionalOtp(page);
await new DashboardPage(page).assertDashboardReady();
```

### Extra OTP tests (only when OTP appears)

Under **`STMS Login > OTP (only when shown after login)`** in `login.spec.js`:

- Wrong OTP, back button, valid OTP to dashboard
- These tests **skip automatically** if your device is already trusted (no OTP screen)

Valid code: **`123456`** (`fixtures/login.json` → `otp.valid`).

---

## Project structure

```
project-1/
├── playwright.config.js       # baseURL, reporters, browser project
├── .env.example               # template for secrets (copy → .env)
├── fixtures/
│   ├── login.json             # test users (valid, invalid, partial)
│   └── i18n.json              # EN/NL expected labels
├── lib/
│   ├── fixtures.js            # loads JSON fixtures
│   └── env.js                 # reads LOGIN_* from process.env
├── pages/
│   ├── LoginPage.js
│   ├── OtpPage.js
│   ├── DashboardPage.js
│   ├── ForgotPasswordPage.js
│   └── components/
│       └── LanguageToggle.js
├── tests/
│   ├── e2e/
│   │   ├── login/login.spec.js
│   │   └── logout/logout.spec.js
│   └── support/
│       ├── auth.js            # loginWithOptionalOtp helper
│       └── test-fixtures.js   # ignores logout 401 page errors
└── package.json
```

---

## Test flow (end to end)

Tests run against **staging STMS**. `baseURL` is set in `playwright.config.js`; page objects use paths like `/en/unauth/login`.

### 1. Visit login page

`LoginPage.visit()` opens `/en/unauth/login`. Every test starts here (`beforeEach`).

### 2. UI checks

- Page loads with labels matching the **current** language (EN or NL).
- **Forgot password** link navigates to forgot-password flow.

### 3. Language toggle (EN / NL)

`LanguageToggle` clicks the flag control and asserts labels from `fixtures/i18n.json`. Language is **client-side** (URL stays under `/en/`); tests assert **label text**, not URL locale.

### 4. Form validation

- **Empty submit** → `aria-invalid` fields, still on login URL.
- **Missing password** → uses `partialUser` from `login.json`.

### 5. Authentication

- **Invalid credentials** → remains on login page.
- **Valid login** (EN and NL) via `loginWithOptionalOtp()`:
  1. Set language via `LoginPage.switchLanguage`.
  2. Fill tenant, email, password and submit.
  3. **If OTP appears** → enter valid OTP, then dashboard.
  4. **If not** → go directly to dashboard.
  5. `DashboardPage.assertPageLoaded(language)` checks URL, title, logo, and nav label.

### 6. OTP (optional — skips if not shown)

Only runs when staging requires OTP for your device.

### 7. Logout

`loginWithOptionalOtp()` → dashboard → profile menu → Logout → back to login page.

---

## Architecture

| Layer                        | Role                                              |
| ---------------------------- | ------------------------------------------------- |
| **Specs** (`*.spec.js`)      | Describe blocks, arrange data, call page objects  |
| **Page objects** (`pages/`)  | Selectors, actions, assertions per screen         |
| **Fixtures** (`fixtures/`)   | Static test data and i18n expectations            |
| **`.env`**                   | Secrets and overrides (not in git)                |

Page objects are classes that receive Playwright `page` in the constructor:

```javascript
const loginPage = new LoginPage(page);
await loginPage.visit();
```

---

## Configuration

- **`playwright.config.js`**: `baseURL`, retries, reporters, Chromium project.
- **Secrets**: only in `.env` or `LOGIN_*` / `OTP_VALID` environment variables — never in committed fixtures.

---

## Troubleshooting

| Issue                       | What to try                                              |
| --------------------------- | -------------------------------------------------------- |
| `npm` / `node` not found    | Reinstall Node.js; restart terminal                      |
| Browser not installed       | Run `npx playwright install`                           |
| Login success tests skipped | Create `.env` with `LOGIN_PASSWORD`                      |
| Flaky language tests        | Re-run; toggle retries EN↔NL if labels lag               |
| Wrong environment           | Confirm `baseURL` in `playwright.config.js` is staging   |

---

## License

Internal / project use — adjust as needed for your organization.
