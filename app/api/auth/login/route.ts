import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data?.error_description || data?.msg || "Invalid login credentials." }, { status: response.status });

  const result = NextResponse.json({ ok: true, user: data.user });
  result.cookies.set("sb-access-token", data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: data.expires_in });
  if (data.refresh_token) result.cookies.set("sb-refresh-token", data.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  return result;
}
