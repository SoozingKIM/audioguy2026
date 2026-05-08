import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, "..", ".env.local"));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error("✗ SANITY_WRITE_TOKEN is missing in .env.local");
  process.exit(1);
}

const WORK_SCOPES = [
  { slug: "mixing", title: "Mixing" },
  { slug: "mastering", title: "Mastering" },
  { slug: "recording", title: "Recording" },
  { slug: "location-recording", title: "Location Recording" },
  { slug: "sound-design", title: "Sound Design" },
  { slug: "producing", title: "Producing" },
  { slug: "composing", title: "Composing" },
];

// Audioguy 엔트리 중 Location Recording 카테고리에도 포함시킬 항목들
const LOCATION_RECORDING_ENTRIES = ["003", "006", "007"];

const ENTRIES = [
  // Audioguy
  { id: "001", title: "달의 기억", artist: "김도연", releaseDate: "2024-08-15", brand: "audioguy", scopes: ["mixing", "mastering"] },
  { id: "002", title: "Echoes", artist: "The Loop", releaseDate: "2024-05-20", brand: "audioguy", scopes: ["mixing"] },
  { id: "003", title: "푸른 새벽", artist: "이서영", releaseDate: "2024-02-10", brand: "audioguy", scopes: ["recording", "mixing", "mastering"] },
  { id: "004", title: "Distance", artist: "Hyun Park", releaseDate: "2023-11-08", brand: "audioguy", scopes: ["mastering"] },
  { id: "005", title: "Memory Lane", artist: "Sora", releaseDate: "2023-07-22", brand: "audioguy", scopes: ["mixing", "mastering"] },
  { id: "006", title: "한낮의 꿈", artist: "박지민 트리오", releaseDate: "2023-03-14", brand: "audioguy", scopes: ["recording", "mixing"] },
  { id: "007", title: "Glow", artist: "Yuna", releaseDate: "2022-09-30", brand: "audioguy", scopes: ["mixing"] },
  // Sound360
  { id: "008", title: "Sphere", artist: "Immersive Collective", releaseDate: "2024-09-12", brand: "sound360", scopes: ["sound-design"] },
  { id: "009", title: "Resonance", artist: "Spatial Lab", releaseDate: "2024-06-04", brand: "sound360", scopes: ["sound-design", "mixing"] },
  { id: "010", title: "Atmospheres", artist: "Park Jihoon", releaseDate: "2024-01-25", brand: "sound360", scopes: ["sound-design"] },
  { id: "011", title: "공명", artist: "정유진", releaseDate: "2023-10-18", brand: "sound360", scopes: ["sound-design", "mastering"] },
  { id: "012", title: "Drift", artist: "Kim Soo", releaseDate: "2023-05-09", brand: "sound360", scopes: ["sound-design"] },
  // Seoro
  { id: "013", title: "함께", artist: "서로 컬렉티브", releaseDate: "2024-07-03", brand: "seoro", scopes: ["producing", "mixing"] },
  { id: "014", title: "Bridges", artist: "Various Artists", releaseDate: "2024-04-15", brand: "seoro", scopes: ["producing"] },
  { id: "015", title: "교차점", artist: "김민수 x 이수진", releaseDate: "2023-12-06", brand: "seoro", scopes: ["producing", "mixing", "mastering"] },
  { id: "016", title: "Together Again", artist: "Seoro Project", releaseDate: "2023-08-20", brand: "seoro", scopes: ["recording", "producing"] },
  { id: "017", title: "곁", artist: "류정은", releaseDate: "2023-01-30", brand: "seoro", scopes: ["producing", "composing"] },
];

const PAGE_HEROES = [
  { id: "homePage", seed: "audioguy-home", alt: "Audioguy 메인 비주얼" },
  { id: "aboutPage", seed: "audioguy-about", alt: "오디오가이 소개" },
  { id: "audioguyPage", seed: "audioguy-control-room", alt: "Audioguy 컨트롤룸" },
  { id: "sound360Page", seed: "sound360-immersive", alt: "Sound360 이머시브" },
  { id: "seoroPage", seed: "seoro-space", alt: "Seoro 공간" },
  { id: "discographyPage", seed: "audioguy-records", alt: "Discography" },
  { id: "contactPage", seed: "audioguy-reception", alt: "Contact" },
];

const PAGE_IMAGE_SLOTS = {
  aboutPage: [
    { key: "team", seed: "audioguy-team", alt: "팀 사진" },
    { key: "space", seed: "audioguy-space", alt: "공간 사진" },
  ],
  audioguyPage: [
    { key: "control-room", seed: "audioguy-control", alt: "컨트롤룸" },
    { key: "live-room", seed: "audioguy-live", alt: "라이브룸" },
    { key: "lounge", seed: "audioguy-lounge", alt: "라운지" },
  ],
  sound360Page: [
    { key: "immersive", seed: "sound360-360", alt: "이머시브 스튜디오" },
  ],
  seoroPage: [
    { key: "space-1", seed: "seoro-1", alt: "Seoro 공간 1" },
    { key: "space-2", seed: "seoro-2", alt: "Seoro 공간 2" },
  ],
};

async function main() {
  const cmd = process.argv[2];
  if (cmd === "clean") return clean();
  if (cmd === "rerank") return rerank();
  return seed();
}

async function rerank() {
  const docs = await client.fetch(
    `*[_type == "discographyEntry"] | order(_createdAt asc) {_id}`,
  );
  if (docs.length === 0) {
    console.log("(no entries to rerank)");
    return;
  }
  console.log(`→ Re-ranking ${docs.length} entries by upload time (oldest first)…`);
  let rank = LexoRank.middle();
  const tx = client.transaction();
  for (const d of docs) {
    tx.patch(d._id, (p) => p.set({ orderRank: rank.toString() }));
    rank = rank.genNext();
  }
  await tx.commit();
  console.log(`✓ Re-ranked ${docs.length} entries`);
}

async function seed() {
  await backfillOrderRanks();

  console.log("→ Seeding work scopes…");
  for (const s of WORK_SCOPES) {
    const id = `dummy-scope-${s.slug}`;
    await client.createIfNotExists({
      _id: id,
      _type: "workScope",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
    });
    console.log(`  ✓ ${s.title}`);
  }

  console.log("\n→ Seeding discography entries…");
  for (const e of ENTRIES) {
    const docId = `dummy-entry-${e.id}`;
    if (await client.getDocument(docId)) {
      console.log(`  · ${docId} exists, skipping`);
      continue;
    }
    const assetId = await uploadImage(`disc-${e.id}`, 800, 800);
    await client.createIfNotExists({
      _id: docId,
      _type: "discographyEntry",
      title: e.title,
      artist: e.artist,
      releaseDate: e.releaseDate,
      brand: e.brand,
      cover: imageRef(assetId, `${e.title} 커버`),
      scopes: e.scopes.map((slug) => ({
        _type: "reference",
        _ref: `dummy-scope-${slug}`,
        _key: `${slug}-${randomUUID().slice(0, 6)}`,
      })),
    });
    console.log(`  ✓ ${e.title} (${e.brand})`);
  }

  await tagLocationRecording();
  await seedFeaturedPicks();

  console.log("\n→ Seeding site settings…");
  if (!(await client.getDocument("siteSettings"))) {
    const logoId = await uploadImage("audioguy-logo", 400, 400);
    await client.createIfNotExists({
      _id: "siteSettings",
      _type: "siteSettings",
      siteName: "Audioguy",
      logo: imageRef(logoId, "Audioguy 로고"),
      tagline: "Sound · Music · Production",
      contactEmail: "hello@audioguy.com",
      contactPhone: "02-1234-5678",
      address: "서울특별시 마포구 양화로 123\n오디오가이 빌딩 4층",
      socials: [
        { _key: "ig", label: "Instagram", url: "https://instagram.com/audioguy" },
        { _key: "yt", label: "YouTube", url: "https://youtube.com/@audioguy" },
      ],
    });
    console.log("  ✓ siteSettings created");
  } else {
    console.log("  · siteSettings exists, skipping");
  }

  console.log("\n→ Seeding page hero images & slots…");
  for (const p of PAGE_HEROES) {
    const existing = await client.getDocument(p.id);
    if (existing?.heroImage) {
      console.log(`  · ${p.id} already has hero, skipping`);
      continue;
    }
    const heroId = await uploadImage(p.seed, 2000, 1100);
    const slots = PAGE_IMAGE_SLOTS[p.id] ?? [];
    const slotData = [];
    for (const slot of slots) {
      const slotAssetId = await uploadImage(slot.seed, 1200, 900);
      slotData.push({
        _type: "imageSlot",
        _key: `${slot.key}-${randomUUID().slice(0, 6)}`,
        key: slot.key,
        image: imageRef(slotAssetId, slot.alt),
        alt: slot.alt,
      });
    }
    await client.createOrReplace({
      _id: p.id,
      _type: p.id,
      heroImage: imageRef(heroId, p.alt),
      images: slotData,
    });
    console.log(`  ✓ ${p.id} (hero + ${slotData.length} slots)`);
  }

  console.log("\n✓ Done.");
}

async function seedFeaturedPicks() {
  console.log("\n→ Seeding featured discography picks…");
  const picks = [
    { pageId: "audioguyPage", field: "featuredDiscography", entryIds: ["001", "002", "003"] },
    { pageId: "audioguyPage", field: "featuredLocationRecording", entryIds: ["003", "006", "007"] },
    { pageId: "sound360Page", field: "featuredDiscography", entryIds: ["008", "009", "010"] },
    { pageId: "seoroPage", field: "featuredDiscography", entryIds: ["013", "014", "015"] },
  ];
  for (const pick of picks) {
    const doc = await client.getDocument(pick.pageId);
    if (!doc) {
      console.log(`  · ${pick.pageId} not found, skipping`);
      continue;
    }
    const existing = doc[pick.field];
    if (existing && existing.length > 0) {
      console.log(`  · ${pick.pageId}.${pick.field} already set, skipping`);
      continue;
    }
    await client
      .patch(pick.pageId)
      .set({
        [pick.field]: pick.entryIds.map((id) => ({
          _type: "reference",
          _ref: `dummy-entry-${id}`,
          _key: `pick-${id}-${randomUUID().slice(0, 6)}`,
        })),
      })
      .commit();
    console.log(`  ✓ ${pick.pageId}.${pick.field} (${pick.entryIds.join(", ")})`);
  }
}

async function tagLocationRecording() {
  console.log("\n→ Tagging Location Recording entries…");
  const ref = "dummy-scope-location-recording";
  for (const id of LOCATION_RECORDING_ENTRIES) {
    const docId = `dummy-entry-${id}`;
    const doc = await client.getDocument(docId);
    if (!doc) {
      console.log(`  · ${docId} not found, skipping`);
      continue;
    }
    const has = (doc.scopes ?? []).some((s) => s._ref === ref);
    if (has) {
      console.log(`  · ${docId} already tagged`);
      continue;
    }
    await client
      .patch(docId)
      .setIfMissing({ scopes: [] })
      .append("scopes", [
        {
          _type: "reference",
          _ref: ref,
          _key: `loc-rec-${randomUUID().slice(0, 6)}`,
        },
      ])
      .commit();
    console.log(`  ✓ tagged ${docId}`);
  }
}

async function backfillOrderRanks() {
  const docs = await client.fetch(
    `*[_type == "discographyEntry" && !defined(orderRank)]
       | order(releaseDate desc, _createdAt desc) {_id}`,
  );
  if (docs.length === 0) return;
  console.log(`→ Backfilling orderRank on ${docs.length} entries…`);
  let rank = LexoRank.middle();
  const tx = client.transaction();
  for (const d of docs) {
    tx.patch(d._id, (p) => p.set({ orderRank: rank.toString() }));
    rank = rank.genNext();
  }
  await tx.commit();
  console.log(`  ✓ orderRank set on ${docs.length} entries`);
}

async function clean() {
  console.log("→ Finding dummy docs…");
  const ids = await client.fetch('*[_id match "dummy-*"]._id');
  if (ids.length === 0) {
    console.log("  (nothing to delete)");
    return;
  }
  const tx = client.transaction();
  for (const id of ids) tx.delete(id);
  await tx.commit();
  console.log(`✓ Deleted ${ids.length} dummy docs`);
  console.log(
    "Note: site settings & page singletons (siteSettings, homePage, ...) " +
      "are NOT deleted by clean. To reset them, do it from Studio.",
  );
}

async function uploadImage(seed, w, h) {
  const url = `https://picsum.photos/seed/${seed}/${w}/${h}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, {
    filename: `dummy-${seed}.jpg`,
    contentType: "image/jpeg",
  });
  return asset._id;
}

function imageRef(assetId, alt) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt,
  };
}

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
