import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function supabase(path: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const response = await supabase("barangays?select=id,name,slug,municipality,province,status,created_at,updated_at&order=name.asc");
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}

export async function POST(request: NextRequest) {
  const input = await request.json();
  const name = String(input.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Barangay name is required." }, { status: 400 });
  const response = await supabase("barangays", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ name, slug: slugify(name), municipality: String(input.municipality ?? "").trim() || null, province: String(input.province ?? "").trim() || null, status: "active" }) });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}

export async function PATCH(request: NextRequest) {
  const input = await request.json();
  const id = String(input.id ?? "");
  if (!id) return NextResponse.json({ error: "Barangay id is required." }, { status: 400 });
  const payload: Record<string, string | null> = {};
  if (input.name !== undefined) { payload.name = String(input.name).trim(); payload.slug = slugify(payload.name); }
  if (input.municipality !== undefined) payload.municipality = String(input.municipality).trim() || null;
  if (input.province !== undefined) payload.province = String(input.province).trim() || null;
  if (input.status !== undefined) payload.status = input.status === "active" ? "active" : "inactive";
  const response = await supabase(`barangays?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}
