import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!userResponse.ok) return NextResponse.json({ authenticated: false }, { status: 401 });

  const user = await userResponse.json();
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,full_name,role,barangay_id&limit=1`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!profileResponse.ok) return NextResponse.json({ authenticated: false }, { status: 401 });
  const profiles = await profileResponse.json();
  const profile = profiles[0];
  if (!profile) return NextResponse.json({ authenticated: true, authorized: false, user: { id: user.id, email: user.email } }, { status: 403 });

  const role = String(profile.role).toLowerCase();
  return NextResponse.json({ authenticated: true, authorized: role === "super_admin" || role === "superadmin", user: { id: user.id, email: user.email }, profile });
}
