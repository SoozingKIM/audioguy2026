import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, "..", ".env.local"));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const DISCO_DIR = path.join(os.homedir(), "Downloads", "sound360-disco");

// Artist/title come from the filenames; releaseDate researched per album.
const ENTRIES = [
  { file: "ARTMS - Club Icarus.jpeg", artist: "ARTMS", title: "Club Icarus", releaseDate: "2025-06-13" },
  { file: "ARTMS - DALL.jpeg", artist: "ARTMS", title: "DALL", releaseDate: "2024-05-31" },
  { file: "DPR IAN - SAINT.jpg", artist: "DPR IAN", title: "SAINT", releaseDate: "2024-06-07" },
  { file: "Danny Koo - MOONLIGHT.jpg", artist: "Danny Koo", title: "MOONLIGHT", releaseDate: "2024-04-10" },
  { file: "idntt - unevermet.jpeg", artist: "idntt", title: "unevermet", releaseDate: "2025-08-11" },
  { file: "드래곤포니 - RUN RUN RUN.jpg", artist: "드래곤포니", title: "RUN RUN RUN", releaseDate: "2026-03-10" },
  { file: "폴킴 - 한강에서.png", artist: "폴킴", title: "한강에서", releaseDate: "2023-05-25" },
  { file: "하하 - 키 작은 꼬마 이야기.jpg", artist: "하하", title: "키 작은 꼬마 이야기", releaseDate: "2007-09-04" },
];

function detectMime(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.slice(0, 4).toString("ascii") === "RIFF") return "image/webp";
  return "image/jpeg";
}

async function uploadLocalFile(absPath) {
  const buf = fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buf, {
    filename: path.basename(absPath),
    contentType: detectMime(buf),
  });
  return asset._id;
}

function imageRef(assetId, alt) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, alt };
}

// Verify all files exist before touching Sanity.
for (const e of ENTRIES) {
  const abs = path.join(DISCO_DIR, e.file);
  if (!fs.existsSync(abs)) {
    console.error(`✗ Missing cover file: ${abs}`);
    process.exit(1);
  }
}

// Place new entries above the current top of the Studio orderable list.
const ranked = await client.fetch(
  `*[_type == "discographyEntry" && defined(orderRank)] | order(orderRank asc)[0].orderRank`,
);
let cursor = (ranked ? LexoRank.parse(ranked) : LexoRank.middle()).genPrev();

// Create oldest-release first so the newest release ends up with the latest
// _createdAt (front of page 1 under `_createdAt desc`) and the smallest orderRank.
const order = ENTRIES.map((_, i) => i).sort((a, b) =>
  ENTRIES[a].releaseDate.localeCompare(ENTRIES[b].releaseDate),
);

console.log(`→ Seeding ${ENTRIES.length} sound360 discography entries…`);
let created = 0;
for (const i of order) {
  const e = ENTRIES[i];
  const id = `sound360-disc-${String(i + 1).padStart(2, "0")}`;
  if (await client.getDocument(id)) {
    console.log(`  · ${id} (${e.artist} - ${e.title}) exists, skipping`);
    continue;
  }
  const assetId = await uploadLocalFile(path.join(DISCO_DIR, e.file));
  await client.createIfNotExists({
    _id: id,
    _type: "discographyEntry",
    title: e.title,
    artist: e.artist,
    releaseDate: e.releaseDate,
    brand: "sound360",
    cover: imageRef(assetId, `${e.title} 커버`),
    orderRank: cursor.toString(),
  });
  cursor = cursor.genPrev();
  created += 1;
  console.log(`  ✓ ${e.artist} - ${e.title} (${e.releaseDate})`);
}
console.log(`✓ Done. Created ${created}, skipped ${ENTRIES.length - created}.`);
