import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  use: {
    baseURL: 'https://duy-website.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Không kết nối thật đến backend trong E2E — test UI behavior
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Nếu muốn tự start dev server: bỏ comment webServer bên dưới
  // webServer: {
  //   command: 'cd frontend && npx ng serve',
  //   url: 'https://duy-website.vercel.app',
  //   reuseExistingServer: true,
  //   timeout: 120_000,
  // },
});
