/**
 * Cloudflare Worker — audioguy.co.kr 커뮤니티 데이터 프록시
 *
 * 왜 필요한가:
 *   Vercel(미국 AWS)이 직접 audioguy.co.kr/community/recent.php 호출 시
 *   Cafe24 WAF가 외국 IP라 차단(HTML 안내 페이지 반환). 결과: 메인 사이트에
 *   "최근 게시물 불러올 수 없습니다." 표시.
 *
 *   Cloudflare Worker는 전 세계 CF 엣지(서울 POP 포함)에서 실행. CF의 IP 대역은
 *   너무 거대해서 Cafe24도 막을 수 없어, 이 Worker가 중간에서 recent.php를
 *   fetch한 뒤 Vercel에 전달.
 *
 * 동작:
 *   Vercel  →  https://audioguy-community.<your>.workers.dev?board=joh
 *             ↓ Worker가 받음
 *   Worker  →  https://audioguy.co.kr/community/recent.php?board=joh
 *             ↑ Cafe24는 CF IP라 안 막음
 *   Worker  →  결과를 그대로 Vercel에 반환 (5분 엣지 캐시)
 *
 * 무료 한도:
 *   일 100,000 요청 무료. 우리 사용량(일 100회 미만)은 0.1%도 안 씀.
 *
 * 배포:
 *   1. https://workers.cloudflare.com → Sign Up (무료, 신용카드 불요)
 *   2. Workers & Pages → Create → Create Worker
 *   3. 이름 입력 (예: audioguy-community)
 *   4. "Edit code" → 이 파일 내용 전체 복붙 → Save and Deploy
 *   5. 발급된 URL 복사 (예: audioguy-community.kimsj0012.workers.dev)
 *   6. Vercel 환경변수에 COMMUNITY_PROXY_URL 등록
 */

const ALLOWED_BOARDS = ["joh", "c_audioguy"];
const UPSTREAM_BASE = "https://audioguy.co.kr/community/recent.php";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const board = url.searchParams.get("board") || "";
    const limit = Math.max(
      1,
      Math.min(20, parseInt(url.searchParams.get("limit") || "5", 10)),
    );

    if (!ALLOWED_BOARDS.includes(board)) {
      return jsonResponse({ error: "invalid board" }, 400);
    }

    const target = `${UPSTREAM_BASE}?board=${encodeURIComponent(board)}&limit=${limit}`;

    try {
      const upstream = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Accept: "application/json,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        },
        // CF 엣지에서 5분간 캐시 — 같은 board+limit 요청은 추가 origin 호출 없음
        cf: { cacheTtl: 300, cacheEverything: true },
      });

      const body = await upstream.text();
      const contentType = upstream.headers.get("content-type") || "";
      const isJsonLike =
        contentType.includes("json") ||
        (body.startsWith("[") || body.startsWith("{"));

      // 카페24가 HTML 안내 페이지를 보낸 케이스 — 우리 쪽에서 거른다
      if (!isJsonLike || body.length < 2) {
        return jsonResponse(
          {
            error: "upstream returned non-JSON",
            upstream_status: upstream.status,
            upstream_content_type: contentType,
            upstream_body_preview: body.slice(0, 200),
          },
          502,
        );
      }

      return new Response(body, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err) {
      return jsonResponse(
        { error: "proxy fetch failed", message: String(err && err.message) },
        502,
      );
    }
  },
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
