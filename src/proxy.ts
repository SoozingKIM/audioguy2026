// Next.js 16 renamed the `middleware` file convention to `proxy`. This is the
// next-intl request handler (locale routing) — same behaviour as the old
// src/middleware.ts, just under the supported filename.
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|studio|_next|_vercel|.*\\..*).*)",
};
