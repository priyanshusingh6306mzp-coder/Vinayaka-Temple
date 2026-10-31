import { NextResponse } from "next/server";
import { edgeAuth } from "@/lib/auth.config";

export default edgeAuth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as { role?: string; mustChangePassword?: boolean } | undefined;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginPage = nextUrl.pathname === "/admin/login" || nextUrl.pathname === "/login";
  const isChangePasswordPage = nextUrl.pathname === "/admin/change-password";

  // Public /login redirect helper
  if (nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  // Admin route protection
  if (isAdminRoute && !isLoginPage) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Forced password change guard
    if (user?.mustChangePassword) {
      if (!isChangePasswordPage) {
        return NextResponse.redirect(new URL("/admin/change-password", nextUrl));
      }
    } else {
      // If password has already been changed, prevent visiting change-password page unnecessarily
      if (isChangePasswordPage) {
        return NextResponse.redirect(new URL("/admin/requests", nextUrl));
      }
    }
  }

  // Already logged in visiting login page
  if (isLoginPage && isLoggedIn) {
    if (user?.mustChangePassword) {
      return NextResponse.redirect(new URL("/admin/change-password", nextUrl));
    }
    return NextResponse.redirect(new URL("/admin/requests", nextUrl));
  }

  // Construct response with full Security Headers
  const response = NextResponse.next();

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://res.cloudinary.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://challenges.cloudflare.com;
    connect-src 'self' https://api.cloudinary.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  return response;
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
  ],
};
