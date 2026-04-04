import { test as base, expect } from "@playwright/test";

// Re-export the base fixture from Playwright
// Override or extend test/expect here if needed
export const test = base;
export { expect };
