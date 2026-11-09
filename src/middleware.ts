import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items: CookieToSet[]) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Cukup memeriksa token (tanpa bertanya ke Supabase bila memungkinkan); data tetap dijaga RLS dan getProfile() di tiap halaman
  const auth = supabase.auth as typeof supabase.auth & { getClaims?: () => Promise<{ data: { claims?: { sub?: string } } | null }> };
  let user: { id: string } | null = null;
  if (typeof auth.getClaims === "function") {
    try {
      const { data } = await auth.getClaims();
      if (data?.claims?.sub) user = { id: data.claims.sub };
    } catch {
      // lanjut ke pemeriksaan lewat server Supabase
    }
  }
  if (!user) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && isPublic && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
