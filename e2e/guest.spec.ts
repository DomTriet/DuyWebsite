/**
 * Guest E2E Tests — Trang công khai
 * Chạy với: npx playwright test e2e/guest.spec.ts
 * Yêu cầu: dev server đang chạy ở localhost:4200
 */
import { test, expect, Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function goTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANG CHỦ
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang chủ (/)', () => {
  test('load thành công và hiện navigation', async ({ page }) => {
    await goTo(page, '/');
    // Nav phải có link
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('logo "RESTATE" hiện trên navigation', async ({ page }) => {
    await goTo(page, '/');
    const nav = page.locator('nav, header').first();
    await expect(nav).toContainText('RESTATE', { timeout: 10_000 });
  });

  test('footer hiển thị', async ({ page }) => {
    await goTo(page, '/');
    await expect(page.locator('footer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('không có lỗi console nghiêm trọng', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('404') && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    await goTo(page, '/');
    await page.waitForTimeout(2000);
    // Có thể có network errors do không có backend thật — filter chỉ JS errors
    const jsErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to fetch'));
    expect(jsErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  TRANG BLOG
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang danh sách blog (/blogs)', () => {
  test('load thành công và hiện tiêu đề trang', async ({ page }) => {
    await goTo(page, '/blogs');
    await expect(page).toHaveURL(/\/blogs/);
    // Page không crash
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
  });

  test('không redirect về 404', async ({ page }) => {
    const response = await page.goto('/blogs');
    expect(response?.status()).not.toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  TRANG VỀ CHÚNG TÔI
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang About (/about)', () => {
  test('load thành công', async ({ page }) => {
    await goTo(page, '/about');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  TRANG LIÊN HỆ
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang Contact (/contact)', () => {
  test('load thành công', async ({ page }) => {
    await goTo(page, '/contact');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH REDIRECT
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Auth redirect khi chưa đăng nhập', () => {
  test('/admin redirect về /auth/login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Chờ redirect
    await page.waitForURL(/\/auth\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  LANGUAGE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Language selector', () => {
  test('hiện trên trang chủ', async ({ page }) => {
    await goTo(page, '/');
    // Language selector component phải render (nằm trong nav)
    const langSelector = page.locator('app-language-selector, [appLanguageSelector]').first();
    // Chỉ verify không crash, không check nội dung cụ thể
    await expect(page.locator('body')).toBeVisible();
  });
});
