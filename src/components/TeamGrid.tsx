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
  columns = 2,
  portrait = false,
  wideBox = false,
  gapClass = "gap-4 md:gap-5",
}: {
  members: TeamMember[];
  slots: ImageSlot[];
  bioFallback: string;
  /** Number of columns on md+ (default 2). Mobile is always a single column. */
  columns?: 2 | 3 | 4;
  /** Portrait cards (41:50, full-bleed photo) like the About page (default landscape 42:25). */
  portrait?: boolean;
  /** 정사각 박스 + 세로(41:50) 사진을 가운데 두고 양옆은 카드 배경으로 채운다(portrait와 함께 사용). */
  wideBox?: boolean;
  /** 카드 사이 gap. 멤버 수가 열보다 적어(가운데 정렬) 여유 있을 때 넓혀 쓴다.
   *  주의: 열을 꽉 채우는 경우엔 카드 폭 계산(md:gap-5=20px 기준)과 어긋날 수 있으니 기본값 유지. */
  gapClass?: string;
}) {
  // flex-wrap + justify-center 로 부족한 행은 가운데 정렬. 카드 폭은 열 수에
  // 맞춰 고정(md:gap-5=20px 기준)이라, 멤버 수가 열보다 적어도 카드 크기는 동일.
  // Static class map so Tailwind keeps the variants (no dynamic concatenation).
  const basisClass =
    columns === 4
      ? "md:basis-[calc((100%-60px)/4)]"
      : columns === 3
        ? "md:basis-[calc((100%-40px)/3)]"
        : "md:basis-[calc((100%-20px)/2)]";
  return (
    <div className={`mt-8 flex flex-wrap justify-center ${gapClass}`}>
      {members.map((m) => (
        <div key={m.name} className={`basis-full shrink-0 ${basisClass}`}>
          <TeamCard
            member={m}
            slots={slots}
            bioFallback={bioFallback}
            portrait={portrait}
            wideBox={wideBox}
          />
        </div>
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
  portrait = false,
  wideBox = false,
}: {
  member: TeamMember;
  slots: ImageSlot[];
  bioFallback: string;
  portrait?: boolean;
  wideBox?: boolean;
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
        className={`group relative block w-full cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
          wideBox ? "aspect-[1/1]" : portrait ? "aspect-[41/50]" : "aspect-[42/25]"
        }`}
      >
        {/* Front — photo (default) */}
        <div
          className={`absolute inset-0 bg-[#edeff2] transition-opacity duration-300 ${
            open ? "opacity-0" : "opacity-100 group-hover:opacity-0"
          }`}
        >
          {photoUrl ? (
            <>
              {/* wideBox: 같은 사진을 흐리게 확대해 배경으로 깔아 사진 뒷배경을
                  양옆으로 자연스럽게 확장 (사진이 넓어진 것처럼 보이게) */}
              {wideBox ? (
                <div aria-hidden className="absolute inset-0 scale-110">
                  <SlotImage
                    slots={slots}
                    slotKey={member.slotKey}
                    fallbackSrc={member.fallbackSrc}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 22vw, 65vw"
                    className="object-cover object-top blur-2xl"
                  />
                </div>
              ) : null}
              <div
                className={
                  wideBox
                    ? "absolute inset-y-0 left-1/2 aspect-[41/50] -translate-x-1/2"
                    : portrait
                      ? "absolute inset-0"
                      : "absolute inset-y-0 left-1/2 w-[65%] -translate-x-1/2"
                }
              >
                <SlotImage
                  slots={slots}
                  slotKey={member.slotKey}
                  fallbackSrc={member.fallbackSrc}
                  alt={member.name}
                  fill
                  sizes="(min-width: 768px) 22vw, 65vw"
                  className="object-cover object-top grayscale"
                />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PersonIcon />
            </div>
          )}
        </div>

        {/* Back — career / credits (on click) */}
        <div
          className={`absolute inset-0 flex flex-col justify-end bg-foreground p-6 text-white transition-opacity duration-300 md:p-7 ${
            open ? "opacity-100" : "pointer-events-none opacity-0 group-hover:opacity-100"
          }`}
        >
          {bio ? (
            <ul className="list-disc space-y-1 pl-4 text-[11px] font-medium leading-snug tracking-[-0.1px] md:text-[12px]">
              {bio.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[11px] font-medium tracking-[-0.1px] text-white/45 md:text-[12px]">
              {bioFallback}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
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
