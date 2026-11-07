import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { expect } from "@playwright/test";

const baseURL = process.env.SITE_URL || "http://127.0.0.1:5173";
const executablePath = process.env.BROWSER_PATH || (process.platform === "win32"
  ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  : chromium.executablePath());
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await fs.mkdir("tmp/qa", { recursive: true });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await expect(page.locator("#site-loader")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("link", { name: "Productos", exact: true }).click();
  await expect(page).toHaveURL(/\/productos\/$/);
  await expect(page).toHaveTitle("Productos · Gin La Elisa");
  await expect(page.locator("#site-loader")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".catalog-product")).toHaveCount(9);
  const filters = page.getByRole("group", { name: "Filtrar productos por categoría" });

  for (const [name, count] of [["Gin", 3], ["Panes", 3], ["Prepizzas", 2], ["Dulces", 1], ["Todos", 9]]) {
    await filters.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await expect(page.locator(".catalog-product")).toHaveCount(count);
    await expect(filters.getByRole("button", { name: new RegExp(`^${name}`) })).toHaveAttribute("aria-pressed", "true");
    await page.locator(".catalog-grid img").evaluateAll((images) => Promise.all(images.map((image) => {
      image.loading = "eager";
      return image.decode();
    })));
  }
  for (const title of ["El clásico", "Frutilla", "Maracuyá", "Pizzetas", "Pan de papa clásico", "Pan de papa con queso", "Pan de papa con sésamo", "Prepizzas", "Alfajores"]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
  const inquiries = await page.locator(".catalog-whatsapp").evaluateAll((links) => links.map((link) => ({
    href: link.href, label: link.getAttribute("aria-label"), target: link.target, rel: link.rel,
  })));
  for (const inquiry of inquiries) {
    const url = new URL(inquiry.href);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/5493364312425");
    assert.ok(url.searchParams.get("text").includes("Me interesa"));
    const title = inquiry.label.replace("Consultar por ", "").replace(" en WhatsApp", "");
    assert.ok(url.searchParams.get("text").includes(title));
    assert.equal(inquiry.target, "_blank");
    assert.ok(inquiry.rel.includes("noopener"));
  }

  const cheesePhoto = page.getByRole("button", { name: "Ver fotos y detalles de Pan de papa con queso", exact: true });
  await cheesePhoto.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Pan de papa con queso", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Ver foto 2 de Pan de papa con queso", exact: true }).click();
  await expect(dialog.locator(".catalog-dialog-content > img")).toHaveAttribute("src", "/images/pan-papa-queso-2.webp");
  await expect(dialog.getByRole("link", { name: "Consultar por WhatsApp" })).toHaveAttribute("href", /Pan%20de%20papa%20con%20queso/);
  await page.screenshot({ path: "tmp/qa/catalog-detail.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(cheesePhoto).toBeFocused();

  for (const width of [320, 390, 600, 768, 1024, 1440, 1900]) {
    await page.setViewportSize({ width, height: 1000 });
    const content = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(content <= width, `Catalog horizontal overflow at ${width}: ${content}`);
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `tmp/qa/catalog-${width}.png` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await filters.getByRole("button", { name: /^Dulces/ }).click();
  await expect(page.locator(".catalog-product")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver fotos y detalles de Alfajores", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Alfajores", exact: true })).toBeVisible();
  assert.ok(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth));
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/productos\/$/);
  await expect(page.locator("#site-loader")).toHaveCount(0);
  await expect(page.locator(".catalog-product")).toHaveCount(9);
  await page.getByRole("navigation").getByRole("link", { name: "Contacto", exact: true }).click();
  await expect(page).toHaveURL(/\/#contacto$/);
  await expect(page.locator("#site-loader")).toHaveCount(0);
  await expect(page.locator("#contacto h2")).toBeInViewport();
  assert.deepEqual(errors, []);
  console.log("Catalog verified: separate page, nine products, categories, responsive photos, details, alternative images, focus restoration, WhatsApp messages, seven widths, reload and return to contact.");
} finally {
  await browser.close();
}
