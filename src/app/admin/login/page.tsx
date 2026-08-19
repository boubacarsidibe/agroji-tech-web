"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, ApiError } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(telephone, motDePasse);
      if (!result.utilisateur.roles.includes("ADMIN")) {
        clearSession();
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }
      saveSession(result);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#171c19] px-6 py-24">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#7c8a80]">
            AgroJi-Tech
          </span>
          <h1 className="font-sans text-3xl font-bold text-white">Administration</h1>
          <p className="font-[family-name:var(--font-work-sans)] text-base text-[#a4ada6]">
            Espace reserve aux administrateurs de la plateforme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-white">
              Telephone
            </span>
            <input
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221770000000"
              className="rounded-lg border border-[#404943] bg-[#1f2621] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-white outline-none focus:border-[#b1f0ce]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-white">
              Mot de passe
            </span>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="rounded-lg border border-[#404943] bg-[#1f2621] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-white outline-none focus:border-[#b1f0ce]"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-[#3a1712] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#f3a99c]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[#b1f0ce] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-[#002114] hover:bg-[#9de3bc] disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
