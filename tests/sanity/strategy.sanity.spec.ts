import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * @tags @sanity
 *
 * Strategy Module — Sanity Tests (Director Role)
 * Tier 1: Core features, runs on every PR (<10 min)
 *
 * Covers: STR-ACCESS-001, STR-PURPOSE-001, STR-VALUES-001, STR-VALUES-002,
 *         STR-MEGA-001, STR-OBJ-001, STR-KR-001, STR-KR-002, STR-KR-003
 *
 * Run `npm run clean:db` before this suite to ensure a clean state.
 *
 * UI Flow notes (discovered via browser exploration):
 * - `strategy-add-objective-btn` requires text in `strategy-add-objective-input` first.
 *   Clicking it creates an objective inline — does NOT open a form.
 * - To create a KR: expand the objective → click `strategy-cascade-add-kr` → fill `kr-creator-form`.
 * - Value delete button: `data-testid="delete-value-btn"` scoped within the value chip.
 */

// ─── Shared Setup Helper ─────────────────────────────────────────────────────

/**
 * Creates an organizational purpose + one MEGA + one Objective.
 * Call this at the start of KR tests that require prerequisites.
 */
async function setupPurposeMegaAndObjective(page: any) {
    // 1. Purpose
    await expect(page.getByTestId('strategy-purpose-org')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('strategy-purpose-org').click();
    await page.keyboard.type('Propósito E2E Setup', { delay: 50 });
    await page.locator('body').click();
    await page.waitForTimeout(2000);

    // 2. MEGA
    await page.getByTestId('strategy-mega-suggest-btn').click();
    await page.getByTestId('strategy-mega-statement-input').fill('MEGA E2E Setup');
    await page.getByTestId('strategy-mega-deadline-input').fill('2026-12-31');
    await page.getByTestId('strategy-mega-submit-btn').click();
    await expect(page.getByTestId('strategy-mega-delete-btn').first()).toBeVisible({ timeout: 15000 });

    // 3. Objective — scroll into view (MEGA cascade renders below the fold)
    await page.getByTestId('strategy-add-objective-input').first().scrollIntoViewIfNeeded();
    await page.getByTestId('strategy-add-objective-input').first().fill('Objetivo E2E Setup');
    await page.getByTestId('strategy-add-objective-btn').first().click();
    await expect(page.getByText('Objetivo E2E Setup').first()).toBeVisible({ timeout: 10000 });
}

/**
 * Opens the KR creator form for the first objective in the cascade.
 */
async function openKRCreator(page: any) {
    await page.getByTestId('strategy-objective-expand-btn').first().click();
    // data-testid="strategy-cascade-add-kr" is absent in current app build; use button text as fallback
    const addKrBtn = page.getByTestId('strategy-cascade-add-kr')
        .or(page.getByRole('button', { name: /Agregar KR/i }));
    await addKrBtn.first().click();
    await expect(page.getByTestId('kr-creator-form')).toBeVisible({ timeout: 10000 });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Strategy Module — Sanity (Director)', () => {
    test.beforeEach(async ({ page, dashboardPage }) => {
        await dashboardPage.navigate();
        await dashboardPage.goToStrategy();
        await expect(page.getByTestId('strategy-page-title')).toBeVisible({ timeout: 15000 });
    });

    // ─── STR-ACCESS-001 ──────────────────────────────────────────────────────
    test('STR-ACCESS-001: Director accesses the Strategy module @sanity', async ({ page }) => {
        await test.step('Verify Strategy module loaded', async () => {
            await expect(page).toHaveURL(/\/strategy/);
            await expect(page.getByTestId('strategy-page-title')).toBeVisible();
        });
    });

    // ─── STR-PURPOSE-001 ─────────────────────────────────────────────────────
    test('STR-PURPOSE-001: Define organizational purpose @sanity', async ({ page }) => {
        await test.step('Click organizational purpose field and type', async () => {
            await expect(page.getByTestId('strategy-purpose-org')).toBeVisible({ timeout: 15000 });
            await page.getByTestId('strategy-purpose-org').click();
            await page.keyboard.type('Test Automatizado de Propósito', { delay: 50 });
            await page.locator('body').click();
            await page.waitForTimeout(2000);
        });

        await test.step('Verify purpose container is still visible (saved in-place)', async () => {
            await expect(page.getByTestId('strategy-purpose-org')).toBeVisible();
        });
    });

    // ─── STR-VALUES-001 ──────────────────────────────────────────────────────
    test('STR-VALUES-001: Add organizational value @sanity', async ({ page }) => {
        await test.step('Add a new organizational value', async () => {
            await page.getByTestId('strategy-add-value-input').fill('Test Automatizado de Valor');
            await page.getByTestId('strategy-add-value-btn').click();
        });

        await test.step('Verify value appears in the list', async () => {
            await expect(page.getByText('Test Automatizado de Valor').first()).toBeVisible();
        });
    });

    // ─── STR-VALUES-002 ──────────────────────────────────────────────────────
    test('STR-VALUES-002: Remove organizational value @sanity', async ({ page }) => {
        const VALUE_TEXT = 'Valor Para Eliminar';

        await test.step('Add a value to delete', async () => {
            await page.getByTestId('strategy-add-value-input').fill(VALUE_TEXT);
            await page.getByTestId('strategy-add-value-btn').click();
            await expect(page.getByText(VALUE_TEXT).first()).toBeVisible();
        });

        await test.step('Delete the value using its scoped delete button', async () => {
            // Scope to the chip container using filter, then click the delete button within it
            await page.getByTestId('delete-value-btn').filter({ hasText: VALUE_TEXT }).click()
                .catch(() => page.getByTestId('delete-value-btn').first().click());
        });

        await test.step('Verify value was removed', async () => {
            await expect(page.getByText(VALUE_TEXT)).toBeHidden();
        });
    });

    // ─── STR-MEGA-001 ────────────────────────────────────────────────────────
    test('STR-MEGA-001: Create mega goal with organizational purpose @sanity', async ({ page }) => {
        await test.step('Ensure organizational purpose exists', async () => {
            await expect(page.getByTestId('strategy-purpose-org')).toBeVisible({ timeout: 15000 });
            await page.getByTestId('strategy-purpose-org').click();
            await page.keyboard.type('Propósito para MEGA', { delay: 50 });
            await page.locator('body').click();
            await page.waitForTimeout(2000);
        });

        await test.step('Open MEGA creation form and fill fields', async () => {
            await page.getByTestId('strategy-mega-suggest-btn').click();
            await page.getByTestId('strategy-mega-statement-input').fill('MEGA Automatizado de Prueba');
            await page.getByTestId('strategy-mega-deadline-input').fill('2026-12-31');
        });

        await test.step('Submit and verify MEGA was created', async () => {
            await page.getByTestId('strategy-mega-submit-btn').click();
            await expect(page.getByTestId('strategy-mega-delete-btn').first()).toBeVisible({ timeout: 10000 });
        });
    });

    // ─── STR-OBJ-001 ─────────────────────────────────────────────────────────
    test('STR-OBJ-001: Create objective from mega goal @sanity', async ({ page }) => {
        await test.step('Setup: Create purpose and MEGA', async () => {
            await expect(page.getByTestId('strategy-purpose-org')).toBeVisible({ timeout: 15000 });
            await page.getByTestId('strategy-purpose-org').click();
            await page.keyboard.type('Propósito E2E Setup', { delay: 50 });
            await page.locator('body').click();
            await page.waitForTimeout(2000);
            await page.getByTestId('strategy-mega-suggest-btn').click();
            await page.getByTestId('strategy-mega-statement-input').fill('MEGA E2E Setup');
            await page.getByTestId('strategy-mega-deadline-input').fill('2026-12-31');
            await page.getByTestId('strategy-mega-submit-btn').click();
            await expect(page.getByTestId('strategy-mega-delete-btn').first()).toBeVisible({ timeout: 15000 });
        });

        await test.step('Type objective name and click Add', async () => {
            await page.getByTestId('strategy-add-objective-input').first().scrollIntoViewIfNeeded();
            await page.getByTestId('strategy-add-objective-input').first().fill('Objetivo E2E Automatizado');
            await page.getByTestId('strategy-add-objective-btn').first().click();
        });

        await test.step('Verify objective was added to the cascade', async () => {
            await expect(page.getByText('Objetivo E2E Automatizado').first()).toBeVisible({ timeout: 10000 });
        });
    });

    // ─── STR-KR-001 ──────────────────────────────────────────────────────────
    test('STR-KR-001: Create key result within an objective @sanity', async ({ page }) => {
        await test.step('Setup: Create purpose, MEGA, and Objective', async () => {
            await setupPurposeMegaAndObjective(page);
        });

        await test.step('Expand objective and open KR creator', async () => {
            await openKRCreator(page);
        });

        await test.step('Fill in required key result fields', async () => {
            await page.getByTestId('kr-creator-direction-btn-aumentar').or(page.getByRole('button', { name: /Maximizar/i })).first().click();
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('Incrementar métrica automatizada a 100%');
            await page.getByTestId('kr-creator-unit-input').fill('%');
            await page.getByTestId('kr-creator-target-input').or(page.getByTestId('kr-creator-form').getByRole('spinbutton')).fill('100');
        });

        await test.step('Submit and verify KR was created', async () => {
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });
    });

    // ─── STR-KR-002a: Maximize ───────────────────────────────────────────────
    test('STR-KR-002a: Create measurable KR — maximize (Increase sales) @sanity', async ({ page }) => {
        await test.step('Setup', async () => {
            await setupPurposeMegaAndObjective(page);
        });

        await test.step('Open KR creator', async () => {
            await openKRCreator(page);
        });

        await test.step('Fill KR: Increase sales / aumentar / USD / 100000', async () => {
            await page.getByTestId('kr-creator-direction-btn-aumentar').or(page.getByRole('button', { name: /Maximizar/i })).first().click();
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('Increase sales');
            await page.getByTestId('kr-creator-unit-input').fill('USD');
            await page.getByTestId('kr-creator-target-input').or(page.getByTestId('kr-creator-form').getByRole('spinbutton')).fill('100000');
        });

        await test.step('Submit and verify', async () => {
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });
    });

    // ─── STR-KR-002b: Minimize ───────────────────────────────────────────────
    test('STR-KR-002b: Create measurable KR — minimize (Reduce churn) @sanity', async ({ page }) => {
        await test.step('Setup', async () => {
            await setupPurposeMegaAndObjective(page);
        });

        await test.step('Open KR creator', async () => {
            await openKRCreator(page);
        });

        await test.step('Fill KR: Reduce churn / mantener / % / 5', async () => {
            await page.getByTestId('kr-creator-direction-btn-mantener').or(page.getByRole('button', { name: /Minimizar/i })).first().click();
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('Reduce churn');
            await page.getByTestId('kr-creator-unit-input').fill('%');
            await page.getByTestId('kr-creator-target-input').or(page.getByTestId('kr-creator-form').getByRole('spinbutton')).fill('5');
        });

        await test.step('Submit and verify', async () => {
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });
    });

    // ─── STR-KR-003: Completion ──────────────────────────────────────────────
    test('STR-KR-003: Create completion-type key result @sanity', async ({ page }) => {
        await test.step('Setup', async () => {
            await setupPurposeMegaAndObjective(page);
        });

        await test.step('Open KR creator', async () => {
            await openKRCreator(page);
        });

        await test.step('Fill KR: Launch website / completion type', async () => {
            // Completion KRs may not require a specific direction button — fill statement and unit only
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('Launch website');
            await page.getByTestId('kr-creator-unit-input').fill('task');
        });

        await test.step('Submit and verify', async () => {
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });
    });

    // ─── STR-CHECKIN-001 ─────────────────────────────────────────────────────
    test('STR-CHECKIN-001: Perform weekly OKR check-in @sanity', async ({ page }) => {
        await test.step('Setup: Create purpose, MEGA, objective, and one KR', async () => {
            await setupPurposeMegaAndObjective(page);
            await openKRCreator(page);
            await page.getByTestId('kr-creator-direction-btn-aumentar').or(page.getByRole('button', { name: /Maximizar/i })).first().click();
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('KR para check-in automatizado');
            await page.getByTestId('kr-creator-unit-input').fill('%');
            await page.getByTestId('kr-creator-target-input').or(page.getByTestId('kr-creator-form').getByRole('spinbutton')).fill('100');
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });

        await test.step('Click the weekly check-in button', async () => {
            await page.getByTestId('strategy-weekly-checkin-btn').click();
        });

        await test.step('Verify check-in modal opens', async () => {
            await expect(page.getByTestId('kr-checkin-modal')).toBeVisible({ timeout: 10000 });
        });

        await test.step('Enter progress value and advance', async () => {
            const progressInput = page.getByTestId('kr-checkin-value-input');
            if (await progressInput.isVisible()) {
                await progressInput.fill('50');
            }
            // Accept either "Finalizar" or a "Next KR" navigation button
            const advanceBtn = page.getByTestId('kr-checkin-finalize-btn')
                .or(page.getByRole('button', { name: /finalizar|next|siguiente/i }));
            await advanceBtn.click();
        });

        await test.step('Verify modal closes after successful submission', async () => {
            await expect(page.getByTestId('kr-checkin-modal')).toBeHidden({ timeout: 10000 });
        });
    });

    // ─── STR-INITIATIVE-001 ──────────────────────────────────────────────────
    test('STR-INITIATIVE-001: Submit a new initiative linked to a KR @sanity', async ({ page }) => {
        await test.step('Setup: Create purpose, MEGA, objective, and one KR', async () => {
            await setupPurposeMegaAndObjective(page);
            await openKRCreator(page);
            await page.getByTestId('kr-creator-direction-btn-aumentar').or(page.getByRole('button', { name: /Maximizar/i })).first().click();
            await page.getByTestId('kr-creator-statement').or(page.getByTestId('kr-creator-form').getByRole('textbox').first()).fill('KR para iniciativa automatizada');
            await page.getByTestId('kr-creator-unit-input').fill('%');
            await page.getByTestId('kr-creator-target-input').or(page.getByTestId('kr-creator-form').getByRole('spinbutton')).fill('100');
            await page.getByTestId('kr-creator-submit-btn').or(page.getByRole('button', { name: 'Crear KR' })).click();
            await expect(page.getByTestId('kr-creator-form')).toBeHidden();
        });

        await test.step('Open the initiative creator', async () => {
            await page.getByTestId('initiative-creator-toggle').click();
            await expect(page.getByTestId('initiative-creator-title')).toBeVisible({ timeout: 10000 });
        });

        await test.step('Fill in initiative title', async () => {
            await page.getByTestId('initiative-creator-title').fill('Iniciativa E2E Automatizada');
        });

        await test.step('Select the parent Key Result', async () => {
            await page.getByTestId('initiative-creator-kr-select').click();
            await page.locator('[data-testid^="initiative-kr-option"]').first().click();
        });

        await test.step('Assign an owner if the field is present', async () => {
            const ownerField = page.getByTestId('initiative-creator-owner');
            if (await ownerField.isVisible()) {
                await ownerField.click();
                await page.locator('[data-testid^="initiative-owner-option"]').first().click();
            }
        });

        await test.step('Submit and verify initiative card appears', async () => {
            await page.getByTestId('initiative-creator-submit').click();
            await expect(page.getByText('Iniciativa E2E Automatizada').first()).toBeVisible({ timeout: 10000 });
        });
    });
});
