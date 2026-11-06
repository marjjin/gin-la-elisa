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
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await fs.mkdir("tmp/qa", { recursive: true });
try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    );
  });
  assert.equal(await page.title(), "Gin La Elisa · El arte de compartir");
  assert.equal(await page.locator("h1").count(), 1);
  const broken = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((img) => !img.complete || !img.naturalWidth)
        .map((img) => img.src),
    );
  assert.deepEqual(broken, [], "Every image must load");
  const firstProduct = page.locator(".product").first();
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "pending");
  await firstProduct.scrollIntoViewIfNeeded();
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "visible");
  await expect(firstProduct).toHaveCSS("opacity", "1");
  // Visit the whole page before taking full-page captures of scroll reveals.
  for (const target of await page.locator('[data-reveal]').all()) {
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveAttribute("data-reveal-state", "visible");
  }
  await page.locator("h1").scrollIntoViewIfNeeded();
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "visible");
  const layouts = [];
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= width,
      `Horizontal overflow at ${width}: ${dimensions.content}`,
    );
    layouts.push(dimensions);
    if (width === 390 || width === 1440)
      await page.screenshot({ path: `tmp/qa/${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Ferias", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 2);
  await page.getByRole("button", { name: "Experiencias", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 1);
  await page.getByRole("button", { name: /Ver el encuentro/ }).click();
  assert.ok(await page.getByRole("dialog").isVisible());
  assert.equal(
    await page.getByRole("dialog").getByRole("heading").textContent(),
    "Una noche botánica",
  );
  const calendarPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Guardar ejemplo en calendario" })
    .click();
  const calendar = await calendarPromise;
  await calendar.saveAs("tmp/qa/evento.ics");
  const ics = await fs.readFile("tmp/qa/evento.ics", "utf8");
  assert.ok(ics.includes("DTSTART:20261128T230000Z"));
  assert.ok(ics.includes("SUMMARY:[EJEMPLO] Una noche botánica"));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 3);
  await page
    .getByRole("button", { name: "Conocer Frutilla", exact: true })
    .click();
  assert.equal(
    await page.getByRole("dialog").getByRole("heading").textContent(),
    "Frutilla",
  );
  await page.getByRole("button", { name: "Consultar por este gin" }).click();
  assert.equal(await page.getByLabel("Me interesa").inputValue(), "Frutilla");
  await page.getByLabel("Tu nombre").fill("Prueba La Elisa");
  await page.getByLabel("Cantidad de invitados").fill("80");
  await page.getByLabel("Ciudad o lugar").fill("San Nicolás");
  await page.getByRole("button", { name: "Preparar mi consulta" }).click();
  assert.ok(
    (await page.locator(".inquiry-result pre").textContent()).includes(
      "Invitados: 80",
    ),
  );
  const textPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar texto" }).click();
  const inquiry = await textPromise;
  await inquiry.saveAs("tmp/qa/consulta.txt");
  assert.ok(
    (await fs.readFile("tmp/qa/consulta.txt", "utf8")).includes(
      "Me interesa: Frutilla",
    ),
  );
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Ver detalles de La Elisa · Costanera" })
    .click();
  assert.equal(
    await page.getByRole("dialog").getByRole("heading").textContent(),
    "La Elisa · Costanera",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Quiero esta barra" }).click();
  assert.equal(
    await page.getByLabel("Me interesa").inputValue(),
    "Barra de autoservicio",
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Cerrar menú" })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Sucursales", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Abrir menú" })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(new URL(page.url()).hash, "#sucursales");
  // Closing during entrance must complete and leave the page usable.
  await page.getByRole("button", { name: "Llevanos a tu evento" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "Llevanos a tu evento" }).click();
  await page.mouse.click(3, 3);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await expect(page.locator('[data-reveal-state="pending"]').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-reveal-state="pending"]')).toHaveCount(0);
  await expect(page.locator(".hero-copy h1")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Llevanos a tu evento" }).click();
  assert.equal(await page.getByRole("dialog").evaluate((element) => element.getAnimations().length), 0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "all images loaded",
          "six responsive sizes without horizontal overflow",
          "event filters",
          "event detail",
          "calendar download",
          "product detail",
          "inquiry preparation and download",
          "service preselection",
          "branch detail",
          "mobile menu",
          "scroll reveals remain visible after scrolling back",
          "animated close, Escape and backdrop dismissal",
          "reduced-motion preference including live changes",
          "no JavaScript errors",
        ],
        layouts,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
