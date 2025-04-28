import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRoutes } from "./config/routes";
import { api } from "./lib/api";

/**
 * Represents the response structure from user-related API calls.
 */
interface UserResponse {
  success: boolean;
  data?: any;
  error?: any;
}

/**
 * Next.js Middleware for handling authentication, token refresh, and route protection.
 *
 * - Ignores static assets and API routes.
 * - Handles authentication pages (login/register) with silent token refresh.
 * - Attempts silent refresh at root ("/") if token is expired, but does not redirect.
 * - Provides hooks for future protected route logic.
 *
 * @param request - The incoming Next.js request object.
 * @returns NextResponse indicating how to proceed.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets and API routes
  if (isStaticOrApiRoute(pathname)) {
    return NextResponse.next();
  }

  const isOnAuthPage = authRoutes.includes(pathname);
  let user: UserResponse = { success: false };

  // Attempt to fetch user info to check authentication status
  try {
    user = await api.get("/auth/user");
  } catch (error) {
    console.error("[Middleware] Failed to fetch user:", error);
    user.error = error;
  }

  // Handle authentication pages (e.g., /login, /register)
  if (isOnAuthPage) {
    // Attempt silent token refresh (does not block)
    await tryRefreshToken(request.url);

    // Re-check user after (potential) refresh
    try {
      user = await api.get("/auth/user");
    } catch (error) {
      console.error("[Middleware] Failed to fetch user after refresh:", error);
    }

    // If already authenticated, redirect to home
    if (user.success) {
      return redirectToHome(request.url);
    }

    // Allow unauthenticated users to access auth pages
    return NextResponse.next();
  }

  // At root ("/"), if token is expired, try to refresh but do not redirect
  if (pathname === "/" && user.error) {
    console.log(
      "[Middleware] Possibly expired token at root, attempting refresh..."
    );
    await tryRefreshToken(request.url); // attempt refresh silently
    return NextResponse.next();
  }

  // For other pages (protected pages), add protection logic here if needed

  return NextResponse.next();
}

/** =========================
 *         Helpers
 *  ========================= */

/**
 * Determines if the given pathname is for a static asset or API route.
 *
 * @param pathname - The URL pathname to check.
 * @returns True if the route should be ignored by middleware.
 */
function isStaticOrApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

/**
 * Redirects the user to the home page.
 *
 * @param currentUrl - The current request URL.
 * @returns A NextResponse redirecting to "/".
 */
function redirectToHome(currentUrl: string): NextResponse {
  return NextResponse.redirect(new URL("/", currentUrl));
}

/**
 * Redirects the user to the login page and logs them out via API.
 *
 * @param currentUrl - The current request URL.
 * @returns A NextResponse redirecting to "/login".
 */
function redirectToLogin(currentUrl: string): NextResponse {
  const response = NextResponse.redirect(new URL("/login", currentUrl));
  api.post("/auth/logout", {});
  return response;
}

/**
 * Attempts to refresh the authentication token silently.
 *
 * @param currentUrl - The current request URL.
 * @returns Null if refresh succeeded, or a redirect response to login if failed.
 */
async function tryRefreshToken(
  currentUrl: string
): Promise<NextResponse | null> {
  try {
    const { success } = await api.post("/auth/refresh", {});

    if (success) {
      console.log("[Middleware] Token refreshed successfully.");
      return null;
    }

    console.warn("[Middleware] Token refresh failed.");
    return redirectToLogin(currentUrl);
  } catch (error) {
    console.error("[Middleware] Error during token refresh:", error);
    return redirectToLogin(currentUrl);
  }
}

/**
 * Next.js Middleware configuration.
 * Matcher excludes static assets and public files.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
