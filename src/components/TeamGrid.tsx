"use client";

import { useState } from "react";

import { SlotImage } from "@/components/SlotImage";
import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export type TeamMember = {
  name: string;
  role: string;
  slotKey: string;
  /** Local /public fallback used when no Sanity image is set. */
  fallbackSrc?: string;
  /** Career / credits, revealed on click. */
  bio: string[];
};

export function TeamGrid({
  members,
  slots,
  bioFallback,
}: {
  members: TeamMember[];
  slots: ImageSlot[];
  bioFallback: string;
}) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {members.map((m) => (
        <TeamCard
          key={m.name}
          member={m}
          slots={slots}
          bioFallback={bioFallback}
        />
      ))}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-16 text-foreground/15"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6z" />
    </svg>
  );
}

function TeamCard({
  member,
  slots,
  bioFallback,
}: {
  member: TeamMember;
  slots: ImageSlot[];
  bioFallback: string;
}) {
  const [open, setOpen] = useState(false);
  const photoUrl =
    imageUrl(findSlot(slots, member.slotKey)?.image) ??
    member.fallbackSrc ??
    null;
  const bio = member.bio.length > 0 ? member.bio : null;
  const toggle = () => setOpen((o) => !o);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={open}
        aria-label={`${member.name} ${open ? "사진" : "이력"} 보기`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="relative block aspect-[42/25] w-full cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
      >
        {/* Front — photo (default) */}
        <div
          className={`absolute inset-0 bg-[#edeff2] transition-opacity duration-300 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          {photoUrl ? (
            <div className="absolute inset-y-0 left-1/2 w-[65%] -translate-x-1/2">
              <SlotImage
                slots={slots}
                slotKey={member.slotKey}
                fallbackSrc={member.fallbackSrc}
                alt={member.name}
                fill
                sizes="(min-width: 768px) 22vw, 65vw"
                className="object-cover object-top"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PersonIcon />
            </div>
          )}
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            이력 보기
          </span>
        </div>

        {/* Back — career / credits (on click) */}
        <div
          className={`absolute inset-0 flex flex-col justify-end bg-foreground p-8 text-white transition-opacity duration-300 md:p-10 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {bio ? (
            <ul className="list-disc space-y-2 pl-5 text-[15px] font-medium leading-normal tracking-[-0.18px] md:text-[18px]">
              {bio.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[15px] font-medium tracking-[-0.18px] text-white/45 md:text-[18px]">
              {bioFallback}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-lg font-medium tracking-[-0.22px] text-foreground md:text-[22px]">
          {member.name}
        </p>
        <p className="text-[13px] tracking-[-0.13px] text-secondary">
          {member.role}
        </p>
      </div>
    </div>
  );
}
