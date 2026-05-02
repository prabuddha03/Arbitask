import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/invite/")) {
    return NextResponse.next();
  }

  // API auth route is always public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude OpenAPI + Swagger UI so Edge middleware does not load Prisma (auth adapter); docs must stay public for tooling imports.
    "/((?!_next/static|_next/image|favicon.ico|api/docs).*)",
  ],
};
