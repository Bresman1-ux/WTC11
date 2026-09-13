import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/transactions", "/assistant"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Optimistic check only: refresh the session cookie and read whether an
  // access token is present. The real authorization boundary is RLS on every
  // database call, not this redirect.
  const { accessToken } = await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
