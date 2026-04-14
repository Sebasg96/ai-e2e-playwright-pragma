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

    private get toggleMenuButton() {
        return this.page.getByRole('button', { name: 'Toggle Menu' });
    }

    private get hubLogoutButton() {
        return this.page.getByRole('button', { name: 'Logout' });
    }

    private get strategyHubLink() {
        return this.page.getByRole('link', { name: /Gestionar Estrategia/ });
    }

    private get dashboardHubLink() {
        return this.page.getByRole('link', { name: /Dashboard/ });
    }





    // ─── Navigation ────────────────────────────────────────────────────────
    async navigate(): Promise<this> {
        await this.goto('/dashboard');
        return this;
    }

    async goToStrategy(): Promise<this> {
        const isHub = await this.strategyHubLink.isVisible();
        if (isHub) {
            await this.strategyHubLink.click();
        } else {
            await this.strategyNavLink.click();
        }
        await this.waitForURL(/\/strategy/);
        return this;
    }

    // ─── Actions ───────────────────────────────────────────────────────────

    /**
     * Log out the current user (handles both Hub and Module layouts)
     */
    async logout(): Promise<void> {
        const isHub = await this.hubLogoutButton.isVisible();
        if (isHub) {
            await this.hubLogoutButton.click();
        } else {
            await this.userMenuButton.click();
            await this.logoutButton.click();
        }
        await this.waitForURL(/\/login/);
    }

    // ─── Assertions ────────────────────────────────────────────────────────

    /**
     * Verify the user is authenticated (handles Hub, Sidebar, or Collapsed Sidebar)
     */
    async expectDashboardLoaded(): Promise<void> {
        // 1. Check if we are on the Hub page
        const isHub = await this.strategyHubLink.isVisible();
        if (isHub) return;

        // 2. Check for Sidebar (Module page, expanded)
        const isSidebar = await this.sidebarNav.isVisible();
        if (isSidebar) return;

        // 3. Check for Toggle Menu (Module page, collapsed)
        await expect(this.toggleMenuButton.or(this.dashboardHubLink)).toBeVisible();
    }

    /**
     * Verify no user is authenticated (sidebar not visible)
     */
    async expectLoggedOut(): Promise<void> {
        await expect(this.page).toHaveURL(/\/login/);
    }
}
