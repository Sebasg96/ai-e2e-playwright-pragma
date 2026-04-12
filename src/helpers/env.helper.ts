/**
 * env.helper.ts — Typed environment variable loader
 *
 * Reads from process.env (populated by dotenv in playwright.config.ts).
 * Throws clearly if required variables are missing.
 */

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `❌ Missing required environment variable: ${key}\n` +
            `   Copy .env.example to .env and fill in the values.`
        );
    }
    return value;
}

export const env = {
    /** Application base URL */
    get baseUrl(): string {
        return process.env.BASE_URL || 'http://localhost:3000';
    },

    /** Test user email */
    get testUserEmail(): string {
        return requireEnv('TEST_USER_EMAIL');
    },

    /** Test user password */
    get testUserPassword(): string {
        return requireEnv('TEST_USER_PASSWORD');
    },

    /** Environment name (local | staging | production) */
    get environment(): string {
        return process.env.ENVIRONMENT || 'local';
    },

    /** Check if running in CI */
    get isCI(): boolean {
        return !!process.env.CI;
    },
};
