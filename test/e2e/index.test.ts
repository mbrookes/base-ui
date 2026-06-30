import { describe, it, beforeAll, afterAll } from 'vitest';
import { chromium, expect, Page, Browser } from '@playwright/test';
import '@mui/internal-test-utils/initPlaywrightMatchers';

const BASE_URL = 'http://localhost:5173';

function delay(duration: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

/**
 * Attempts page.goto with retries
 *
 * @remarks The server and runner can be started up simultaneously
 * @param page
 * @param url
 */
async function attemptGoto(page: Page, url: string): Promise<boolean> {
  const maxAttempts = 10;
  const retryTimeoutMS = 250;

  let didNavigate = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await page.goto(url);
      didNavigate = true;
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      await delay(retryTimeoutMS);
    }
  }

  return didNavigate;
}

describe('e2e', () => {
  let browser: Browser;
  let page: Page;

  async function renderFixture(fixturePath: string) {
    await page.goto(`${BASE_URL}/e2e-fixtures/${fixturePath}#no-dev`);
    await page.waitForSelector('[data-testid="testcase"]:not([aria-busy="true"])');
  }

  beforeAll(async function beforeHook() {
    browser = await chromium.launch({
      headless: true,
    });
    page = await browser.newPage();
    const isServerRunning = await attemptGoto(page, `${BASE_URL}#no-dev`);
    if (!isServerRunning) {
      throw new Error(
        `Unable to navigate to ${BASE_URL} after multiple attempts. Did you forget to run \`pnpm test:e2e:server\` and \`pnpm test:e2e:build\`?`,
      );
    }
  }, 20000);

  afterAll(async () => {
    await browser.close();
  });

  describe('<Menu />', () => {
    describe('<Menu.LinkItem />', () => {
      it('navigates on click', async () => {
        await renderFixture('menu/LinkItemNavigation');

        const trigger = page.getByTestId('menu-trigger');
        await trigger.click();

        const linkOne = page.getByTestId('link-one');
        await linkOne.click();

        await expect(page).toHaveURL(/\/e2e-fixtures\/menu\/PageOne/);
        await expect(page.getByTestId('test-page')).toHaveText('Page one');

        await page.goBack();
        await expect(page.getByTestId('page-heading')).toHaveText('Menu with Link Items');

        await trigger.click();
        const linkTwo = page.getByTestId('link-two');
        await linkTwo.click();

        await expect(page).toHaveURL(/\/e2e-fixtures\/menu\/PageTwo/);
        await expect(page.getByTestId('test-page')).toHaveText('Page two');
      });

      it(
        'navigates on Enter key press',
        { timeout: process.env.CIRCLECI === 'true' ? 8000 : 4000 },
        async () => {
          await renderFixture('menu/LinkItemNavigation');

          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          // first item (page one) is initially highlighted
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');

          await expect(page).toHaveURL(/\/e2e-fixtures\/menu\/PageTwo/);
          await expect(page.getByTestId('test-page')).toHaveText('Page two');
        },
      );

      it('navigates when rendering React Router Link component', async () => {
        await renderFixture('menu/ReactRouterLinkItemNavigation');

        const trigger = page.getByTestId('menu-trigger');
        await trigger.click();

        const linkOne = page.getByTestId('link-one');
        await linkOne.click();

        await expect(page).toHaveURL(/\/e2e-fixtures\/menu\/PageOne/);
        await expect(page.getByTestId('test-page')).toHaveText('Page one');

        await page.goBack();
        await expect(page.getByTestId('page-heading')).toHaveText(
          'Menu with React Router Link Items',
        );

        await trigger.click();
        const linkTwo = page.getByTestId('link-two');
        await linkTwo.click();

        await expect(page).toHaveURL(/\/e2e-fixtures\/menu\/PageTwo/);
        await expect(page.getByTestId('test-page')).toHaveText('Page two');
      });
    });
  });
});
