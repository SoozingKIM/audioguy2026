import { defineField, defineType } from "sanity";

/**
 * Singleton document that holds the latest community posts pulled from the
 * gnuboard site at audioguy.co.kr. The document is rewritten end-to-end by
 * `scripts/sync-community.mjs` (run on a GitHub Actions cron every 30 min).
 * The home-page reads it on every render — no direct cross-IP traffic from
 * Vercel to Cafe24, so the whole IP-blocking / WAF-intervention problem is
 * sidestepped.
 *
 * Editors normally don't touch this in Studio; it's only here so the data is
 * inspectable and recoverable through Sanity's history view.
 */

const postItem = {
  type: "object" as const,
  name: "communityPostItem",
  title: "글",
  fields: [
    { name: "wrId", title: "글 번호 (wr_id)", type: "string" as const },
    { name: "title", title: "제목", type: "string" as const },
    { name: "url", title: "원문 URL", type: "url" as const },
    { name: "date", title: "작성일 (YYYY-MM-DD)", type: "string" as const },
    { name: "author", title: "작성자/회사명", type: "string" as const },
  ],
  preview: {
    select: { title: "title", author: "author", date: "date" },
    prepare(selection: Record<string, unknown>) {
      const title = (selection.title as string) || "(제목 없음)";
      const date = selection.date as string | undefined;
      const author = selection.author as string | undefined;
      const subtitleParts = [date, author].filter(Boolean) as string[];
      return {
        title,
        subtitle: subtitleParts.join(" · ") || "—",
      };
    },
  },
};

export const communityCacheType = defineType({
  name: "communityCache",
  title: "Community 미리보기 캐시 (자동 동기화)",
  type: "document",
  fields: [
    defineField({
      name: "jobs",
      title: "구인구직 (joh) 최근 5건",
      type: "array",
      of: [postItem],
      description:
        "audioguy.co.kr/community 구인구직 게시판의 최근 5건. 30분마다 자동 동기화됩니다 — 손으로 편집하지 마세요.",
    }),
    defineField({
      name: "column",
      title: "오디오가이 칼럼 (c_audioguy) 최근 5건",
      type: "array",
      of: [postItem],
      description: "오디오가이 칼럼 게시판의 최근 5건. 자동 동기화.",
    }),
    defineField({
      name: "updatedAt",
      title: "마지막 동기화 시각",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { jobs: "jobs", column: "column", updatedAt: "updatedAt" },
    prepare({ jobs, column, updatedAt }) {
      const j = Array.isArray(jobs) ? jobs.length : 0;
      const c = Array.isArray(column) ? column.length : 0;
      const when =
        typeof updatedAt === "string"
          ? updatedAt.slice(0, 16).replace("T", " ")
          : "—";
      return {
        title: "Community 미리보기 캐시",
        subtitle: `구인구직 ${j} · 칼럼 ${c} · ${when}`,
      };
    },
  },
});
