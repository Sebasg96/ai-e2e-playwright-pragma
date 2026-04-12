import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage — Page Object for the PRAGMA main dashboard/home.
 *
 * This is the landing page after successful authentication.
 */
export class DashboardPage extends BasePage {
    // ─── Locators ──────────────────────────────────────────────────────────
    private get userMenuButton() {
        return this.page.getByTestId('user-menu-btn');
    }

    private get logoutButton() {
        return this.page.getByTestId('logout-btn');
    }

    private get sidebarNav() {
        return this.page.getByTestId('sidebar-nav');
    }

    private get strategyNavLink() {
        return this.page.getByTestId('nav-strategy');
    }



    // ─── Navigation ────────────────────────────────────────────────────────
    async navigate(): Promise<this> {
        await this.goto('/dashboard');
        return this;
    }

    async goToStrategy(): Promise<this> {
        await this.strategyNavLink.click();
        await this.waitForURL(/\/strategy/);
        return this;
    }

    // ─── Actions ───────────────────────────────────────────────────────────

    /**
     * Log out the current user via the user menu
     */
    async logout(): Promise<void> {
        await this.userMenuButton.click();
        await this.logoutButton.click();
        await this.waitForURL(/\/login/);
    }

    // ─── Assertions ────────────────────────────────────────────────────────

    /**
     * Verify we are on the dashboard (post-login landing)
     */
    async expectDashboardLoaded(): Promise<void> {
        await expect(this.sidebarNav).toBeVisible();
    }

    /**
     * Verify no user is authenticated (sidebar not visible)
     */
    async expectLoggedOut(): Promise<void> {
        await expect(this.page).toHaveURL(/\/login/);
    }
}
