import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @a11y
 *
 * Accessibility Tests — Authentication
 * Focuses on keyboard operability and focus visibility.
 */
test.describe('Auth Accessibility — A11y', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
        await loginPage.expectLoginFormVisible();
    });

    test('should support keyboard-only focus progression on login form @a11y', async ({
        page,
    }) => {
        const emailInput = page.getByTestId('auth-login-email-input');
        const passwordInput = page.getByTestId('auth-login-password-input');
        const forgotPasswordLink = page.getByRole('link', { name: /Olvidaste tu contraseña/i });

        await test.step('Tab to email field', async () => {
            await page.keyboard.press('Tab');
            await expect(emailInput).toBeFocused();
        });

        await test.step('Tab to password field', async () => {
            await page.keyboard.press('Tab');
            await expect(passwordInput).toBeFocused();
        });

        await test.step('Continue keyboard navigation through the form', async () => {
            await page.keyboard.press('Tab');
            await expect(forgotPasswordLink).toBeFocused();
        });
    });

    test('should allow submitting invalid login using keyboard Enter key @a11y', async ({
        page,
    }) => {
        const emailInput = page.getByTestId('auth-login-email-input');
        const passwordInput = page.getByTestId('auth-login-password-input');

        await test.step('Fill invalid credentials with keyboard flow', async () => {
            await emailInput.fill('invalid@test.com');
            await passwordInput.fill('wrongpassword');
            await page.keyboard.press('Enter');
        });

        await test.step('Verify perceivable error feedback is shown', async () => {
            await expect(page.getByText('Invalid credentials or login failed.')).toBeVisible();
        });
    });
});

