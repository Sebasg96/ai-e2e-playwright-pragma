import { defineConfig, devices, firefox, webkit } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const canLaunchFirefox = (() => {
    try {
        return fs.existsSync(firefox.executablePath());
    } catch {
        return false;
    }
})();

const canLaunchWebkit = (() => {
    try {
        return fs.existsSync(webkit.executablePath());
    } catch {
        return false;
    }
})();

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './tests',

    // Run tests in files in parallel
    fullyParallel: false,

    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,

    // Retry failed tests on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 2 : 2,

    // Reporters to use
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ...(process.env.CI ? [['github'] as ['github']] : []),
        ['allure-playwright', { outputFolder: 'allure-results' }],
    ],

    // Shared settings for all the projects below.
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: BASE_URL,

        // Collect trace when retrying the failed test.
        trace: 'on-first-retry',

        // Capture screenshot on failure
        screenshot: 'only-on-failure',

        // Record video on retry
        video: 'on-first-retry',

        // Global timeout for actions
        actionTimeout: 15_000,

        // Navigation timeout
        navigationTimeout: 30_000,
    },

    // Configure projects for major browsers
    projects: [
        // ─── Setup Projects ──────────────────────────────────────────────────────
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // ─── Browser Projects ─────────────────────────────────────────────────
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use saved auth state
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        ...(canLaunchFirefox
            ? [
                {
                    name: 'firefox',
                    use: {
                        ...devices['Desktop Firefox'],
                        storageState: 'playwright/.auth/user.json',
                    },
                    dependencies: ['setup'],
                },
            ]
            : []),
        ...(canLaunchWebkit
            ? [
                {
                    name: 'webkit',
                    use: {
                        ...devices['Desktop Safari'],
                        storageState: 'playwright/.auth/user.json',
                    },
                    dependencies: ['setup'],
                },
            ]
            : []),

        // ─── Mobile Projects ─────────────────────────────────────────────────
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
    ],

    // Output folder for test artifacts (screenshots, videos, traces)
    outputDir: 'test-results/',

    // Global setup script
    // globalSetup: require.resolve('./src/helpers/global-setup.ts'),

    // Global teardown script
    // globalTeardown: require.resolve('./src/helpers/global-teardown.ts'),

    // Timeout for each test
    timeout: 60_000,

    // Expect timeout
    expect: {
        timeout: 10_000,
    },
});
