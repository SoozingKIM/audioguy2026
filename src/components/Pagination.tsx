import Link from "next/link";

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const pages: number[] = [];
  const window = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) {
      pages.push(p);
    }
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1">
      <PaginationLink
        href={hrefFor(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ←
      </PaginationLink>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis ? (
              <span className="px-2 text-foreground/40">…</span>
            ) : null}
            <PaginationLink href={hrefFor(p)} active={p === page}>
              {p}
            </PaginationLink>
          </span>
        );
      })}
      <PaginationLink
        href={hrefFor(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        →
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const className = `inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition ${
    active
      ? "bg-foreground text-background"
      : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
  }`;
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${className} pointer-events-none opacity-30`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
