"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestPasswordResetOtp, resetPassword, ApiError } from "@/lib/api";

const inputClass =
  "rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]";
const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordResetOtp(telephone);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le code pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPassword({ telephone, code, nouveauMotDePasse });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reinitialisation impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col gap-6 px-6 py-24 text-center">
        <h1 className="font-sans text-2xl font-bold text-[#171c19]">Mot de passe reinitialise</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Vous allez etre redirige vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[420px] flex-col gap-8 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Mot de passe oublie</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          {step === "phone"
            ? "Entrez votre numero de telephone pour recevoir un code de verification."
            : `Un code a 6 chiffres a ete envoye par SMS au ${telephone}.`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Telephone</span>
            <input
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221771111111"
              className={inputClass}
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
            {loading ? "Envoi..." : "Envoyer le code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Code de verification</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nouveau mot de passe</span>
            <input
              type="password"
              required
              minLength={6}
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              className={inputClass}
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
            {loading ? "Reinitialisation..." : "Reinitialiser le mot de passe"}
          </button>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-center font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:underline"
          >
            Changer de numero
          </button>
        </form>
      )}

      <p className="text-center font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
        <Link href="/login" className="font-medium text-[#0f5238] hover:underline">
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}
