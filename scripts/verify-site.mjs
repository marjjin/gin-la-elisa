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
  await expect(page.locator("#site-loader")).toHaveCount(0);
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
  assert.deepEqual(broken, []);
  const photographs = await page
    .locator("main img")
    .evaluateAll((images) =>
      images
        .filter((img) => !img.src.includes("isologo"))
        .map((img) => new URL(img.src).pathname),
    );
  assert.equal(
    new Set(photographs).size,
    photographs.length,
    "Each photograph is used once in the page",
  );
  await expect(page.locator(".product").first()).toHaveAttribute(
    "data-reveal-state",
    "pending",
  );
  for (const target of await page.locator("[data-reveal]").all()) {
    await target.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(target).toHaveAttribute("data-reveal-state", "visible");
  }

  // Exercise both exit directions using Lenis's actual wheel handling.
  const firstProduct = page.locator(".product").first();
  await firstProduct.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "visible");
  await expect(firstProduct).toHaveCSS("opacity", "1");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  const productPosition = await firstProduct.evaluate((element) => ({
    top: window.scrollY + element.getBoundingClientRect().top,
    height: element.getBoundingClientRect().height,
    viewport: window.innerHeight,
  }));
  const centeredScroll =
    productPosition.top -
    (productPosition.viewport - productPosition.height) / 2;
  await page.mouse.move(24, productPosition.viewport / 2);
  async function wheelTo(top) {
    const current = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, top - current);
    await expect
      .poll(() => page.evaluate((target) => Math.abs(window.scrollY - target), top))
      .toBeLessThan(2);
  }
  await wheelTo(productPosition.top + productPosition.height + 80);
  await expect
    .poll(() =>
      firstProduct.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThan(0);
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "pending");
  await wheelTo(centeredScroll);
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "visible");
  await expect(firstProduct).toHaveCSS("opacity", "1");

  await wheelTo(productPosition.top - productPosition.viewport - 80);
  await expect
    .poll(() =>
      firstProduct.evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeGreaterThan(productPosition.viewport);
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "pending");
  await wheelTo(centeredScroll);
  await expect(firstProduct).toHaveAttribute("data-reveal-state", "visible");
  await expect(firstProduct).toHaveCSS("opacity", "1");

  const layouts = [];
  for (const width of [320, 390, 600, 768, 1024, 1440, 1900]) {
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
    if (width === 390 || width === 1440) {
      // Full-page captures need offscreen content visible without changing
      // the normal reveal behavior used by the interactive checks.
      await page.emulateMedia({ reducedMotion: "reduce" });
      try {
        await expect(page.locator('[data-reveal-state="pending"]')).toHaveCount(0);
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.screenshot({
          path: `tmp/qa/one-page-${width}.png`,
          fullPage: true,
        });
      } finally {
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  for (const [label, id] of [
    ["Nosotros", "nosotros"],
    ["Nuestro gin", "gin"],
    ["Barras", "barras"],
    ["Agenda", "agenda"],
    ["Sucursales", "sucursales"],
    ["Galería", "galeria"],
    ["Contacto", "contacto"],
  ]) {
    const link = nav.getByRole("link", { name: label, exact: true });
    await link.click();
    await expect(link).toHaveAttribute("aria-current", "location");
    await expect
      .poll(() =>
        page
          .locator(`#${id}`)
          .evaluate((element) =>
            Math.round(element.getBoundingClientRect().top),
          ),
      )
      .toBeGreaterThanOrEqual(80);
    await expect
      .poll(() =>
        page
          .locator(`#${id}`)
          .evaluate((element) =>
            Math.round(element.getBoundingClientRect().top),
          ),
      )
      .toBeLessThanOrEqual(180);
    assert.equal(new URL(page.url()).hash, `#${id}`);
  }

  async function waitForDestination(id, targetPage = page) {
    await expect
      .poll(() =>
        targetPage.evaluate((targetId) => {
          const target = document.getElementById(targetId);
          const padding =
            parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          const destination = Math.max(
            0,
            Math.min(
              window.scrollY + target.getBoundingClientRect().top - padding - margin,
              document.documentElement.scrollHeight - window.innerHeight,
            ),
          );
          return Math.abs(window.scrollY - destination);
        }, id),
      )
      .toBeLessThan(2);
    await expect(targetPage.locator("html")).not.toHaveClass(/\blenis-smooth\b/);
    await expect(targetPage.locator(`#site-navigation a[href="#${id}"]`)).toHaveAttribute(
      "aria-current",
      "location",
    );
  }

  async function expectNavigationSequence(action, expected) {
    await page.evaluate(() => {
      const navigation = document.getElementById("site-navigation");
      const values = [];
      function record() {
        const link = navigation.querySelector('[aria-current="location"]');
        const current = link?.hash.slice(1) || null;
        if (values.at(-1) !== current) values.push(current);
      }
      const observer = new MutationObserver(record);
      observer.observe(navigation, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-current"],
      });
      record();
      window.__navigationTrace = { observer, values };
    });
    await action();
    const sequence = await page.evaluate(() => {
      const trace = window.__navigationTrace;
      trace.observer.disconnect();
      delete window.__navigationTrace;
      return trace.values;
    });
    assert.deepEqual(sequence, expected, "Navigation must retain the chosen destination during travel");
  }

  async function expectScrollSpyMatchesPosition() {
    await expect
      .poll(() =>
        page.evaluate(() => {
          const navigation = document.getElementById("site-navigation");
          const ids = [...navigation.querySelectorAll('a[href^="#"]')].map(
            (link) => link.hash.slice(1),
          );
          const reference = Math.min(window.innerHeight * 0.25, 200);
          const expected = ids.filter(
            (id) => document.getElementById(id).getBoundingClientRect().top <= reference,
          ).at(-1) || ids[0];
          const actual = navigation.querySelector('[aria-current="location"]')?.hash.slice(1);
          return actual === expected;
        }),
      )
      .toBe(true);
  }

  const nosotrosLink = nav.getByRole("link", { name: "Nosotros", exact: true });
  const contactoLink = nav.getByRole("link", { name: "Contacto", exact: true });
  await nosotrosLink.click();
  await waitForDestination("nosotros");
  await expectNavigationSequence(async () => {
    await contactoLink.click();
    await waitForDestination("contacto");
  }, ["nosotros", "contacto"]);
  await expectNavigationSequence(async () => {
    await nosotrosLink.click();
    await waitForDestination("nosotros");
  }, ["contacto", "nosotros"]);

  await expectNavigationSequence(async () => {
    await contactoLink.click();
    await nav.getByRole("link", { name: "Barras", exact: true }).click();
    await waitForDestination("barras");
  }, ["nosotros", "contacto", "barras"]);

  async function startContactTrip() {
    await nosotrosLink.click();
    await waitForDestination("nosotros");
    const origin = await page.evaluate(() => window.scrollY);
    await contactoLink.click();
    await expect
      .poll(() =>
        page.evaluate((start) =>
          window.scrollY > start + 120 &&
          document.getElementById("contacto").getBoundingClientRect().top > window.innerHeight + 120,
        origin),
      { intervals: [16, 32, 50] })
      .toBe(true);
  }

  await startContactTrip();
  await page.mouse.move(24, 500);
  await page.mouse.wheel(0, -800);
  await expect(page.locator("html")).not.toHaveClass(/\blenis-smooth\b/);
  await expectScrollSpyMatchesPosition();
  assert.ok(
    await page.locator("#contacto").evaluate((element) =>
      element.getBoundingClientRect().top > window.innerHeight,
    ),
    "Wheel input must interrupt the trip before Contacto",
  );

  await startContactTrip();
  await page.keyboard.press("Home");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expectScrollSpyMatchesPosition();
  await expect(nosotrosLink).toHaveAttribute("aria-current", "location");

  await startContactTrip();
  await page.emulateMedia({ reducedMotion: "reduce" });
  try {
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await expectScrollSpyMatchesPosition();
    assert.ok(
      await page.locator("#contacto").evaluate((element) =>
        element.getBoundingClientRect().top > window.innerHeight,
      ),
      "Enabling reduced motion must cancel the active smooth trip",
    );
    const nativeOrigin = await nav
      .locator('[aria-current="location"]')
      .evaluate((link) => link.hash.slice(1));
    await expectNavigationSequence(async () => {
      await contactoLink.click();
      await waitForDestination("contacto");
    }, [nativeOrigin, "contacto"]);
    await expectNavigationSequence(async () => {
      await nosotrosLink.click();
      await waitForDestination("nosotros");
    }, ["contacto", "nosotros"]);
  } finally {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);

  const product = page.locator(".product").first();
  await product.locator("summary").click();
  await expect(product.locator("details")).toHaveAttribute("open", "");
  await expect(product.locator(".details-body")).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Ferias", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 2);
  await page.getByRole("button", { name: "Experiencias", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 1);
  await page.locator(".event > summary").click();
  await expect(page.locator(".event-body")).toBeVisible();
  const calendarPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Guardar ejemplo en calendario" })
    .click();
  await (await calendarPromise).saveAs("tmp/qa/evento.ics");
  assert.ok(
    (await fs.readFile("tmp/qa/evento.ics", "utf8")).includes(
      "SUMMARY:[EJEMPLO] Una noche botánica",
    ),
  );
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  assert.equal(await page.locator(".event").count(), 3);
  assert.equal(await page.locator(".branch address").count(), 3);
  await expect(page.locator(".branch").first()).toContainText(
    "Calle de los Aromos 245",
  );
  await page.getByLabel("Tu nombre").fill("Prueba La Elisa");
  await page.getByLabel("Me interesa").selectOption("Barra de autoservicio");
  await page.getByLabel("Cantidad de invitados").fill("80");
  await page.getByLabel("Ciudad o lugar").fill("San Nicolás");
  await page.getByRole("button", { name: "Preparar mi consulta" }).click();
  await expect(page.locator(".inquiry-result pre")).toContainText(
    "Invitados: 80",
  );
  const textPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar texto" }).click();
  await (await textPromise).saveAs("tmp/qa/consulta.txt");
  assert.ok(
    (await fs.readFile("tmp/qa/consulta.txt", "utf8")).includes(
      "Me interesa: Barra de autoservicio",
    ),
  );

  const galleryLink = nav.getByRole("link", { name: "Galería", exact: true });
  const galleryTrack = page.locator("#gallery-track");
  const previousPhotos = page.getByRole("button", { name: "Fotos anteriores", exact: true });
  const nextPhotos = page.getByRole("button", { name: "Fotos siguientes", exact: true });
  await galleryLink.click();
  await waitForDestination("galeria");
  assert.ok(await galleryTrack.locator(".gallery-slide").count() >= 8);
  assert.ok(
    await galleryTrack.evaluate((element) => element.scrollWidth > element.clientWidth),
    "The gallery must scroll inside its own viewport",
  );
  await galleryTrack.focus();
  await page.keyboard.press("Home");
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeLessThan(2);
  await expect(previousPhotos).toBeDisabled();
  await expect(nextPhotos).toBeEnabled();
  await nextPhotos.click();
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeGreaterThan(20);
  await expect(previousPhotos).toBeEnabled();
  await previousPhotos.click();
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeLessThan(2);

  await galleryTrack.focus();
  const galleryPagePosition = await page.evaluate(() => Math.round(window.scrollY));
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeGreaterThan(20);
  await page.keyboard.press("End");
  await expect.poll(() => galleryTrack.evaluate((element) =>
    element.scrollWidth - element.clientWidth - element.scrollLeft,
  )).toBeLessThan(2);
  await expect(nextPhotos).toBeDisabled();
  await page.keyboard.press("Home");
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeLessThan(2);
  assert.equal(await page.evaluate(() => Math.round(window.scrollY)), galleryPagePosition);

  const addedPhoto = page.getByRole("button", {
    name: "Ampliar foto: En buena compañía",
    exact: true,
  });
  await addedPhoto.click();
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText("En buena compañía");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(addedPhoto).toBeFocused();
  await page
    .getByRole("button", { name: "Ampliar foto: Al aire libre" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(
    "Al aire libre",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await galleryLink.click();
  await waitForDestination("galeria");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
  await galleryTrack.evaluate((element) => element.scrollTo({ left: 0, behavior: "instant" }));
  await expect(previousPhotos).toBeDisabled();
  await nextPhotos.click();
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeGreaterThan(20);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await previousPhotos.click();
  await expect.poll(() => galleryTrack.evaluate((element) => element.scrollLeft)).toBeLessThan(2);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(
    page.getByRole("button", { name: "Cerrar menú" }),
  ).toHaveAttribute("aria-expanded", "true");
  await nav.getByRole("link", { name: "Sucursales", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Abrir menú" }),
  ).toHaveAttribute("aria-expanded", "false");
  assert.equal(new URL(page.url()).hash, "#sucursales");
  await waitForDestination("sucursales");
  // Restore an anchor in a clean page, independent of earlier demo details/form
  // states whose changed heights affect native browser scroll restoration.
  const reloadPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  reloadPage.on("pageerror", (error) => errors.push(error.message));
  try {
    await reloadPage.goto(baseURL, { waitUntil: "networkidle" });
    await reloadPage.getByRole("button", { name: "Abrir menú" }).click();
    await reloadPage.getByRole("navigation").getByRole("link", {
      name: "Sucursales", exact: true,
    }).click();
    await waitForDestination("sucursales", reloadPage);
    await reloadPage.reload({ waitUntil: "networkidle" });
    const restoredAnchorTop = () => reloadPage.locator("#sucursales")
      .evaluate((element) => Math.round(element.getBoundingClientRect().top));
    await expect.poll(restoredAnchorTop).toBeGreaterThanOrEqual(74);
    await expect.poll(restoredAnchorTop).toBeLessThanOrEqual(180);
  } finally {
    await reloadPage.close();
  }
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await expect(
    page.locator('[data-reveal-state="pending"]').first(),
  ).toBeAttached();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-reveal-state="pending"]')).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  await page
    .getByRole("button", { name: "Ampliar foto: Al aire libre" })
    .click();
  assert.equal(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.getAnimations().length),
    0,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "all photos load without repeats",
          "seven responsive widths",
          "sticky navigation and active section",
          "anchors clear the header",
          "navigation destination stays active without intermediate sections",
          "rapid navigation changes and manual scroll cancellation",
          "native navigation and live reduced-motion cancellation",
          "inline product information",
          "inline events and calendar download",
          "inline branch information",
          "inline inquiry and download",
          "animated photo viewer",
          "gallery navigation, horizontal controls and keyboard limits",
          "new gallery photos open and restore focus",
          "mobile gallery scroll stays inside the page",
          "mobile navigation and direct anchor reload",
          "scroll reveals and reduced motion",
          "bidirectional scroll reveals with Lenis",
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
