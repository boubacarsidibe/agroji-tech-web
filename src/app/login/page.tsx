"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function LoginPage() {
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
      saveSession(result);
      router.push(result.utilisateur.roles.includes("ADMIN") ? "/admin" : "/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Connexion impossible pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[420px] flex-col gap-8 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Connexion</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Accedez a votre compte AgroJi-Tech.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]">
            Telephone
          </span>
          <input
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+221771111111"
            className="rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]">
              Mot de passe
            </span>
            <Link
              href="/forgot-password"
              className="font-[family-name:var(--font-work-sans)] text-xs font-medium text-[#0f5238] hover:underline"
            >
              Mot de passe oublie ?
            </Link>
          </div>
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-[#0f5238] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-center font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-[#0f5238] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </div>
  );
}
