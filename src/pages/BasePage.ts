import { Page, Locator } from '@playwright/test';

/**
 * BasePage — Abstract base class for all Page Object Model classes.
 *
 * Every page class must extend this to get shared utilities:
 *  - Navigation helpers
 *  - Common wait strategies
 *  - Test ID selectors (aligned with data-testid attributes)
 *
 * @pattern Page Object Model (POM) + Fluent Interface
 */
export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ─── Navigation ────────────────────────────────────────────────────────────

    /**
     * Navigate to a path relative to the baseURL configured in playwright.config.ts
     */
    async goto(path: string = '/'): Promise<this> {
        await this.page.goto(path);
        return this;
    }

    /**
     * Reload the current page
     */
    async reload(): Promise<this> {
        await this.page.reload();
        return this;
    }

    // ─── Locators ──────────────────────────────────────────────────────────────

    /**
     * Get element by data-testid attribute.
     * Preferred for stable, intent-revealing selectors.
     *
     * @example this.getByTestId('login-button')
     */
    protected getByTestId(testId: string): Locator {
        return this.page.getByTestId(testId);
    }

    /**
     * Get heading element by exact text
     */
    protected getHeading(name: string): Locator {
        return this.page.getByRole('heading', { name });
    }

    // ─── Wait Strategies ───────────────────────────────────────────────────────

    /**
     * Wait for the page network to become idle.
     * Use sparingly — prefer explicit element waiting.
     */
    async waitForPageLoad(): Promise<this> {
        await this.page.waitForLoadState('domcontentloaded');
        return this;
    }

    /**
     * Wait for a specific URL pattern
     */
    async waitForURL(urlOrPattern: string | RegExp): Promise<this> {
        await this.page.waitForURL(urlOrPattern);
        return this;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    /**
     * Returns the current page URL
     */
    get url(): string {
        return this.page.url();
    }

    /**
     * Returns the current page title
     */
    async getTitle(): Promise<string> {
        return this.page.title();
    }

    // ─── Utilities ─────────────────────────────────────────────────────────────

    /**
     * Take a named screenshot (saved to test-results/ on failure automatically)
     */
    async screenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
    }
}
