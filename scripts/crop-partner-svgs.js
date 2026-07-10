// Tighten each partner SVG's viewBox to its rendered content bbox.
// Rasterize at high scale, scan the alpha channel for the bounding box,
// then rewrite width/height/viewBox to the content rect (vector preserved).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "seoro", "partners");
const SCALE = 6; // 150x100 -> 900x600 raster for bbox detection
const ALPHA_THRESHOLD = 16;

async function bbox(file) {
  const svg = fs.readFileSync(file, "utf8");
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 * SCALE })
    .resize(150 * SCALE, 100 * SCALE, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + (channels - 1)];
      if (a > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return {
    x: minX / SCALE,
    y: minY / SCALE,
    w: (maxX - minX + 1) / SCALE,
    h: (maxY - minY + 1) / SCALE,
  };
}

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".svg"));
  const results = [];
  for (const f of files) {
    const file = path.join(DIR, f);
    const bb = await bbox(file);
    if (!bb) {
      console.log(`${f}: NO CONTENT`);
      continue;
    }
    const pad = 0.5;
    const x = Math.max(0, bb.x - pad);
    const y = Math.max(0, bb.y - pad);
    const w = bb.w + pad * 2;
    const h = bb.h + pad * 2;
    let svg = fs.readFileSync(file, "utf8");
    // Replace the opening <svg ...> width/height/viewBox.
    svg = svg.replace(
      /<svg[^>]*>/,
      `<svg width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`
    );
    fs.writeFileSync(file, svg);
    const key = f.replace(/\.svg$/, "");
    results.push({ key, h: Math.round(h) });
    console.log(`${f}: ${w.toFixed(1)} x ${h.toFixed(1)}`);
  }
  console.log("\nHEIGHTS:");
  console.log(results.map((r) => `{ key: "${r.key}", h: ${r.h} }`).join(", "));
})();
