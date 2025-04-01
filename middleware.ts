import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Debugging: Log all cookies
  console.log("Cookies:", request.cookies.getAll());

  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/register";

  // Check for authentication token (assuming it's stored as "user")
  const userCookie = request.cookies.get("user")?.value; // Read cookie value
  const isAuthenticated = Boolean(userCookie); // Convert to boolean

  console.log("Authenticated:", isAuthenticated);

  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
