import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import sharp from "sharp";
import heicConvert from "heic-convert";

Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const downloads = process.argv[2] || path.join(os.homedir(), "Downloads");
await Promise.all(
  ["tmp/pdfs", "tmp/assets", "public/images"].map((folder) =>
    fs.mkdir(folder, { recursive: true }),
  ),
);
const pdfNames = [
  "Imprimir x3.pdf",
  "Q500CC.1-4.colores.Plantilla.pdf",
  "Eco vaso 3.pdf",
  "1579656645200_gin-la-elisa-isologo.pdf.pdf",
  "Brown Cream Modern International Hamburger Day Instagram Post (1080 x 1350 px) (100 x 100 cm).pdf",
];
for (const [i, name] of pdfNames.entries()) {
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(await fs.readFile(path.join(downloads, name))),
    useSystemFonts: true,
  }).promise;
  console.log(`PDF ${i}: ${name} (${doc.numPages} pages)`);
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    console.log(
      (await page.getTextContent()).items.map((item) => item.str).join(" "),
    );
    const viewport = page.getViewport({
      scale: 1100 / page.getViewport({ scale: 1 }).width,
    });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    await page.render({ canvasContext: canvas.getContext("2d"), viewport })
      .promise;
    await fs.writeFile(
      `tmp/pdfs/pdf-${i}-${n}.png`,
      canvas.toBuffer("image/png"),
    );
  }
}
const inputs = [
  ...(await fs.readdir(downloads))
    .filter((n) =>
      /^(WhatsApp Image 2026-11-06 at 19\.28|IMG_54(61|67|68|69|70|71|73|74|75|76)\.HEIC)/.test(
        n,
      ),
    )
    .map((n) => path.join(downloads, n)),
  ...(await fs.readdir("tmp/assets")).map((n) => path.resolve("tmp/assets", n)),
];
const thumbs = [];
for (const [i, input] of inputs.entries()) {
  let buffer = await fs.readFile(input);
  if (/\.heic$/i.test(input))
    buffer = Buffer.from(
      await heicConvert({ buffer, format: "JPEG", quality: 0.95 }),
    );
  const output = `photo-${String(i + 1).padStart(2, "0")}`;
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(`public/images/${output}.webp`);
  await sharp(buffer)
    .rotate()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 77 })
    .toFile(`public/images/${output}-small.webp`);
  const thumb = await sharp(buffer)
    .rotate()
    .resize(190, 210, { fit: "contain", background: "#eee9e2" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="190" height="30"><rect width="190" height="30" fill="white"/><text x="8" y="21" font-size="16">${output}</text></svg>`,
  );
  thumbs.push({
    input: thumb,
    left: (i % 6) * 190,
    top: Math.floor(i / 6) * 240,
  });
  thumbs.push({
    input: label,
    left: (i % 6) * 190,
    top: Math.floor(i / 6) * 240 + 210,
  });
  console.log(`${output}: ${path.basename(input)}`);
}
await sharp({
  create: {
    width: 1140,
    height: Math.ceil(inputs.length / 6) * 240,
    channels: 3,
    background: "white",
  },
})
  .composite(thumbs)
  .png()
  .toFile("tmp/contact-sheet.png");
await fs.writeFile("tmp/image-inputs.json", JSON.stringify(inputs, null, 2));
