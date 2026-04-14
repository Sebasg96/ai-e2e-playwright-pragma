import { chromium } from 'playwright';
import path from 'path';

(async () => {
    const authFile = path.resolve(__dirname, 'playwright/.auth/user.json');
    const browser = await chromium.launch();
    // Load existing storage state
    const context = await browser.newContext({
        baseURL: 'http://localhost:3000',
        storageState: authFile
    });
    const page = await context.newPage();

    console.log('Navigating to http://localhost:3000/ (Hub page) with auth state...');
    await page.goto('/');

    // Extract all data-testid attributes and their text/role
    const elements = await page.evaluate(() => {
        const results = [];
        const allWithId = document.querySelectorAll('[data-testid]');
        allWithId.forEach(el => {
            results.push({
                testid: el.getAttribute('data-testid'),
                tag: el.tagName,
                text: (el.innerText || el.getAttribute('placeholder') || el.getAttribute('value') || '').trim().substring(0, 50),
                role: el.getAttribute('role')
            });
        });
        return results;
    });

    console.log('--- FOUND TEST-IDS ON HUB ---');
    console.table(elements);
    console.log('------------------------------');

    // Check if sidebar exists
    const sidebar = await page.locator('[data-testid="sidebar-nav"]').isVisible();
    console.log(`Sidebar visible on Hub: ${sidebar}`);

    await browser.close();
})();
