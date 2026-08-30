import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">BRGYWEBSAAS</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Multi-tenant Barangay Website and Digital Services Platform</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">A single platform where the Super Admin can create and manage multiple barangay tenants.</p>
        <div className="mt-10"><Link href="/superadmin" className="inline-flex rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400">Open Super Admin Foundation</Link></div>
      </section>
    </main>
  );
}
