import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except for auth pages and api routes)
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/vision" ||
    request.nextUrl.pathname === "/changelog" ||
    request.nextUrl.pathname.startsWith("/opengraph-image");

  // Any redirect must carry the refreshed auth cookies accumulated on
  // supabaseResponse, or a token rotation during the redirect logs the user out.
  const redirectWithCookies = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  if (!user && !isAuthPage && !isApiRoute && !isPublicPath) {
    return redirectWithCookies("/login");
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    return redirectWithCookies("/record");
  }

  return supabaseResponse;
}
