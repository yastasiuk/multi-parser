export const defaultPuppeteerConfiguration = {
  ignoreHTTPSErrors: true,
  args: [
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browserLocator-check',
    '--disable-web-security',
    '--disable-extensions',
    '--disable-notifications',
    '--allow-running-insecure-content',
  ],
  headless: false,
};
