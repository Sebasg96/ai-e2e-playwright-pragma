import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Global Teardown hook for Playwright.
 * Executed once after all test suites complete.
 * 
 * Function: Calls the `cleanTestData.ts` script to wipe all the Strategy 
 * infrastructure generated during testing, guaranteeing the Tenant is reset.
 */
async function globalTeardown() {
    console.log('\n[Global Teardown] Initiating database cleanup...');

    // Ensure environment variables are loaded so cleanTestData.ts can access TEST_TENANT_ID
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });

    try {
        // Execute the CLI script symmetrically
        execSync('npx tsx scripts/cleanTestData.ts', { stdio: 'inherit' });
        console.log('[Global Teardown] Database cleanup successfully completely.');
    } catch (error) {
        console.error('[Global Teardown] Encountered an error while cleaning test data.');
        // We do not throw to avoid failing the test runner exiting abruptly, 
        // but we'll log it clearly.
    }
}

export default globalTeardown;
