# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests by tier
npm run test:smoke        # @smoke — Tier 0, critical path, <2min
npm run test:sanity       # @sanity — Tier 1, core features, <10min (used in PRs)
npm run test:regression   # @regression — Tier 2-3, full coverage, <30min (nightly)
npm run test:a11y         # @a11y — Accessibility WCAG 2.1 AA

# Run a single test file
npx playwright test tests/smoke/login.spec.ts

# Run a single test by title
npx playwright test --grep "should display login form"

# Run with specific browser
npx playwright test --project=chromium

# Debug and development
npm run test:headed       # Visible browser
npm run test:debug        # Step-by-step pausing
npm run test:ui           # Interactive test explorer

# Reports
npm run report            # Open HTML report
npm run report:allure     # Generate and open Allure report

# Code quality
npm run lint
npm run lint:fix
npm run type-check

# Test data cleanup
npm run clean:testdata    # Prisma-based DB cleanup (preserves users/tenant)
```

## Architecture

### Test Tiering

| Tag | Scope | Trigger | Target |
|-----|-------|---------|--------|
| `@smoke` | Critical path (login, auth) | Every commit | <2 min |
| `@sanity` | Core features (dashboard, nav) | Every PR | <10 min |
| `@regression` | Full coverage, multi-browser | Nightly 2 AM UTC | <30 min |
| `@a11y` | WCAG 2.1 AA compliance | PR + nightly | — |

### Page Object Model

```
BasePage (abstract)
├── LoginPage     — /login form, auth actions, error assertions
└── DashboardPage — hub/module layouts, navigation, logout, session checks
```

`BasePage` provides: `goto(path)`, `reload()`, `getByTestId()`, `getHeading()`, `waitForPageLoad()`, `waitForURL()`, `screenshot()`. Page methods return `this` for chaining.

### Custom Fixtures

Import `test` and `expect` from `@fixtures/base.fixture` — never directly from `@playwright/test`. The fixture pre-instantiates `loginPage` and `dashboardPage` per test.

### Authentication Flow

`tests/auth.setup.ts` runs once before all test projects, saves the authenticated session to `playwright/.auth/user.json`. All test projects load this storage state — tests start already authenticated and never re-login.

### Path Aliases (tsconfig)

```
@pages/*    → src/pages/*
@fixtures/* → src/fixtures/*
@helpers/*  → src/helpers/*
@data/*     → src/data/*
```

### Environment

Copy `.env.example` to `.env`. Required vars: `BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`. Optional: `TEST_TENANT_ID`, `DATABASE_URL` (needed for `clean:testdata`), `ENVIRONMENT`.

## Key Patterns

**Locator priority** (strictly enforced):
1. `data-testid` via `getByTestId()` / `page.locator('[data-testid="x"]')`
2. ARIA role via `getByRole()`
3. Label via `getByLabel()`
4. Text via `getByText()` — last resort only

No CSS selectors or XPath.

**Assertions** — web-first only:
```ts
await expect(locator).toBeVisible();
await expect(page).toHaveURL(/pattern/);
await expect(locator).toContainText('text');
```

**Test structure:**
```ts
test.describe('Feature @smoke', () => {
  test.beforeEach(async ({ loginPage }) => { ... });

  test('should do X', async ({ dashboardPage }) => {
    await test.step('Navigate', async () => { ... });
    await test.step('Assert', async () => { ... });
  });
});
```

**No `waitForTimeout()`** — rely on Playwright auto-waiting and web-first assertions. Use `waitUntil: 'domcontentloaded'` in `goto()` for SPAs.

**Multi-layout handling** — `DashboardPage` checks visibility before interacting (Hub vs. Module sidebar layouts). Use `.or()` combinator and `.isVisible()` checks for conditional UI.

## AI Agents

Located in `.github/agents/`:
- **playwright-test-planner** — Explores app, generates test plans saved to `docs/test-plans/`
- **playwright-test-generator** — Generates spec files from test plans
- **playwright-test-healer** — Debugs and repairs failing/broken tests
- **flaky-test-hunter** — Identifies intermittent failures

Instructions and coding standards in `.github/instructions/`. Skill reference in `.github/skills/playwright-e2e-testing/SKILL.md`.

## CI/CD

GitHub Actions (`.github/workflows/playwright-tests.yml`):
- Smoke → every push to `main`/`develop`
- Sanity → every PR (depends on smoke passing)
- Regression → nightly matrix across chromium/firefox/webkit + manual trigger
- A11y → every PR + nightly

All jobs run `npm run clean:testdata` after tests. Reports uploaded as artifacts (7/14/30 days by tier).
