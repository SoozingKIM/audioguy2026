"use client";

import { useState } from "react";

import { CONTACT_BRANDS, type ContactBrand } from "@/lib/contactEmails";

const BRAND_LABELS: Record<ContactBrand, string> = {
  audioguy: "AUDIOGUY",
  sound360: "SOUND360",
  seoro: "SEORO",
};

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-px size-[12px] shrink-0 text-foreground/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Form copy, resolved on the server (Sanity-managed, i18n fallback). */
export type ContactLabels = {
  brand: string;
  company: string;
  companyPh: string;
  name: string;
  namePh: string;
  position: string;
  positionPh: string;
  phone: string;
  phonePh: string;
  email: string;
  emailPh: string;
  memo: string;
  memoPh: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  /** Short description shown under the tabs for the selected service. */
  serviceDesc: Record<ContactBrand, string>;
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function ContactForm({ labels: t }: { labels: ContactLabels }) {
  const [brand, setBrand] = useState<ContactBrand>("audioguy");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      brand,
      company: String(fd.get("company") ?? ""),
      name: String(fd.get("name") ?? ""),
      position: String(fd.get("position") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      memo: String(fd.get("memo") ?? ""),
    };

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t.error);
      }
      setStatus({ kind: "success" });
      form.reset();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t.error,
      });
    }
  }

  const submitting = status.kind === "submitting";

  return (
    <form className="mt-5 flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-secondary">{t.brand}</div>
        <div className="grid grid-cols-3 gap-3 rounded-[10px] bg-[#f7f9fa] p-1.5">
          {CONTACT_BRANDS.map((value) => {
            const active = brand === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setBrand(value)}
                className={
                  active
                    ? "rounded-sm bg-background-white py-2.5 text-[15px] font-medium text-foreground shadow-[4px_2px_4px_rgba(0,0,0,0.05)]"
                    : "rounded-[10px] py-2.5 text-[15px] font-medium text-disabled transition hover:text-secondary"
                }
              >
                {BRAND_LABELS[value]}
              </button>
            );
          })}
        </div>
        {/* 선택된 서비스 설명 — 툴팁 대신 항상 보이는 헬퍼 카드(모바일 터치 대응).
            정보 아이콘 + 라이트 박스로 '설명글' 느낌을 살린다. */}
        <div className="mt-2 flex items-start gap-1.5 rounded-[9px] bg-[#e6eaee] px-3 py-1.5">
          <InfoIcon />
          <p
            key={brand}
            className="animate-[fadeIn_0.3s_ease-out] text-[10.5px] leading-snug tracking-[-0.11px] text-secondary"
          >
            <span className="font-semibold text-foreground">
              {BRAND_LABELS[brand]}
            </span>
            <span className="mx-1.5 text-foreground/30">—</span>
            {t.serviceDesc[brand]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <Field label={t.company} name="company" placeholder={t.companyPh} />
        <Field label={t.name} name="name" required placeholder={t.namePh} />
        <div className="hidden sm:block" />
        <Field
          label={t.position}
          name="position"
          placeholder={t.positionPh}
        />
        <Field
          label={t.phone}
          name="phone"
          required
          placeholder={t.phonePh}
        />
        <Field
          label={t.email}
          name="email"
          type="email"
          required
          placeholder={t.emailPh}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="memo" className="text-sm text-secondary">
          {t.memo}
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={4}
          placeholder={t.memoPh}
          className="w-full resize-none rounded-sm bg-[#f7f9fa] px-3.5 py-2.5 text-sm text-foreground placeholder:text-disabled focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />
      </div>

      {status.kind === "success" ? (
        <p className="rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
          {t.success}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p className="rounded-sm border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700">
          {t.error}: {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-foreground py-2.5 text-[15px] font-medium text-background shadow-[4px_2px_4px_rgba(0,0,0,0.05)] transition hover:bg-foreground/90 disabled:opacity-60"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-secondary">
        {label}
        {required ? (
          <span className="ml-0.5 text-[#f23838]">*</span>
        ) : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-sm bg-[#f7f9fa] px-3.5 py-2.5 text-sm text-foreground placeholder:text-disabled focus:outline-none focus:ring-1 focus:ring-foreground/20"
      />
    </div>
  );
}
