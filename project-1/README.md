# STMS Cypress E2E Tests

End-to-end tests for the **Smart Transport Management System (STMS)** staging login and dashboard, using [Cypress](https://www.cypress.io/) with the Page Object Model.

**Target:** `https://stage.stms.pandagizmo.com`

---

## Prerequisites

Install these before setting up the project:

| Requirement | Version | Notes |
|-------------|---------|--------|
| **Node.js** | 18+ (LTS recommended) | Includes `npm` |
| **Git** | Any recent version | To clone the repo |

### macOS

1. Install **Node.js** (pick one):
   - [nodejs.org](https://nodejs.org/) — download the LTS installer
   - **Homebrew:** `brew install node`
2. Verify in Terminal:

```bash
node -v
npm -v
```

### Windows

1. Install **Node.js** from [nodejs.org](https://nodejs.org/) (LTS `.msi` installer).
   - During setup, leave **“Add to PATH”** enabled.
2. Open **Command Prompt** or **PowerShell** and verify:

```cmd
node -v
npm -v
```

---

## Clone the repository

Install **Git** if you do not have it yet:

- **macOS:** `brew install git` or [git-scm.com](https://git-scm.com/download/mac)
- **Windows:** [git-scm.com](https://git-scm.com/download/win) (use default options; **Git Bash** is included)

Repository: [https://github.com/Shahirah-Wolfiz/cypress](https://github.com/Shahirah-Wolfiz/cypress)

Tests live in the `project-1` folder inside the repo.

### macOS

```bash
# HTTPS (recommended — works out of the box)
git clone https://github.com/Shahirah-Wolfiz/cypress.git

cd cypress/project-1
```

**SSH** (if you use SSH keys with GitHub):

```bash
git clone git@github.com:Shahirah-Wolfiz/cypress.git
cd cypress/project-1
```

### Windows

**Git Bash**, **PowerShell**, or **Command Prompt:**

```bash
git clone https://github.com/Shahirah-Wolfiz/cypress.git
cd cypress/project-1
```

Or in **Command Prompt** with a custom folder name:

```cmd
git clone https://github.com/Shahirah-Wolfiz/cypress.git
cd cypress\project-1
```

> **Private repo:** GitHub may prompt for your username and a [Personal Access Token](https://github.com/settings/tokens) instead of a password when cloning over HTTPS.

**Update an existing clone** (pull latest changes):

```bash
cd cypress/project-1
git pull
```

---

## Installation

Run these from the `project-1` directory (after cloning).

### macOS

```bash
# Install dependencies (Cypress is included)
npm install

# Optional: open Cypress once so it downloads the browser binary
npx cypress open
```

### Windows

```cmd
npm install
npx cypress open
```

> **First run:** Cypress may download its bundled browser. Allow network access if prompted (firewall/antivirus).

---

## Credentials (required for login tests)

Successful login tests need a real password. **Do not commit secrets.**

1. Copy the example env file:

```bash
# macOS / Linux / Git Bash on Windows
cp cypress.env.example.json cypress.env.json
```

```cmd
REM Windows Command Prompt
copy cypress.env.example.json cypress.env.json
```

2. Edit `cypress.env.json` with valid staging credentials:

```json
{
  "loginTenant": "traders",
  "loginEmail": "traders@yopmail.com",
  "loginPassword": "your-actual-password"
}
```

`cypress.env.json` is gitignored. If `loginPassword` is missing, authentication success tests are **skipped** automatically.

You can also override values at runtime:

```bash
# macOS / Linux
CYPRESS_loginPassword=secret npm run cy:run:login
```

```cmd
REM Windows PowerShell
$env:CYPRESS_loginPassword="secret"; npm run cy:run:login
```

---

## Running tests

| Command | Description |
|---------|-------------|
| `npm run cy:open` | Interactive Cypress UI — pick specs and watch runs |
| `npm run cy:run` | Headless run of all specs |
| `npm run cy:run:login` | Headless run of login spec only |

### macOS

```bash
npm run cy:open          # interactive
npm run cy:run:login     # CI-style, login only
```

### Windows

```cmd
npm run cy:open
npm run cy:run:login
```

Artifacts on failure: `cypress/screenshots/`, `cypress/videos/` (gitignored).

---

## Project structure

```
project-1/
├── cypress.config.js          # baseUrl, spec pattern, env settings
├── cypress.env.example.json   # template for secrets (copy → cypress.env.json)
├── cypress/
│   ├── e2e/login/
│   │   └── login.cy.js        # login test suite
│   ├── fixtures/
│   │   ├── login.json         # test users (valid, invalid, partial)
│   │   └── i18n.json          # EN/NL expected labels
│   ├── pages/
│   │   ├── LoginPage.js       # login page actions & assertions
│   │   ├── DashboardPage.js   # post-login dashboard checks
│   │   └── components/
│   │       └── LanguageToggle.js  # EN/NL switcher (shared)
│   └── support/
│       ├── e2e.js             # global hooks / imports
│       └── commands.js        # custom commands (if added)
└── package.json
```

---

## Test flow (end to end)

Tests run against **staging STMS**. Each spec uses `baseUrl` from `cypress.config.js`; page objects call `cy.visit()` with paths like `/en/unauth/login`.

### 1. Visit login page

`LoginPage.visit()` opens `/en/unauth/login`. Every test starts here (`beforeEach`).

### 2. UI checks

- Page loads with labels matching the **current** language (EN or NL), detected from visible text.
- **Forgot password** link navigates to `/unauth/forgot-password`.

### 3. Language toggle (EN / NL)

`LanguageToggle` clicks the flag control and asserts labels from `cypress/fixtures/i18n.json`:

- Login: Company/Bedrijf, Email/E-mail, Password/Wachtwoord, etc.
- Language is **client-side** (URL stays under `/en/`); tests assert **label text**, not URL locale.

Scenarios cover: EN only, NL only, EN→NL, NL→EN.

### 4. Form validation

- **Empty submit** → `aria-invalid` fields, still on login URL.
- **Missing password** → uses `partialUser` from `login.json`, same validation behavior.

### 5. Authentication

- **Invalid credentials** (`invalidUser` fixture) → remains on login page.
- **Valid login** (EN and NL):
  1. Set language via `LoginPage.switchLanguage`.
  2. Fill tenant, email, password (`cypress.env.json` overrides fixture defaults).
  3. Submit → redirect to dashboard.
  4. `DashboardPage.assertPageLoaded(language)` checks URL (`/en/d/dashboard`), title, logo, and localized nav label (“General” / “Algemeen”).

If no password is configured, success scenarios call `this.skip()`.

---

## Architecture

| Layer | Role |
|-------|------|
| **Specs** (`login.cy.js`) | Describe blocks, arrange data, call page objects |
| **Page objects** | Selectors, actions, assertions per screen |
| **Fixtures** | Static test data and i18n expectations |
| **`cypress.env.json`** | Secrets and overrides (not in git) |

Page objects export singleton instances (`export default new LoginPage()`), so specs import and chain methods without instantiating classes in each test.

---

## Configuration

- **`cypress.config.js`**: `baseUrl`, `specPattern`, `allowCypressEnv: false` (env vars use `CYPRESS_*` prefix or `cypress.env.json` via `cy.env()`).
- **Secrets**: only in `cypress.env.json` or `CYPRESS_*` environment variables — never in fixtures committed to git.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `npm` / `node` not found | Reinstall Node.js; restart terminal; confirm PATH on Windows |
| Cypress won’t open | Run `npx cypress install`; check antivirus/firewall |
| Login success tests skipped | Create `cypress.env.json` with `loginPassword` |
| Flaky language tests | Staging UI timing — re-run; language toggle retries EN↔NL if labels lag |
| Wrong environment | Confirm `baseUrl` in `cypress.config.js` points to staging |

---

## License

Internal / project use — adjust as needed for your organization.
