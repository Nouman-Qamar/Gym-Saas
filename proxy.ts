// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime, same API).
// This does coarse-grained route protection using only the signed session
// cookie (no DB call — proxy runs before rendering and should stay fast).
// Finer checks (onboarding complete, gym membership, etc.) happen in
// `requireUser()` inside each server component, which does have DB access.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "ironline_session";
const PLATFORM_SESSION_COOKIE = "ironline_platform_session";

function secretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

async function readRole(request: NextRequest): Promise<"ADMIN" | "TRAINER" | "MEMBER" | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (payload.role as "ADMIN" | "TRAINER" | "MEMBER") ?? null;
  } catch {
    return null;
  }
}

async function readPlatformOwner(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

function roleHome(role: "ADMIN" | "TRAINER" | "MEMBER") {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TRAINER") return "/trainer/dashboard";
  return "/member/dashboard";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await readRole(request);

  const isAdminRoute = pathname.startsWith("/admin");
  const isTrainerRoute = pathname.startsWith("/trainer");
  const isMemberRoute = pathname.startsWith("/member");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isProtected = isAdminRoute || isTrainerRoute || isMemberRoute || isOnboarding;

  if (isProtected && !role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role) {
    if (isAdminRoute && role !== "ADMIN") return NextResponse.redirect(new URL(roleHome(role), request.url));
    if (isTrainerRoute && role !== "TRAINER") return NextResponse.redirect(new URL(roleHome(role), request.url));
    if (isMemberRoute && role !== "MEMBER") return NextResponse.redirect(new URL(roleHome(role), request.url));

    // Signed-in users shouldn't land back on marketing/auth pages.
    if (["/login", "/signup", "/signup/gym", "/signup/member", "/forgot-password"].includes(pathname)) {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  // Platform-owner console — entirely separate auth track (see lib/auth/session.ts).
  const isPlatformRoute = pathname.startsWith("/platform") && pathname !== "/platform/login";
  if (isPlatformRoute) {
    const isOwner = await readPlatformOwner(request);
    if (!isOwner) return NextResponse.redirect(new URL("/platform/login", request.url));
  }
  if (pathname === "/platform/login") {
    const isOwner = await readPlatformOwner(request);
    if (isOwner) return NextResponse.redirect(new URL("/platform/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/trainer/:path*",
    "/member/:path*",
    "/onboarding",
    "/login",
    "/signup",
    "/signup/:path*",
    "/forgot-password",
    "/platform/:path*",
  ],
};
