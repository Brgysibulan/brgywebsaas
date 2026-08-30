"use client";

import { FormEvent, useMemo, useState } from "react";

type Barangay = {
  id: number;
  name: string;
  municipality: string;
  province: string;
  status: "Active" | "Inactive";
};

const initialBarangays: Barangay[] = [];

export default function SuperAdminPage() {
  const [barangays, setBarangays] = useState(initialBarangays);
  const [form, setForm] = useState({ name: "", municipality: "", province: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const title = useMemo(() => (editingId ? "Edit Barangay" : "Add Barangay"), [editingId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    if (editingId) {
      setBarangays((items) =>
        items.map((item) => (item.id === editingId ? { ...item, ...form, name } : item)),
      );
      setMessage(`${name} updated successfully.`);
    } else {
      setBarangays((items) => [
        ...items,
        { id: Date.now(), ...form, name, status: "Active" },
      ]);
      setMessage(`${name} added successfully.`);
    }

    reset();
  }

  function reset() {
    setForm({ name: "", municipality: "", province: "" });
    setEditingId(null);
  }

  function edit(item: Barangay) {
    setEditingId(item.id);
    setForm({ name: item.name, municipality: item.municipality, province: item.province });
    setMessage("");
  }

  function toggleStatus(id: number) {
    setBarangays((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">BRGYWEBSAAS</p>
            <h1 className="mt-1 text-2xl font-bold">Super Admin</h1>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">Barangay Management</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Barangays</h2>
          <p className="mt-2 text-slate-600">Create and manage barangay tenants for the platform.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">{title}</h3>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium">Barangay Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-sky-500" placeholder="e.g. Barangay Sibulan" /></label>
              <label className="block text-sm font-medium">Municipality<input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-sky-500" placeholder="Municipality" /></label>
              <label className="block text-sm font-medium">Province<input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-sky-500" placeholder="Province" /></label>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white hover:bg-sky-700">{editingId ? "Save Changes" : "Add Barangay"}</button>
              {editingId && <button type="button" onClick={reset} className="rounded-lg border px-4 py-2.5 font-semibold">Cancel</button>}
            </div>
            {message && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
          </form>

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5"><h3 className="font-bold">Registered Barangays</h3><p className="text-sm text-slate-500">{barangays.length} tenant{barangays.length === 1 ? "" : "s"}</p></div>
            {barangays.length === 0 ? (
              <div className="px-6 py-16 text-center"><p className="font-semibold">No barangays yet</p><p className="mt-1 text-sm text-slate-500">Use the form to create the first barangay tenant.</p></div>
            ) : (
              <div className="divide-y">{barangays.map((item) => <div key={item.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold">{item.name}</div><div className="mt-1 text-sm text-slate-500">{item.municipality || "—"}, {item.province || "—"}</div></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{item.status}</span><button onClick={() => edit(item)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Edit</button><button onClick={() => toggleStatus(item.id)} className="rounded-lg border px-3 py-2 text-sm font-semibold">{item.status === "Active" ? "Deactivate" : "Activate"}</button></div></div>)}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
