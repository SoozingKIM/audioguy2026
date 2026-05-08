"use client";

import dynamic from "next/dynamic";

import config from "../../../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((m) => m.NextStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center text-sm text-neutral-500">
        Studio 로딩 중…
      </div>
    ),
  },
);

export default function StudioPage() {
  return <NextStudio config={config} />;
}
