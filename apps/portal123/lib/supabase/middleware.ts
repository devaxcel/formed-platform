import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
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

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/trainer") ||
    path.startsWith("/admin");

  const isAuthPage = path.startsWith("/auth");

  // Not logged in + trying to access protected route → login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Logged in + on auth page → redirect to correct portal
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";

    if (role === "admin")   return NextResponse.redirect(new URL("/admin",     request.url));
    if (role === "trainer") return NextResponse.redirect(new URL("/trainer",   request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged in + accessing wrong portal → redirect to correct one
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";

    // Admin trying to access /dashboard or /trainer
    if (role === "admin" && !path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Trainer trying to access /dashboard or /admin
    if (role === "trainer" && !path.startsWith("/trainer")) {
      return NextResponse.redirect(new URL("/trainer", request.url));
    }

    // Client trying to access /trainer or /admin
    if (role === "client" && (path.startsWith("/trainer") || path.startsWith("/admin"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}