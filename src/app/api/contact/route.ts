import { NextResponse } from "next/server";

import {
  CONTACT_BRAND_LABELS,
  getRecipientFor,
  isContactBrand,
} from "@/lib/contactEmails";

type Payload = {
  brand?: string;
  company?: string;
  name?: string;
  position?: string;
  phone?: string;
  email?: string;
  memo?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { brand, company, name, position, phone, email, memo } = body;

  if (!isContactBrand(brand)) {
    return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
  }
  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "Missing required fields (의뢰인명/연락처/이메일)" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server not configured (RESEND_API_KEY missing)" },
      { status: 500 },
    );
  }

  const recipient = getRecipientFor(brand);
  const from = process.env.CONTACT_EMAIL_FROM ?? "Audioguy <onboarding@resend.dev>";
  const brandLabel = CONTACT_BRAND_LABELS[brand];
  const subject = `[${brandLabel} 문의] ${name}${company ? ` · ${company}` : ""}`;

  const rows: Array<[string, string | undefined]> = [
    ["문의 브랜드", brandLabel],
    ["회사/기업명", company],
    ["의뢰인명", name],
    ["부서/직책", position],
    ["연락처", phone],
    ["이메일", email],
    ["메모", memo],
  ];

  const text = rows
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const html = `
<div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 600px; padding: 24px;">
  <h2 style="margin: 0 0 8px; font-size: 18px;">[${brandLabel}] 새 문의가 도착했습니다</h2>
  <p style="margin: 0 0 16px; color: #666; font-size: 13px;">아래 내용으로 회신해 주세요.</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    ${rows
      .filter(([, v]) => v && v.trim().length > 0)
      .map(
        ([k, v]) => `
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; width: 120px; vertical-align: top; border: 1px solid #eee;"><strong>${k}</strong></td>
          <td style="padding: 8px 12px; border: 1px solid #eee; white-space: pre-wrap;">${escapeHtml(v ?? "")}</td>
        </tr>`,
      )
      .join("")}
  </table>
</div>`.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: email,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Failed to send email", detail },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
