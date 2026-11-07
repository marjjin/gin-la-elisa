import fs from "node:fs/promises";
import sharp from "sharp";

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
];
const metadataPath = "src/image-metadata.json";
const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
const manifestPath = "assets/manifest.json";
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

await fs.mkdir("public/images", { recursive: true });
for (const name of names) {
  const input = `assets/referencias-optimizadas/${name}.webp`;
  const rotation = /^(pan-hamburguesa|prepizza)/.test(name) ? 90 : 0;
  const main = await sharp(input)
    .rotate(rotation)
    .resize({ width: 1280, height: 1440, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(`public/images/${name}.webp`);
  const small = await sharp(input)
    .rotate(rotation)
    .resize({ width: 640, height: 720, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(`public/images/${name}-small.webp`);
  metadata[name] = { width: main.width, height: main.height, smallWidth: small.width };
  const source = manifest.find((entry) => entry.output === input);
  if (source) {
    source.availableForSite = true;
    source.catalogOutput = `public/images/${name}.webp`;
    source.catalogBytes = main.size;
  }
}
await fs.writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${names.length} catalog photos with responsive sizes.`);
