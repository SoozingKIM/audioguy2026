import type { QueryParams } from "next-sanity";

import { client } from "./client";

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  fresh = false,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  /**
   * `true`이면 모든 캐시 우회 — Sanity CDN(useCdn=false)도, Next.js fetch
   * 캐시(cache='no-store')도 끄고 매 요청마다 origin에서 fresh. 데이터가
   * 분 단위로 자주 바뀌고 새로고침 즉시 반영되어야 하는 경우(예: 커뮤니티
   * 최신 글). 기본값은 `false` — 그땐 useCdn=true + 60초 ISR.
   */
  fresh?: boolean;
}): Promise<T> {
  if (fresh) {
    return client.fetch<T>(query, params, {
      useCdn: false,
      cache: "no-store",
      next: { tags },
    });
  }
  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === "development" ? 0 : 60,
      tags,
    },
  });
}
