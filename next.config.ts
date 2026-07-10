import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // dev에서 LAN IP(예: 휴대폰/다른 기기)로 접속해도 HMR·클라이언트 리소스가
  // 차단되지 않도록 허용. 차단되면 버튼 등 클라이언트 인터랙션이 동작하지 않음.
  allowedDevOrigins: ["10.10.100.88"],
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
};

export default withNextIntl(nextConfig);
