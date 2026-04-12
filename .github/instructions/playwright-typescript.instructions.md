---
description: 'Playwright TypeScript test generation standards for the PRAGMA E2E framework'
applyTo: 'tests/**/*.spec.ts,src/pages/**/*.ts,src/fixtures/**/*.ts'
---

## Test Writing Guidelines

### Code Quality Standards
- **Locators**: Use `getByTestId()` first (PRAGMA uses `data-testid` attributes throughout). Fall back to `getByRole()`, `getByLabel()`, `getByText()` in that order.
- **Never** use CSS selectors (`.btn-primary`) or XPath (`//div[@class=...]`) — they are brittle.
- **Assertions**: Use auto-retrying web-first assertions with `await`. Example: `await expect(locator).toHaveText('value')`.
- **Timeouts**: Rely on Playwright's built-in auto-waiting. Never use `await page.waitForTimeout(N)`.
- **Page Object Model (POM)**: Every test must interact with the UI through classes in `src/pages/`. Tests contain business logic, POMs contain UI implementation details.
- **Fixtures**: Import `test` and `expect` from `src/fixtures/base.fixture` (not from `@playwright/test` directly).
- **Fluent Interface**: POM methods return `this` or the next page object for method chaining.
- **Test Steps**: Use `test.step()` to group interactions — improves readability in reports.

### Test Structure
```typescript
import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('Feature — Tier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/relevant-path');
  });

  test('should do something @tag', async ({ loginPage }) => {
    await test.step('Perform action', async () => {
      await loginPage.login('user@example.com', 'pass');
    });

    await test.step('Verify result', async () => {
      await expect(page).toHaveURL(/dashboard/);
    });
  });
});
```

### File Organization
| Tier | Directory | Tag | Run condition |
|---|---|---|---|
| Smoke | `tests/smoke/` | `@smoke` | Every commit |
| Sanity | `tests/sanity/` | `@sanity` | Every PR |
| Regression | `tests/regression/` | `@regression` | On merge |
| A11y | `tests/a11y/` | `@a11y` | Nightly |

### Locator Strategy (Priority Order)
```typescript
// ✅ BEST: data-testid (PRAGMA convention — stable)
page.getByTestId('strategy-dashboard')
page.getByTestId('login-submit-btn')

// ✅ GOOD: Role-based (accessible, resilient)
page.getByRole('button', { name: 'Create OKR' })
page.getByRole('textbox', { name: 'Key Result title' })

// ✅ GOOD: Label-based
page.getByLabel('Email address')

// ⚠️ FALLBACK: Visible text
page.getByText('Welcome to PRAGMA')

// ❌ NEVER: CSS selectors or XPath
page.locator('.btn-primary')          // brittle
page.locator('//div[@class="modal"]') // very brittle
```

### Assertion Best Practices
- `toHaveURL(/pattern/)` — verify navigation
- `toBeVisible()` — verify element is shown
- `toHaveText('...')` — exact text match
- `toContainText('...')` — partial text match
- `toHaveCount(N)` — verify number of elements
- `toMatchAriaSnapshot(...)` — verify a11y tree structure

### Quality Checklist
Before committing tests, verify:
- [ ] All locators use `getByTestId` or role-based selectors
- [ ] Tests import from `src/fixtures/base.fixture`
- [ ] Each test has `@smoke`, `@sanity`, `@regression`, or `@a11y` tag
- [ ] No `waitForTimeout` or hardcoded wait calls
- [ ] POM classes used for all UI interactions
- [ ] `test.step()` used for major action groups
- [ ] Test title follows convention: `should <action> when <condition>`
