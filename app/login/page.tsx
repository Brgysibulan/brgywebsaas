"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to sign in.");
      router.push("/superadmin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">BRGYWEBSAAS</p>
        <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Access your authorized dashboard.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-sky-500" /></label>
          <label className="block text-sm font-medium">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-sky-500" /></label>
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </form>
    </main>
  );
}
