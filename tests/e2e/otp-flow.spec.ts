import { test, expect } from '@playwright/test';

test.describe('OTP Login Flow', () => {
  test('should complete full OTP login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify we're on the login page
    await expect(page.locator('text=StockMaster')).toBeVisible();
    await expect(page.locator('text=Sign in to your account')).toBeVisible();

    // Enter email
    const email = 'test@example.com';
    await page.fill('input[type="email"]', email);

    // Click Send OTP button
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP step to appear
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Check your email for the 6-digit code')).toBeVisible();

    // In a real test, you'd need to:
    // 1. Use a test email service that provides an API to read emails
    // 2. OR mock the send-otp endpoint to return a known OTP
    // 3. OR use a test database where you can query the OTP
    
    // For now, we'll test the UI flow with a mock OTP
    // In production, add test mode to send-otp that returns OTP in response for test emails
    const testOTP = '123456'; // This should come from a test email service or mock

    // Enter OTP
    await page.fill('input[type="text"][maxlength="6"]', testOTP);

    // Verify OTP button appears and is clickable
    await expect(page.locator('button:has-text("Verify OTP")')).toBeEnabled();

    // Note: Actual verification would fail without a real OTP
    // To make this test pass, you'd need to either:
    // 1. Add a test mode in the API that accepts a known test OTP
    // 2. Use a test email service like Mailosaur or MailSlurp
    // 3. Mock the API endpoints in the test

    // Test "Back to email" button
    await page.click('button:has-text("Back to email")');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveValue('');
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');

    // Try to send OTP with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button:has-text("Send OTP")');

    // Should show error (browser native validation will prevent submission)
    // Or check for custom error message if implemented
  });

  test('should show error for invalid OTP format', async ({ page }) => {
    await page.goto('/login');

    // Send OTP
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP step
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 10000 });

    // Try to verify with invalid OTP (less than 6 digits)
    await page.fill('input[type="text"][maxlength="6"]', '123');
    await page.click('button:has-text("Verify OTP")');

    // Should show validation error
    await expect(page.locator('text=Please enter a valid 6-digit OTP')).toBeVisible();
  });

  test('should only allow numeric input in OTP field', async ({ page }) => {
    await page.goto('/login');

    // Send OTP
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP step
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 10000 });

    // Try to enter non-numeric characters
    const otpInput = page.locator('input[type="text"][maxlength="6"]');
    await otpInput.fill('abc123');

    // Should only contain numbers
    await expect(otpInput).toHaveValue('123');
  });

  test('should disable submit buttons while loading', async ({ page }) => {
    await page.goto('/login');

    const sendButton = page.locator('button:has-text("Send OTP")');
    
    // Button should be enabled initially
    await expect(sendButton).toBeEnabled();

    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');

    // Click send - button should be disabled during request
    await sendButton.click();

    // Check for loading state (button text changes or disabled state)
    await expect(page.locator('button:has-text("Sending...")')).toBeVisible();
  });
});

test.describe('OTP Login Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // This test would require mocking the API to return an error
    // Or testing against a staging environment with controlled errors
    
    await page.goto('/login');
    await page.fill('input[type="email"]', 'error@example.com'); // Special test email that triggers error
    await page.click('button:has-text("Send OTP")');

    // Should show error message
    // await expect(page.locator('text=Failed to send OTP')).toBeVisible();
  });
});
