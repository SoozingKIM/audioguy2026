/**
 * sync-community.mjs
 *
 * audioguy.co.kr/community/recent.php → Sanity의 `communityCache` 싱글톤으로
 * 최근 게시글 5개씩(구인구직 + 오디오가이 칼럼) 복사.
 *
 * 실행 환경:
 *   - GitHub Actions cron (30분마다 자동)
 *   - 로컬에서 `node scripts/sync-community.mjs` (수동)
 *
 * 필요 환경변수:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID  (또는 SANITY_PROJECT_ID)
 *   - NEXT_PUBLIC_SANITY_DATASET     (또는 SANITY_DATASET. 기본 production)
 *   - NEXT_PUBLIC_SANITY_API_VERSION (기본 2024-01-01)
 *   - SANITY_WRITE_TOKEN             (Sanity에 쓰기 권한 가진 토큰)
 *   - COMMUNITY_API_TOKEN            (audioguy.co.kr/community/recent.php
 *                                     접근 토큰. 해당 PHP의 $EXPECTED_TOKEN과 일치)
 *
 * 로컬에서 실행 시 .env.local 자동 로드. GitHub Actions에선 Repository
 * Secrets로 전달됨.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

// .env.local 자동 로드 (로컬 실행용)
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const i = line.indexOf("=");
      if (i > 0) {
        const key = line.slice(0, i).trim();
        const val = line
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {
  // ignore — env may come from process directly (CI)
}

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";
const API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const COMMUNITY_TOKEN = process.env.COMMUNITY_API_TOKEN;

if (!PROJECT_ID) {
  console.error(
    "FATAL: NEXT_PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID) is missing.",
  );
  process.exit(1);
}
if (!TOKEN) {
  console.error(
    "FATAL: SANITY_WRITE_TOKEN is missing. Generate one in Sanity → Manage → API → Tokens (with Editor or higher permission).",
  );
  process.exit(1);
}
if (!COMMUNITY_TOKEN) {
  console.error(
    "FATAL: COMMUNITY_API_TOKEN is missing. This must match the $EXPECTED_TOKEN in cafe24-upload/recent.php.",
  );
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

const RECENT_PHP_BASE = "https://audioguy.co.kr/community/recent.php";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

async function fetchBoard(board) {
  const url = `${RECENT_PHP_BASE}?board=${encodeURIComponent(board)}&limit=5&token=${encodeURIComponent(COMMUNITY_TOKEN)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for board=${board}`);
  }
  const text = await res.text();
  if (text.length < 2 || (!text.startsWith("[") && !text.startsWith("{"))) {
    throw new Error(
      `Non-JSON response for board=${board} (first 100 chars: ${text.slice(0, 100)})`,
    );
  }
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array for board=${board}, got ${typeof data}`);
  }

  return data
    .filter(
      (p) =>
        p &&
        (typeof p.id === "string" || typeof p.id === "number") &&
        typeof p.title === "string" &&
        typeof p.url === "string",
    )
    .map((p) => {
      const item = {
        _key: String(p.id),
        _type: "communityPostItem",
        wrId: String(p.id),
        title: String(p.title),
        url: String(p.url),
      };
      if (typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
        item.date = p.date;
      }
      if (typeof p.author === "string" && p.author.length > 0) {
        item.author = p.author;
      }
      return item;
    });
}

async function main() {
  const startedAt = new Date();
  console.log(`[community-sync] start ${startedAt.toISOString()}`);
  console.log(`  project=${PROJECT_ID} dataset=${DATASET}`);

  const [jobs, column] = await Promise.all([
    fetchBoard("joh"),
    fetchBoard("c_audioguy"),
  ]);

  console.log(
    `  fetched: jobs=${jobs.length}, column=${column.length}`,
  );

  await client.createOrReplace({
    _id: "communityCache",
    _type: "communityCache",
    jobs,
    column,
    updatedAt: startedAt.toISOString(),
  });

  const elapsed = Date.now() - startedAt.getTime();
  console.log(
    `✓ Synced to Sanity in ${elapsed}ms — jobs ${jobs.length}, column ${column.length}`,
  );
}

main().catch((err) => {
  console.error("[community-sync] FAILED", err);
  process.exit(1);
});
