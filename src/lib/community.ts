// Community preview data source — pulls recent posts from the existing
// gnuboard community at audioguy.co.kr.
//
// Primary path: hit `audioguy.co.kr/community/recent.php` (our own PHP
// endpoint, see `cafe24-upload/recent.php`). It queries the gnuboard DB
// directly and returns small JSON, with 5-minute server-side file cache so
// repeated calls don't strain Cafe24's per-user MySQL connection limit.
//
// Fallback path: only if recent.php returns 404 (= not uploaded), scrape the
// public board HTML. We DO NOT fall back on 5xx / connection errors — if the
// gnuboard server is in trouble (max_user_connections, full disk, etc.) the
// last thing we want is to pile more work on it with a heavier HTML request.
//
// Result is cached by Next.js for 30 min (`revalidate: 1800`) and fails
// gracefully to an empty array so the home page always renders.

const ORIGIN = "https://audioguy.co.kr";
const BASE = `${ORIGIN}/community`;

export const COMMUNITY_BOARDS = {
  jobs: { slug: "joh", label: "구인구직" },
  column: { slug: "c_audioguy", label: "오디오가이 칼럼" },
} as const;

export type CommunityBoardKey = keyof typeof COMMUNITY_BOARDS;
export const COMMUNITY_BOARD_KEYS = Object.keys(
  COMMUNITY_BOARDS,
) as CommunityBoardKey[];

export const COMMUNITY_HOME_URL = `${BASE}/`;

export function communityBoardUrl(boardKey: CommunityBoardKey): string {
  return `${BASE}/bbs/board.php?bo_table=${COMMUNITY_BOARDS[boardKey].slug}`;
}

export type CommunityPost = {
  /** wr_id from gnuboard. */
  id: string;
  /** Plain-text title (HTML stripped, entities decoded). */
  title: string;
  /** Absolute URL to the post on the gnuboard site. */
  url: string;
  /** YYYY-MM-DD, or null if no date could be parsed near the title. */
  date: string | null;
  /** wr_name (or mb_id fallback) from gnuboard. Available via JSON endpoint
   *  only; the HTML scraper leaves this null. For 구인구직 this is usually
   *  the hiring company's display name. */
  author: string | null;
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function cleanTitle(t: string): string {
  // gnuboard themes often paste a "댓글+ N개" comment counter inline at the
  // end of the title anchor's text. Trim it so the preview stays clean.
  return t.replace(/\s*댓글\+?\s*\d+\s*개\s*$/u, "").trim();
}

function absolutize(href: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${ORIGIN}${href}`;
  return `${BASE}/${href}`;
}

/**
 * Parse a gnuboard board-listing HTML page into post records.
 *
 * The listing renders each post twice (image link + title link). We collect
 * every wr_id anchor, keep the LAST occurrence per id (= the title link), then
 * for each post the date is searched in the HTML between the title anchor's
 * end and the next post's first anchor — that bounded window stops the regex
 * from running into the next row's date (which was happening before).
 *
 * Notice / pinned posts (titles starting with `[공지]`) are dropped so the
 * preview only surfaces actual recent activity.
 */
function parseListing(
  html: string,
  slug: string,
  limit: number,
): CommunityPost[] {
  type RawAnchor = {
    start: number;
    end: number;
    id: string;
    href: string;
    title: string;
  };

  const anchorRe = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const allMatches: RawAnchor[] = [];
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const href = decodeHtmlEntities(m[1]);
    if (!href.includes(`bo_table=${slug}`)) continue;
    const widMatch = href.match(/wr_id=(\d+)/);
    if (!widMatch) continue;
    const title = cleanTitle(decodeHtmlEntities(stripHtmlTags(m[2])));
    if (!title || title.length < 2 || title.length > 300) continue;
    allMatches.push({
      start: m.index,
      end: m.index + m[0].length,
      id: widMatch[1],
      href,
      title,
    });
  }

  // Each wr_id has multiple anchors (image + title + maybe metadata/excerpt).
  // The actual title is consistently the SHORTEST non-empty inner text: row
  // metadata uses long "정규직 | 경력 ... | 지역" strings, and "오디오가이 칼럼"
  // pre-renders body excerpts as the first link. Pick shortest, then filter
  // notice / pinned posts by their `[공지]` prefix.
  const candidates = new Map<string, RawAnchor[]>();
  for (const a of allMatches) {
    let list = candidates.get(a.id);
    if (!list) {
      list = [];
      candidates.set(a.id, list);
    }
    list.push(a);
  }

  const picked: RawAnchor[] = [];
  for (const list of candidates.values()) {
    // Metadata-row anchors are reliably identifiable by their pipe separators
    // ("정규직 | 경력무관 | …"). Exclude them first, then pick the shortest
    // remaining title (real titles are shorter than body-excerpt anchors).
    const nonMeta = list.filter((a) => !a.title.includes(" | "));
    const pool = nonMeta.length > 0 ? nonMeta : list;
    pool.sort((a, b) => a.title.length - b.title.length);
    const best = pool[0];
    if (best.title.startsWith("[공지]") || best.title.startsWith("공지")) continue;
    picked.push(best);
  }

  const ordered = picked.sort((a, b) => a.start - b.start);
  const posts: CommunityPost[] = [];
  for (let i = 0; i < ordered.length && posts.length < limit; i++) {
    const cur = ordered[i];
    // Stop the date window at the next post's first anchor so we don't capture
    // the next row's date (or any date deeper in the page).
    const nextStart =
      i + 1 < ordered.length ? ordered[i + 1].start : Math.min(cur.end + 2000, html.length);
    const slice = html.slice(cur.end, nextStart);
    // Only accept a full YYYY-MM-DD form. Low-traffic boards (c_audioguy) print
    // MM-DD only, but inferring the year is misleading for years-old posts —
    // we leave date null and the UI just omits it.
    let date: string | null = null;
    const ymd = slice.match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymd) {
      date = `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
    }
    posts.push({ id: cur.id, title: cur.title, url: absolutize(cur.href), date, author: null });
  }

  return posts;
}

// Preferred data source — a tiny JSON endpoint that we host on the gnuboard
// server itself (Cafe24). Same-server DB query, no HTML scraping.
//
// In production we don't hit it directly because Cafe24's WAF blocks Vercel's
// AWS IPs and serves a tiny HTML "this site is restricted" page instead. So
// when COMMUNITY_PROXY_URL is set (typically pointing at a Cloudflare Worker
// that re-fetches recent.php from a CF edge IP), we go through that proxy.
//
// In local dev the env var is usually unset → we just hit the gnuboard server
// directly, which works fine from a Korean IP.
const JSON_API_URL = (
  process.env.COMMUNITY_PROXY_URL || `${BASE}/recent.php`
).replace(/\/$/, "");

type JsonApiPost = {
  id?: string | number;
  title?: string;
  url?: string;
  date?: string | null;
  author?: string | null;
};

/**
 * Three-state result so the caller can distinguish:
 *   - "ok"        — JSON endpoint returned valid data (use it)
 *   - "missing"   — recent.php returned 404 (= not uploaded yet; OK to fall back)
 *   - "broken"    — recent.php is up but unhealthy (5xx, timeout, garbage, etc.)
 *                   In this case we should NOT fall back to HTML scraping —
 *                   piling another request onto an already-struggling Cafe24
 *                   server (max_user_connections, full disk, etc.) makes it
 *                   worse, not better. Caller returns an empty list.
 */
type JsonResult =
  | { kind: "ok"; posts: CommunityPost[] }
  | { kind: "missing" }
  | { kind: "broken" };

async function tryJsonEndpoint(
  slug: string,
  limit: number,
): Promise<JsonResult> {
  const url = `${JSON_API_URL}?board=${encodeURIComponent(slug)}&limit=${limit}`;
  try {
    const res = await fetch(url, {
      headers: {
        // Real browser headers — Cafe24's WAF can silently 403 / serve empty
        // responses to bare Node fetch UAs even on JSON endpoints.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "application/json,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      next: { revalidate: 1800 },
    });
    if (res.status === 404) {
      console.warn(
        `[community] ${slug}: recent.php returned 404 — PHP file not uploaded yet?`,
      );
      return { kind: "missing" };
    }
    if (!res.ok) {
      console.error(
        `[community] ${slug}: JSON endpoint HTTP ${res.status} ${res.statusText}`,
      );
      return { kind: "broken" };
    }
    const text = await res.text();
    if (!text || text.length < 2) {
      console.error(
        `[community] ${slug}: JSON endpoint returned empty body (${text.length} bytes)`,
      );
      return { kind: "broken" };
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error(
        `[community] ${slug}: JSON parse failed — first 200 chars: ${text.slice(0, 200)}`,
        parseErr instanceof Error ? parseErr.message : String(parseErr),
      );
      return { kind: "broken" };
    }
    if (!Array.isArray(data)) {
      console.error(
        `[community] ${slug}: JSON response not an array — got ${typeof data}: ${JSON.stringify(data).slice(0, 200)}`,
      );
      return { kind: "broken" };
    }
    const dataArr = data as JsonApiPost[];
    const posts = dataArr
      .filter((p): p is JsonApiPost & { id: string | number; title: string; url: string } =>
        p != null && (typeof p.id === "string" || typeof p.id === "number") &&
        typeof p.title === "string" && typeof p.url === "string",
      )
      .map((p) => ({
        id: String(p.id),
        title: p.title,
        url: p.url,
        date: typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date)
          ? p.date
          : null,
        author: typeof p.author === "string" && p.author.length > 0
          ? p.author
          : null,
      }));
    return { kind: "ok", posts };
  } catch (err) {
    console.error(
      `[community] ${slug}: JSON endpoint fetch threw`,
      err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    );
    return { kind: "broken" };
  }
}

export async function getCommunityBoardPosts(
  boardKey: CommunityBoardKey,
  limit = 5,
): Promise<CommunityPost[]> {
  const url = communityBoardUrl(boardKey);
  const slug = COMMUNITY_BOARDS[boardKey].slug;

  // Primary path: the JSON endpoint hosted on the gnuboard server.
  const jsonResult = await tryJsonEndpoint(slug, limit);
  if (jsonResult.kind === "ok") return jsonResult.posts;
  // If the endpoint is reachable but broken (5xx / garbage / timed-out),
  // bail out with an empty list — don't fall back to HTML scraping, which
  // would only add load on an already-struggling Cafe24 server. The home
  // page will show "최근 게시물을 불러올 수 없습니다." until the next ISR
  // revalidation tries again.
  if (jsonResult.kind === "broken") return [];

  // Fallback only when recent.php is genuinely missing (404). Scrape the
  // public board HTML listing as a last resort.
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        // Use a real browser UA. Many Korean shared-hosting setups silently
        // 403 or hang anything that looks bot-y (our previous "AudioguyBot"
        // string was getting filtered in production). Accept-Language is
        // included so gnuboard returns Korean content reliably.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      next: { revalidate: 1800 }, // 30 minutes — jobs board updates a few/week
    });
    if (!res.ok) {
      console.error(
        `[community] ${slug}: HTTP ${res.status} ${res.statusText} (URL ${url})`,
      );
      return [];
    }
    html = await res.text();
    if (!html || html.length < 1000) {
      console.error(
        `[community] ${slug}: response body too small (${html?.length ?? 0} bytes) — likely blocked or empty`,
      );
      return [];
    }
  } catch (err) {
    console.error(
      `[community] ${slug}: fetch threw`,
      err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    );
    return [];
  }

  const posts = parseListing(html, slug, limit);
  if (posts.length === 0) {
    console.error(
      `[community] ${slug}: parser returned 0 posts from ${html.length}-byte HTML — selectors may need updating`,
    );
  }
  return posts;
}
