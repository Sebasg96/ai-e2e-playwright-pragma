---
name: playwright-e2e-testing
description: >
  Use this skill when writing or reviewing Playwright TypeScript E2E tests with Page Object Model
  patterns, stable locators (data-testid priority), custom fixtures, and web-first assertions.
  Triggers for: "write Playwright tests", "create E2E tests", "POM pattern", "stable locators".
---

# Playwright E2E Testing Skill

## What This Skill Covers
- Page Object Model (POM) architecture
- Custom Playwright fixtures
- Locator strategy with data-testid priority
- Web-first assertions and auto-waiting
- Test organization and tiering

## POM Architecture

### BasePage Pattern
```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    return this;
  }
}
```

### Page Object Pattern
```typescript
export class FeaturePage extends BasePage {
  // Locators as getters (lazy — not evaluated until accessed)
  private get submitBtn() { return this.page.getByTestId('submit-btn'); }
  private get titleInput() { return this.page.getByTestId('title-input'); }

  // Actions
  async createItem(title: string) {
    await this.titleInput.fill(title);
    await this.submitBtn.click();
    return this; // fluent
  }

  // Assertions
  async expectItemVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }
}
```

## Custom Fixtures Pattern
```typescript
import { test as base } from '@playwright/test';
import { FeaturePage } from '@pages/FeaturePage';

export const test = base.extend<{ featurePage: FeaturePage }>({
  featurePage: async ({ page }, use) => {
    await use(new FeaturePage(page));
  },
});
```

## Locator Priority Quick Reference
| Priority | Method | When to Use |
|---|---|---|
| 1 | `getByTestId('id')` | Stable, explicit — PRAGMA default |
| 2 | `getByRole('button', {name})` | Semantic elements |
| 3 | `getByLabel('Field name')` | Form inputs |
| 4 | `getByText('content')` | User-visible text |
| ❌ | `.locator('.css-class')` | Never — brittle |

## Web-First Assertions
```typescript
// ✅ These auto-retry until timeout
await expect(locator).toBeVisible();
await expect(locator).toHaveText('value');
await expect(locator).toHaveCount(3);
await expect(page).toHaveURL(/pattern/);

// ❌ These do NOT auto-retry
const isVisible = await locator.isVisible(); // evaluate once, fragile
```

## Test Steps for Better Reports
```typescript
test('complex scenario @smoke', async ({ featurePage }) => {
  await test.step('Setup: navigate to feature', async () => {
    await featurePage.navigate();
  });

  await test.step('Action: create new item', async () => {
    await featurePage.createItem('My OKR');
  });

  await test.step('Verify: item appears in list', async () => {
    await featurePage.expectItemVisible('My OKR');
  });
});
```
