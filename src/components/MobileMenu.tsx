"use client";

import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

/**
 * Mobile hamburger button + fullscreen nav overlay. Lives only on `md:hidden`.
 * The Header (server component) builds the translated `items` and passes them
 * in — keeping the menu interactive (state, ESC, scroll lock) without losing
 * the server-only nav labels.
 */
export function MobileMenu({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-5 w-6 flex-col justify-between md:hidden"
      >
        <span
          className={`h-px w-full bg-foreground transition-transform duration-300 ${
            open ? "translate-y-[9px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-px w-full bg-foreground transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`h-px w-full bg-foreground transition-transform duration-300 ${
            open ? "-translate-y-[9px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 bg-background md:hidden"
        >
          <nav className="flex h-full flex-col items-center justify-center gap-8 text-2xl font-medium">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="uppercase text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
