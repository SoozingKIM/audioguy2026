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
const LOCATION_RECORDING_ENTRIES = ["003", "006", "007", "018", "020"];

const ENTRIES = [
  // Audioguy
  { id: "001", title: "달의 기억", artist: "김도연", releaseDate: "2024-08-15", brand: "audioguy", scopes: ["mixing", "mastering"] },
  { id: "002", title: "Echoes", artist: "The Loop", releaseDate: "2024-05-20", brand: "audioguy", scopes: ["mixing"] },
  { id: "003", title: "푸른 새벽", artist: "이서영", releaseDate: "2024-02-10", brand: "audioguy", scopes: ["recording", "mixing", "mastering"] },
  { id: "004", title: "Distance", artist: "Hyun Park", releaseDate: "2023-11-08", brand: "audioguy", scopes: ["mastering"] },
  { id: "005", title: "Memory Lane", artist: "Sora", releaseDate: "2023-07-22", brand: "audioguy", scopes: ["mixing", "mastering"] },
  { id: "006", title: "한낮의 꿈", artist: "박지민 트리오", releaseDate: "2023-03-14", brand: "audioguy", scopes: ["recording", "mixing"] },
  { id: "007", title: "Glow", artist: "Yuna", releaseDate: "2022-09-30", brand: "audioguy", scopes: ["mixing"] },
  { id: "018", title: "겨울 정원", artist: "안나 첼로 콰르텟", releaseDate: "2025-02-14", brand: "audioguy", scopes: ["recording", "mixing", "mastering"] },
  { id: "019", title: "Lighthouse", artist: "최예진", releaseDate: "2024-12-01", brand: "audioguy", scopes: ["mixing", "mastering"] },
  { id: "020", title: "도시의 밤", artist: "노이즈 컬렉티브", releaseDate: "2024-10-22", brand: "audioguy", scopes: ["recording", "mixing"] },
  // Sound360
  { id: "008", title: "Sphere", artist: "Immersive Collective", releaseDate: "2024-09-12", brand: "sound360", scopes: ["sound-design"] },
  { id: "009", title: "Resonance", artist: "Spatial Lab", releaseDate: "2024-06-04", brand: "sound360", scopes: ["sound-design", "mixing"] },
  { id: "010", title: "Atmospheres", artist: "Park Jihoon", releaseDate: "2024-01-25", brand: "sound360", scopes: ["sound-design"] },
  { id: "011", title: "공명", artist: "정유진", releaseDate: "2023-10-18", brand: "sound360", scopes: ["sound-design", "mastering"] },
  { id: "012", title: "Drift", artist: "Kim Soo", releaseDate: "2023-05-09", brand: "sound360", scopes: ["sound-design"] },
  { id: "021", title: "Orbit", artist: "Atmos Studio", releaseDate: "2025-03-08", brand: "sound360", scopes: ["sound-design", "mixing"] },
  { id: "022", title: "구체의 노래", artist: "이지호", releaseDate: "2024-11-15", brand: "sound360", scopes: ["sound-design"] },
  { id: "023", title: "Spatial Bloom", artist: "Helix Audio", releaseDate: "2024-08-02", brand: "sound360", scopes: ["sound-design", "mastering"] },
  { id: "024", title: "광야의 음향", artist: "한지원", releaseDate: "2024-03-27", brand: "sound360", scopes: ["sound-design", "recording"] },
  { id: "025", title: "Aurora", artist: "Nightfall Ensemble", releaseDate: "2023-12-19", brand: "sound360", scopes: ["sound-design"] },
  // Seoro
  { id: "013", title: "함께", artist: "서로 컬렉티브", releaseDate: "2024-07-03", brand: "seoro", scopes: ["producing", "mixing"] },
  { id: "014", title: "Bridges", artist: "Various Artists", releaseDate: "2024-04-15", brand: "seoro", scopes: ["producing"] },
  { id: "015", title: "교차점", artist: "김민수 x 이수진", releaseDate: "2023-12-06", brand: "seoro", scopes: ["producing", "mixing", "mastering"] },
  { id: "016", title: "Together Again", artist: "Seoro Project", releaseDate: "2023-08-20", brand: "seoro", scopes: ["recording", "producing"] },
  { id: "017", title: "곁", artist: "류정은", releaseDate: "2023-01-30", brand: "seoro", scopes: ["producing", "composing"] },
  { id: "026", title: "마주보다", artist: "윤하 x 정승환", releaseDate: "2025-04-10", brand: "seoro", scopes: ["producing", "mixing"] },
  { id: "027", title: "Echoes of Us", artist: "Common Ground", releaseDate: "2024-12-05", brand: "seoro", scopes: ["producing", "composing"] },
  { id: "028", title: "둘이서", artist: "박지윤 트리오", releaseDate: "2024-09-18", brand: "seoro", scopes: ["recording", "mixing", "producing"] },
  { id: "029", title: "Mosaic", artist: "Seoro Strings", releaseDate: "2024-06-30", brand: "seoro", scopes: ["producing", "mastering"] },
  { id: "030", title: "동행", artist: "강민호", releaseDate: "2024-02-22", brand: "seoro", scopes: ["composing", "producing"] },
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

const PUBLIC_DIR = path.join(__dirname, "..", "public");

// Content photos extracted from Figma (downloaded into /public), uploaded to
// Sanity so they can be managed from the Studio. Decorative gradients/glows
// stay in CSS and are intentionally not listed here.
// `section` matches the per-section array field in the page schema
// (pageSingletons.ts). Slots without `section` go into the flat `images` array.
const PAGE_CONTENT_IMAGES = {
  audioguyPage: {
    hero: { file: "audioguy/hero.jpg", alt: "Audioguy 스튜디오" },
    slots: [
      { key: "orchestra-1", file: "audioguy/orchestra-1.jpg", alt: "로케이션 레코딩 1", section: "serviceImages" },
      { key: "orchestra-2", file: "audioguy/orchestra-2.jpg", alt: "로케이션 레코딩 2", section: "serviceImages" },
      { key: "piano", file: "audioguy/piano.jpg", alt: "Bösendorfer 피아노", section: "studioImages" },
      { key: "team-1", file: "audioguy/team-1.jpg", alt: "안범현", section: "teamImages" },
    ],
  },
  aboutPage: {
    slots: [
      { key: "ecosystem", file: "about/ecosystem.jpg", alt: "에코시스템", section: "ecosystemImages" },
      { key: "team-1", file: "about/team-1.jpg", alt: "최정훈", section: "peopleImages" },
      { key: "team-2", file: "about/team-2.jpg", alt: "이동주", section: "peopleImages" },
      { key: "team-3", file: "about/team-3.jpg", alt: "김소이", section: "peopleImages" },
      { key: "team-4", file: "about/team-4.jpg", alt: "오대규", section: "peopleImages" },
      { key: "studio-1", file: "about/studio-1.jpg", alt: "Seochon Studio", section: "presenceImages" },
      { key: "studio-2", file: "about/studio-2.jpg", alt: "Seocho Studio", section: "presenceImages" },
    ],
  },
  sound360Page: {
    slots: [
      { key: "studio", file: "sound360/studio.jpg", alt: "Sound360 스튜디오", section: "studioImages" },
      { key: "team-1", file: "sound360/team-1.jpg", alt: "오대규", section: "teamImages" },
      { key: "team-2", file: "sound360/team-2.jpg", alt: "오영택", section: "teamImages" },
    ],
  },
  // Seoro's only Sanity-managed images are the DSP network logos, which go into
  // the `dspLogos` section (keys: dsp-<slug>). They have no bundled files — the
  // editor uploads each logo in the Studio — so there's nothing to seed here.
};

async function main() {
  const cmd = process.argv[2];
  if (cmd === "clean") return clean();
  if (cmd === "rerank") return rerank();
  if (cmd === "images") return seedPageImages();
  if (cmd === "content") return seedPageContent();
  if (cmd === "migrate") return migrateImageSections();
  return seed();
}

// One-time: moves slots from the legacy flat `images` array into the per-section
// arrays (in place — keeps the existing uploaded assets) and clears `images`,
// removing the "Unknown field" warning in the Studio.
const IMAGE_SECTION_OF = {
  aboutPage: (key) =>
    key.startsWith("team") ? "peopleImages"
    : key.startsWith("studio") ? "presenceImages"
    : "ecosystemImages",
  audioguyPage: (key) =>
    key.startsWith("team") ? "teamImages"
    : key === "piano" ? "studioImages"
    : "serviceImages",
  sound360Page: (key) => (key.startsWith("team") ? "teamImages" : "studioImages"),
  // Seoro's legacy `card-studio` slot is no longer used anywhere; returning null
  // drops it so the orphaned `images` array is cleared once the schema moves to
  // the `dspLogos` section.
  seoroPage: () => null,
};

async function migrateImageSections() {
  console.log("→ Migrating legacy `images` into per-section arrays…");
  for (const [pageId, sectionOf] of Object.entries(IMAGE_SECTION_OF)) {
    const doc = await client.getDocument(pageId);
    const legacy = doc?.images;
    if (!Array.isArray(legacy) || legacy.length === 0) {
      console.log(`  · ${pageId}: no legacy images, skipping`);
      continue;
    }
    const bySection = {};
    for (const slot of legacy) {
      const field = sectionOf(slot.key ?? "");
      if (!field) continue; // null → drop the dead slot
      (bySection[field] ||= []).push(slot);
    }
    await client.patch(pageId).set(bySection).unset(["images"]).commit();
    console.log(
      `  ✓ ${pageId}: ${legacy.length} slot(s) → ${Object.entries(bySection)
        .map(([f, v]) => `${f}(${v.length})`)
        .join(", ")}`,
    );
  }
  console.log("✓ Done.");
}

// Localized page text — pushes the i18n message values into the page
// singletons' localized fields so the Studio shows the current content.
// Maps: page singleton → { ns: message namespace, fields: { sanityField: "dot.path" } }
const PAGE_CONTENT_TEXT = {
  homePage: {
    ns: "Home",
    fields: {
      heroTitle1: "hero.title1",
      heroTitle2: "hero.title2",
      heroDesc1: "hero.desc1",
      heroDesc2: "hero.desc2",
      overviewLabel: "overview.label",
      overviewTitle: "overview.title",
      overviewP1: "overview.p1",
      overviewP2: "overview.p2",
      overviewP3: "overview.p3",
      overviewP4: "overview.p4",
      audioguyLabel: "cards.audioguy.label",
      audioguyDesc: "cards.audioguy.description",
      agstudioLabel: "cards.agstudio.label",
      agstudioDesc: "cards.agstudio.description",
      sound360Label: "cards.sound360.label",
      sound360Desc: "cards.sound360.description",
      seoroLabel: "cards.seoro.label",
      seoroDesc: "cards.seoro.description",
    },
  },
  // Flat-namespace pages: `keys` lists every message path the page renders; the
  // Sanity field name is the camelCase of the path (see seedPageContent).
  aboutPage: {
    ns: "About",
    keys: [
      "hero.eyebrow", "hero.soul", "hero.title", "hero.subtitle",
      "scale.label", "scale.title", "scale.description",
      "scale.stat1Label", "scale.stat1Value", "scale.stat2Label", "scale.stat2Value",
      "scale.stat3Label", "scale.stat3Value", "scale.stat4Label", "scale.stat4Value",
      "ecosystem.label", "ecosystem.title", "ecosystem.description",
      "ecosystem.brand1Name", "ecosystem.brand1Desc", "ecosystem.brand2Name", "ecosystem.brand2Desc",
      "ecosystem.brand3Name", "ecosystem.brand3Desc", "ecosystem.brand4Name", "ecosystem.brand4Desc",
      "heritage.label", "heritage.title", "heritage.description",
      "heritage.month5", "heritage.month4", "heritage.month3", "heritage.month2", "heritage.month1",
      "heritage.achievement",
      "tech.title", "tech.subtitle", "tech.name", "tech.description", "tech.cardTitle", "tech.cardDesc",
      "people.label", "people.title", "people.description",
      "people.member1Name", "people.member1Role", "people.member2Name", "people.member2Role",
      "people.member3Name", "people.member3Role", "people.member4Name", "people.member4Role",
      "proof.label", "proof.title", "proof.description",
      "presence.label", "presence.title", "presence.description",
      "presence.studio1Name", "presence.studio1DescKr", "presence.studio1DescEn",
      "presence.studio2Name", "presence.studio2DescKr", "presence.studio2DescEn",
    ],
  },
  audioguyPage: {
    ns: "Audioguy",
    keys: [
      "heroAlt", "introduction",
      "locationRecording", "locationLabel", "locationTitleEn", "locationSubKr", "locationBody1", "locationBody2",
      "studioRecording", "studioRecLabel", "studioRecTitleEn", "studioRecSubKr",
      "mixingMaster", "mixingLabel", "mixingTitleEn", "mixingSubKr",
      "demoTape",
      "studio", "studioSubKr", "studioName", "studioBody",
      "discography", "recentWork", "selectedAlbums",
      "ourTeam", "team1Name", "team1Role", "team2Name", "team2Role",
      "team2Bullet1", "team2Bullet2", "team2Bullet3",
    ],
  },
  sound360Page: {
    ns: "Sound360",
    keys: [
      "label", "title", "description", "workScope",
      "service1", "service2", "service3", "service4",
      "studio", "studioSubKr", "studioTitle", "studioBody",
      "discography", "selectedAlbums",
      "ourTeam", "team1Name", "team1Role", "team2Name", "team2Role",
    ],
  },
  seoroPage: {
    ns: "Seoro",
    keys: [
      "label", "title", "desc1", "desc2",
      "business", "businessCaption", "businessDesc",
      "process", "processCaption", "processDesc",
      "step1Title", "step1Hint", "step2Title", "step3Title", "step4Title", "step5Title", "step6Title",
      "dspNetwork", "dspSubtitle", "dspDesc", "dspTab1", "dspTab2", "dspTab3", "dspTab4",
      "partners", "partnersCaption", "partnersDesc", "partnerTab1", "partnerTab2", "partnerTab3", "partnerTab4",
      "settlement", "settlementCaption", "settlementSystem", "settlementDesc",
      "settleTab1", "settleTab2", "settleTab3", "settleTab4",
      "discography", "selectedAlbums",
    ],
  },
  discographyPage: {
    ns: "Discography",
    keys: ["label", "title", "description", "totalLabel", "totalUnit", "empty"],
  },
  contactPage: {
    ns: "Contact",
    keys: [
      "title", "brand", "company", "name", "position", "phone", "email", "memo",
      "submit", "submitting",
      "companyPh", "namePh", "positionPh", "phonePh", "emailPh", "memoPh",
      "success", "error",
    ],
  },
};

const LOCALES = ["ko", "en", "jp"];

function getByPath(obj, dotPath) {
  return dotPath
    .split(".")
    .reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

async function seedPageContent() {
  console.log("→ Seeding localized page content from message files…");
  const messages = {};
  for (const l of LOCALES) {
    messages[l] = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "messages", `${l}.json`), "utf8"),
    );
  }
  for (const [pageId, cfg] of Object.entries(PAGE_CONTENT_TEXT)) {
    await client.createIfNotExists({ _id: pageId, _type: pageId });
    const patch = {};
    // `keys` is shorthand for a map from message path → Sanity field, where the
    // field name is the camelCase of the path (`scale.stat1Label` →
    // `scaleStat1Label`; flat keys unchanged). Mirrors toFieldName() in
    // lib/pageContent. `fields` is an explicit { field: path } override.
    const camel = (p) => p.replace(/\.(\w)/g, (_, c) => c.toUpperCase());
    const fieldMap =
      cfg.fields ?? Object.fromEntries((cfg.keys ?? []).map((k) => [camel(k), k]));
    for (const [field, msgPath] of Object.entries(fieldMap)) {
      const value = {};
      for (const l of LOCALES) {
        const v = getByPath(messages[l]?.[cfg.ns], msgPath);
        if (typeof v === "string") value[l] = v;
      }
      if (Object.keys(value).length) patch[field] = value;
    }
    await client.patch(pageId).set(patch).commit();
    console.log(`  ✓ ${pageId} (${Object.keys(patch).length} fields)`);
  }
  console.log("✓ Done.");
}

function detectMime(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.slice(0, 4).toString("ascii") === "RIFF") return "image/webp";
  return "image/jpeg";
}

async function uploadLocalImage(relPath) {
  const abs = path.join(PUBLIC_DIR, relPath);
  const buf = fs.readFileSync(abs);
  const contentType = detectMime(buf);
  const asset = await client.assets.upload("image", buf, {
    filename: path.basename(relPath),
    contentType,
  });
  return asset._id;
}

// Force-replaces heroImage + images on each page singleton with the Figma
// content photos. Preserves other fields (featuredDiscography, etc.).
async function seedPageImages() {
  console.log("→ Uploading page content images to Sanity…");
  for (const [pageId, cfg] of Object.entries(PAGE_CONTENT_IMAGES)) {
    await client.createIfNotExists({ _id: pageId, _type: pageId });
    const patch = {};
    if (cfg.hero) {
      const heroId = await uploadLocalImage(cfg.hero.file);
      patch.heroImage = imageRef(heroId, cfg.hero.alt);
    }
    const unset = [];
    if (cfg.slots?.length) {
      const bySection = {};
      for (const s of cfg.slots) {
        const assetId = await uploadLocalImage(s.file);
        const field = s.section || "images";
        (bySection[field] ||= []).push({
          _type: "imageSlot",
          _key: `${s.key}-${randomUUID().slice(0, 6)}`,
          key: s.key,
          image: imageRef(assetId, s.alt),
          alt: s.alt,
        });
      }
      Object.assign(patch, bySection);
      // Clear the legacy flat array when this page now uses per-section fields.
      if (!bySection.images) unset.push("images");
    }
    let tx = client.patch(pageId).set(patch);
    if (unset.length) tx = tx.unset(unset);
    await tx.commit();
    const slotKeys = (cfg.slots ?? []).map((s) => s.key).join(", ");
    console.log(
      `  ✓ ${pageId}${cfg.hero ? " (hero)" : ""}${slotKeys ? ` [${slotKeys}]` : ""}`,
    );
  }
  console.log("✓ Done.");
}

async function rerank() {
  const docs = await client.fetch(
    `*[_type == "discographyEntry"] | order(releaseDate desc, _createdAt desc) {_id}`,
  );
  if (docs.length === 0) {
    console.log("(no entries to rerank)");
    return;
  }
  console.log(`→ Re-ranking ${docs.length} entries by release date (newest first)…`);
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
    { pageId: "audioguyPage", field: "featuredDiscography", entryIds: ["018", "019", "001", "002", "003"] },
    { pageId: "audioguyPage", field: "featuredLocationRecording", entryIds: ["018", "020", "003", "006", "007"] },
    { pageId: "sound360Page", field: "featuredDiscography", entryIds: ["021", "022", "008", "009", "010"] },
    { pageId: "seoroPage", field: "featuredDiscography", entryIds: ["026", "027", "028", "013", "014"] },
  ];
  for (const pick of picks) {
    const doc = await client.getDocument(pick.pageId);
    if (!doc) {
      console.log(`  · ${pick.pageId} not found, skipping`);
      continue;
    }
    const existing = doc[pick.field];
    if (existing && existing.length >= pick.entryIds.length) {
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
