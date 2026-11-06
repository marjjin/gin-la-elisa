import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Run inspect-material.mjs first when importing the original client delivery.
const inputs = JSON.parse(await fs.readFile("tmp/image-inputs.json", "utf8"));
const names = [
  "alfajores",
  "pan-papa-clasico-1",
  "pan-papa-clasico-2",
  "pan-papa-queso-1",
  "pan-papa-queso-2",
  "pan-papa-sesamo",
  "pan-hamburguesa-1",
  "pan-hamburguesa-2",
  "prepizza-1",
  "prepizza-2",
  "gin-botanicos",
  "gin-botanicos-duplicado",
  "gin-clasico",
  "gin-jardin",
  "lavanda",
  "gin-tonic",
  "brindis",
  "gin-romero",
  "gin-fuego",
  "gin-paisaje",
  "gin-maracuya",
  "noche-la-elisa",
  "gin-frutilla",
  "gin-mesa",
  "gin-elaboracion",
  "gin-noche",
  "gin-lotes",
];
await fs.mkdir("assets/referencias-optimizadas", { recursive: true });
const manifest = [];
for (let i = 0; i < names.length; i++) {
  const oldName = `photo-${String(i + 1).padStart(2, "0")}`;
  const folder = i < 10 ? "assets/referencias-optimizadas" : "public/images";
  let pipeline = sharp(`public/images/${oldName}.webp`);
  if (names[i] === "gin-tonic")
    pipeline = pipeline.extract({ left: 0, top: 272, width: 588, height: 738 });
  if (names[i] === "lavanda")
    pipeline = pipeline.extract({ left: 0, top: 155, width: 590, height: 958 });
  const buffer = await pipeline.toBuffer();
  const output = `${folder}/${names[i]}.webp`;
  await fs.writeFile(output, buffer);
  if (i >= 10)
    await sharp(buffer)
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 77 })
      .toFile(`${folder}/${names[i]}-small.webp`);
  const originalBytes = (await fs.stat(inputs[i])).size;
  manifest.push({
    original: path.basename(inputs[i]),
    output,
    originalBytes,
    optimizedBytes: buffer.length,
    availableForSite: i >= 10,
  });
}
const logo = await sharp("tmp/pdfs/pdf-3-1.png")
  .extract({ left: 227, top: 324, width: 649, height: 647 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let i = 0; i < logo.data.length; i += 4) {
  const alpha = Math.round(
    ((255 - Math.min(logo.data[i], logo.data[i + 1], logo.data[i + 2])) * 255) /
      219,
  );
  logo.data[i] = 50;
  logo.data[i + 1] = 36;
  logo.data[i + 2] = 97;
  logo.data[i + 3] = Math.min(255, alpha);
}
await sharp(logo.data, { raw: logo.info })
  .png()
  .toFile("public/images/isologo.png");
await sharp(logo.data, { raw: logo.info })
  .resize(64, 64)
  .png()
  .toFile("public/favicon.png");
await sharp("tmp/pdfs/pdf-3-1.png")
  .extract({ left: 215, top: 315, width: 675, height: 925 })
  .resize(540)
  .webp({ quality: 90 })
  .toFile("assets/referencias-optimizadas/logo-completo.webp");
await sharp("tmp/pdfs/pdf-0-1.png")
  .resize(480)
  .webp({ quality: 80 })
  .toFile("assets/referencias-optimizadas/grafica-marca.webp");
await fs.writeFile(
  "assets/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
const imageMetadata = {};
for (const name of names.slice(10)) {
  const full = await sharp(`public/images/${name}.webp`).metadata();
  const small = await sharp(`public/images/${name}-small.webp`).metadata();
  imageMetadata[name] = {
    width: full.width,
    height: full.height,
    smallWidth: small.width,
  };
}
await fs.writeFile(
  "src/image-metadata.json",
  JSON.stringify(imageMetadata, null, 2) + "\n",
);
for (const name of await fs.readdir("public/images"))
  if (/^photo-\d+(-small)?\.webp$/.test(name))
    await fs
      .unlink(path.join("public/images", name))
      .catch((error) =>
        console.warn(`Temporary image retained: ${name} (${error.code})`),
      );
const source = manifest.reduce((sum, item) => sum + item.originalBytes, 0);
const optimized = manifest.reduce((sum, item) => sum + item.optimizedBytes, 0);
console.log(
  JSON.stringify({
    images: manifest.length,
    sourceBytes: source,
    optimizedBytes: optimized,
    reduction: `${(100 - (optimized / source) * 100).toFixed(1)}%`,
  }),
);
