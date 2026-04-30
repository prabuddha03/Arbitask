import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/invite/")) {
    return NextResponse.next();
  }

  // API auth route is always public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude OpenAPI + Swagger UI so Edge middleware does not load Prisma (auth adapter); docs must stay public for tooling imports.
    "/((?!_next/static|_next/image|favicon.ico|api/docs).*)",
  ],
};
