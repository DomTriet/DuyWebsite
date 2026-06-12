/**
 * Auth E2E Tests — Login / Register / Forgot Password / Reset Password
 * Chạy với: npx playwright test e2e/auth.spec.ts
 * Yêu cầu: dev server đang chạy ở localhost:4200
 */
import { test, expect, Page } from '@playwright/test';

// ── Helper ────────────────────────────────────────────────────────────────────
async function goToLogin(page: Page) {
  await page.goto('/auth/login');
  await page.waitForSelector('form', { timeout: 10_000 });
}
async function goToRegister(page: Page) {
  await page.goto('/auth/register');
  await page.waitForSelector('form', { timeout: 10_000 });
}
async function goToForgot(page: Page) {
  await page.goto('/auth/forgot-password');
  await page.waitForSelector('form', { timeout: 10_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang đăng nhập', () => {
  test('hiển thị đúng logo RESTATE và tiêu đề', async ({ page }) => {
    await goToLogin(page);
    await expect(page.locator('h1')).toContainText('RESTATE');
    await expect(page.locator('h2')).toContainText('Đăng nhập');
  });

  test('hiện field errors khi submit form trống', async ({ page }) => {
    await goToLogin(page);
    await page.click('button[type="submit"]');
    // Phải hiện ít nhất 1 lỗi field
    const errors = page.locator('.text-red-500');
    await expect(errors.first()).toBeVisible();
  });

  test('field email hiển thị lỗi khi giá trị không hợp lệ', async ({ page }) => {
    await goToLogin(page);
    await page.fill('#email', 'khong-phai-email');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-500').first()).toBeVisible();
  });

  test('hiện error banner đỏ với icon khi login sai credentials', async ({ page }) => {
    await goToLogin(page);
    await page.fill('#email', 'nonexist@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Error banner phải xuất hiện (sau API call)
    const banner = page.locator('.bg-red-50');
    await expect(banner).toBeVisible({ timeout: 8_000 });
    // Icon SVG phải có trong banner
    await expect(banner.locator('svg').first()).toBeVisible();
  });

  test('nút close (×) trên error banner hoạt động', async ({ page }) => {
    await goToLogin(page);
    await page.fill('#email', 'bad@test.com');
    await page.fill('#password', 'wrongpw');
    await page.click('button[type="submit"]');
    const banner = page.locator('.bg-red-50');
    await banner.waitFor({ timeout: 8_000 });
    // Click nút đóng
    await banner.locator('button').click();
    await expect(banner).not.toBeVisible();
  });

  test('toggle show/hide password', async ({ page }) => {
    await goToLogin(page);
    const pwInput = page.locator('#password');
    await expect(pwInput).toHaveAttribute('type', 'password');
    // Click eye icon (button ngay trong div relative)
    await pwInput.locator('..').locator('button').click();
    await expect(pwInput).toHaveAttribute('type', 'text');
  });

  test('link "Quên mật khẩu?" chuyển hướng đúng', async ({ page }) => {
    await goToLogin(page);
    await page.click('a[href="/auth/forgot-password"]');
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('link "Đăng ký ngay" chuyển hướng đúng', async ({ page }) => {
    await goToLogin(page);
    await page.click('a[href="/auth/register"]');
    await expect(page).toHaveURL(/register/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang đăng ký', () => {
  test('hiển thị đúng tiêu đề', async ({ page }) => {
    await goToRegister(page);
    await expect(page.locator('h2')).toContainText('Đăng ký tài khoản');
  });

  test('hiện field errors khi submit form trống', async ({ page }) => {
    await goToRegister(page);
    await page.click('button[type="submit"]');
    const errors = page.locator('.text-red-500');
    await expect(errors.first()).toBeVisible();
  });

  test('password strength bar xuất hiện khi nhập password', async ({ page }) => {
    await goToRegister(page);
    await page.locator('input[formcontrolname="password"]').fill('abc');
    // Strength bar div phải hiện
    await expect(page.locator('.strength-bar, [style*="width"]').first()).toBeVisible({ timeout: 3_000 });
  });

  test('lỗi "Mật khẩu không khớp" khi confirm khác', async ({ page }) => {
    await goToRegister(page);
    await page.fill('input[formcontrolname="full_name"]', 'Test User');
    await page.fill('input[formcontrolname="email"]', 'test@test.com');
    await page.locator('input[formcontrolname="password"]').fill('password123');
    await page.locator('input[formcontrolname="confirm_password"]').fill('different');
    await page.locator('input[formcontrolname="confirm_password"]').blur();
    const errors = page.locator('.text-red-500');
    await expect(errors.last()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang quên mật khẩu', () => {
  test('hiển thị đúng tiêu đề và icon ổ khóa', async ({ page }) => {
    await goToForgot(page);
    await expect(page.locator('h2')).toContainText('Quên mật khẩu');
    // Icon circle (svg trong div icon)
    await expect(page.locator('.bg-gray-100 svg').first()).toBeVisible();
  });

  test('hiện lỗi khi submit email trống', async ({ page }) => {
    await goToForgot(page);
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-500').first()).toBeVisible();
  });

  test('hiện lỗi khi email không hợp lệ', async ({ page }) => {
    await goToForgot(page);
    await page.fill('#email', 'not-an-email');
    await page.locator('#email').blur();
    await expect(page.locator('.text-red-500').first()).toBeVisible();
  });

  test('link "Quay lại đăng nhập" hoạt động', async ({ page }) => {
    await goToForgot(page);
    await page.click('a[href="/auth/login"]');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Trang đặt lại mật khẩu', () => {
  test('hiển thị form đặt mật khẩu mới', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await page.waitForSelector('form', { timeout: 10_000 });
    await expect(page.locator('h2')).toContainText('Tạo mật khẩu mới');
  });

  test('hiện lỗi khi submit form trống', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await page.waitForSelector('button[type="submit"]');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-500').first()).toBeVisible();
  });

  test('lỗi "Mật khẩu không khớp" khi confirm khác', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await page.waitForSelector('form');
    await page.locator('#password').fill('newpassword123');
    await page.locator('#confirm_password').fill('different123');
    await page.locator('#confirm_password').blur();
    await expect(page.locator('.text-red-500').first()).toBeVisible();
  });
});
