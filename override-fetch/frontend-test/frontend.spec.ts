import { test, expect } from '@playwright/test';

test('use flaky API', async ({ page }) => {
  await page.goto('/');

  await page.locator('#bt').click();

  //await page.locator('//span[contains(string(.), "content two")]').waitFor(); // a TON is wrong with that: locators are hard to write (and do we really want a page model just for that?) - and an app error waits the whole 30s before firing!
  await page.waitForFunction(() => (window as any).__hasNoOngoingFetch()); // so much better

  await expect(page.locator('#spn1')).toContainText('content one', {timeout: -1});
  await expect(page.locator('#spn2')).toContainText(/content two/, {timeout: -1}); // try "three" here - it returns immediately
});
