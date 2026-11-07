import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { expect } from "@playwright/test";

const baseURL = process.env.SITE_URL || "http://127.0.0.1:5173";
const executablePath =
  process.env.BROWSER_PATH ||
  (process.platform === "win32"
    ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    : chromium.executablePath());
const browser = await chromium.launch({ headless: true, executablePath });
const errors = [];

async function openPage(options = {}) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    ...options,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return page;
}

async function holdHero(page) {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route("**/images/gin-noche*.webp", async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}

try {
  await fs.mkdir("tmp/qa", { recursive: true });
  const page = await openPage();
  const release = await holdHero(page);
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#site-loader")).toBeVisible();
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.locator(".intro-image img")).toHaveCount(1);
  await page.screenshot({ path: "tmp/qa/loading-desktop.png", animations: "disabled" });
  release();
  await expect(page.locator("#site-loader")).toHaveCount(0);
  await expect(page.locator("#root")).not.toHaveAttribute("inert");
  await expect(page.locator("#root")).not.toHaveAttribute("aria-busy");
  await expect(page.locator("body")).not.toHaveAttribute("data-loading");
  await page.close();

  const mobile = await openPage({ viewport: { width: 390, height: 844 } });
  const releaseMobile = await holdHero(mobile);
  await mobile.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(mobile.locator("#site-loader")).toBeVisible();
  await mobile.screenshot({ path: "tmp/qa/loading-mobile.png", animations: "disabled" });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth), 390);
  releaseMobile();
  await expect(mobile.locator("#site-loader")).toHaveCount(0);
  await mobile.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await expect(mobile.locator("#site-navigation")).toBeVisible();
  await mobile.close();

  const reduced = await openPage({ reducedMotion: "reduce" });
  const releaseReduced = await holdHero(reduced);
  await reduced.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(reduced.locator(".loader-orbit")).toHaveCSS("animation-name", "none");
  await expect(reduced.locator("#site-loader")).toHaveCSS("transition-duration", "0s");
  releaseReduced();
  await expect(reduced.locator("#site-loader")).toHaveCount(0);
  await reduced.close();

  const failed = await openPage();
  await failed.route("**/images/gin-noche*.webp", (route) => route.abort());
  await failed.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(failed.locator("#site-loader")).toHaveCount(0);
  await expect(failed.locator("#root")).not.toHaveAttribute("inert");
  await failed.close();

  const slow = await openPage();
  const releaseSlow = await holdHero(slow);
  await slow.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(slow.locator("#site-loader")).toHaveCount(0, { timeout: 7000 });
  await expect(slow.locator("#root")).not.toHaveAttribute("inert");
  releaseSlow();
  await slow.waitForLoadState("networkidle");
  await slow.close();

  const deepLink = await openPage();
  await deepLink.goto(`${baseURL}/#contacto`, { waitUntil: "domcontentloaded" });
  await expect(deepLink.locator("#site-loader")).toHaveCount(0);
  await expect(deepLink.locator("#contacto h2")).toBeInViewport();
  await deepLink.close();

  const startup = await openPage();
  await startup.route("**/src/main.jsx*", (route) => route.abort());
  await startup.goto(baseURL, { waitUntil: "domcontentloaded" });
  await expect(startup.locator("#site-loader")).toHaveCount(0, { timeout: 9500 });
  await expect(startup.locator("#root")).not.toHaveAttribute("inert");
  await expect(startup.locator("body")).not.toHaveAttribute("data-loading");
  await startup.close();

  assert.deepEqual(errors, []);
  console.log("Loading verified: desktop, mobile, readiness, reduced motion, failed image, timeout, deep link and startup fallback.");
} finally {
  await browser.close();
}
