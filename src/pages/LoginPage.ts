import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — Page Object for the PRAGMA authentication page.
 *
 * Covers:
 *  - Login form interactions
 *  - Error state validation
 *  - Logout
 *
 * @url /login  (or root `/` if redirected)
 */
export class LoginPage extends BasePage {
    // ─── Locators (using data-testid for stability) ─────────────────────────
    private get emailInput() {
        return this.page.getByTestId('email-input');
    }

    private get passwordInput() {
        return this.page.getByTestId('password-input');
    }

    private get submitButton() {
        return this.page.getByTestId('login-submit-btn');
    }

    private get errorMessage() {
        return this.page.getByTestId('login-error-message');
    }


    // ─── Navigation ────────────────────────────────────────────────────────
    async navigate(): Promise<this> {
        await this.goto('/login');
        return this;
    }

    // ─── Actions ───────────────────────────────────────────────────────────

    /**
     * Complete login flow with credentials.
     * Returns `this` for fluent chaining.
     */
    async login(email: string, password: string): Promise<this> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
        return this;
    }

    /**
     * Attempts login and expects success — waits for dashboard URL
     */
    async loginAsUser(email: string, password: string): Promise<void> {
        await this.login(email, password);
        await this.waitForURL(/\/dashboard|\/home|\/strategy/);
    }

    // ─── Assertions ────────────────────────────────────────────────────────

    /**
     * Assert that the login form is visible (page has loaded)
     */
    async expectLoginFormVisible(): Promise<void> {
        await expect(this.submitButton).toBeVisible();
    }

    /**
     * Assert an error message is shown after failed login
     */
    async expectErrorMessage(message?: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        if (message) {
            await expect(this.errorMessage).toContainText(message);
        }
    }
}
