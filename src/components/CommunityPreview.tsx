// Home-page community preview. Server component — fetches the two boards' most
// recent posts at request time (cached 30 min by the lib) and renders them in
// two columns. Falls back to a quiet "최근 게시물을 불러올 수 없습니다." if the
// gnuboard listing can't be reached, so the page never breaks because of it.
import {
  COMMUNITY_BOARD_KEYS,
  COMMUNITY_BOARDS,
  COMMUNITY_HOME_URL,
  communityBoardUrl,
  getCommunityBoardPosts,
} from "@/lib/community";

export async function CommunityPreview() {
  const data = await Promise.all(
    COMMUNITY_BOARD_KEYS.map(async (key) => ({
      key,
      label: COMMUNITY_BOARDS[key].label,
      href: communityBoardUrl(key),
      posts: await getCommunityBoardPosts(key, 5),
    })),
  );

  return (
    <section
      data-reveal
      className="mx-auto max-w-[1440px] px-10 py-20 lg:py-24"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/45">
            COMMUNITY
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.32px] text-foreground md:text-[32px]">
            오디오가이 커뮤니티 최신 글
          </h2>
        </div>
        <a
          href={COMMUNITY_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-[14px] font-medium tracking-[-0.18px] text-tertiary underline-offset-4 transition-colors hover:text-foreground hover:underline md:inline-block"
        >
          커뮤니티 전체 보기 →
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {data.map((board) => (
          <div key={board.key}>
            <div className="flex items-baseline justify-between border-b border-foreground/10 pb-3">
              <h3 className="text-[17px] font-semibold text-foreground md:text-[20px]">
                {board.label}
              </h3>
              <a
                href={board.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-tertiary underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                전체 보기 →
              </a>
            </div>

            <ul className="mt-3 divide-y divide-foreground/5">
              {board.posts.length === 0 ? (
                <li className="py-4 text-[14px] text-tertiary">
                  최근 게시물을 불러올 수 없습니다.
                </li>
              ) : (
                board.posts.map((post) => (
                  <li key={post.id}>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline justify-between gap-4 py-3"
                    >
                      <span className="line-clamp-1 flex-1 text-[15px] tracking-[-0.18px] text-foreground transition-colors group-hover:text-[#0E58F8] md:text-[16px]">
                        {post.title}
                      </span>
                      {post.date && (
                        <span className="shrink-0 text-[12px] tabular-nums text-tertiary md:text-[13px]">
                          {post.date.replace(/-/g, ".")}
                        </span>
                      )}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center md:hidden">
        <a
          href={COMMUNITY_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] font-medium tracking-[-0.18px] text-tertiary underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          커뮤니티 전체 보기 →
        </a>
      </div>
    </section>
  );
}
