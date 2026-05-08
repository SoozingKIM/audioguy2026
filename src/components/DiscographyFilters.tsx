"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { BRANDS } from "@/lib/brands";
import type { WorkScopeRef } from "@/sanity/types";

export function DiscographyFilters({
  activeBrand,
  activeScope,
  scopeOptions,
}: {
  activeBrand?: string;
  activeScope?: string;
  scopeOptions: WorkScopeRef[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function pushParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div
      className={`space-y-4 ${isPending ? "opacity-60 transition" : "transition"}`}
    >
      <div>
        <div className="text-xs uppercase tracking-widest text-foreground/50">
          Brand
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterChip
            active={!activeBrand}
            onClick={() => pushParams({ brand: undefined, scope: undefined })}
            label="전체"
          />
          {BRANDS.map((b) => (
            <FilterChip
              key={b.value}
              active={activeBrand === b.value}
              onClick={() =>
                pushParams({ brand: b.value, scope: undefined })
              }
              label={b.label}
              dotClass={b.color}
            />
          ))}
        </div>
      </div>

      {activeBrand && scopeOptions.length > 0 ? (
        <div>
          <div className="text-xs uppercase tracking-widest text-foreground/50">
            Work Scope
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip
              active={!activeScope}
              onClick={() => pushParams({ scope: undefined })}
              label="전체"
            />
            {scopeOptions.map((s) => (
              <FilterChip
                key={s._id}
                active={activeScope === s.slug}
                onClick={() => pushParams({ scope: s.slug })}
                label={s.title}
              />
            ))}
          </div>
        </div>
      ) : null}

      {(activeBrand || activeScope) ? (
        <div>
          <Link
            href={pathname}
            className="text-xs text-foreground/50 underline-offset-4 hover:underline"
          >
            필터 초기화
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-black/15 hover:border-foreground dark:border-white/15"
      }`}
    >
      {dotClass ? (
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
      ) : null}
      {label}
    </button>
  );
}
