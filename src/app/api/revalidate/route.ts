import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity webhook → 해당 문서 타입에 걸린 fetch 캐시를 무효화.
//
// 설정 (Sanity Manage → API → Webhooks):
//   - URL:    https://<vercel-domain>/api/revalidate
//   - Trigger:    Create / Update / Delete
//   - Filter:     _type == "communityCache"
//   - Projection: {_type, _id}
//   - Secret:     env SANITY_REVALIDATE_SECRET 와 동일한 값
//
// 한 번 설정해두면 communityCache가 바뀔 때마다 자동으로 호출되어 ISR 캐시를
// 즉시 비움. 추가로 다른 타입(예: pageContent)이 webhook으로 들어와도
// 그 타입을 tag로 쓴 fetch는 동일하게 무효화됨.

type Body = { _type?: string; _id?: string };

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<Body>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { ok: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { ok: false, message: "Missing _type in body" },
        { status: 400 },
      );
    }

    revalidateTag(body._type);

    return NextResponse.json({
      ok: true,
      revalidated: body._type,
      id: body._id,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
