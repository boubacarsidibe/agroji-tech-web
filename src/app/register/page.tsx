"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, verifyAccount, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";

const senegalRegions = [
  "Dakar",
  "Thies",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Kaffrine",
  "Kolda",
  "Kedougou",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sedhiou",
  "Tambacounda",
  "Ziguinchor",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [ville, setVille] = useState("");
  const [region, setRegion] = useState("");
  const [aussiProducteur, setAussiProducteur] = useState(false);
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        nom,
        telephone,
        email: email || undefined,
        motDePasse,
        roles: aussiProducteur ? ["ACHETEUR", "PRODUCTEUR"] : ["ACHETEUR"],
        ville: ville || undefined,
        region: region || undefined,
        description: aussiProducteur ? description || undefined : undefined,
      });
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifyAccount(telephone, code);
      saveSession(result);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "rounded-lg border border-[#d9c7a3] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#241a12] outline-none focus:border-[#b8552b]";
  const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#241a12]";

  if (step === "otp") {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col gap-8 px-6 py-24">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-3xl font-bold text-[#241a12]">Verification</h1>
          <p className="font-[family-name:var(--font-work-sans)] text-base text-[#4a3f33]">
            Un code a 6 chiffres a ete envoye par SMS au {telephone}.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
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

          {error && (
            <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[#b8552b] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#8f3f1c] disabled:opacity-60"
          >
            {loading ? "Verification..." : "Verifier et continuer"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-8 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#241a12]">Creer un compte</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#4a3f33]">
          Rejoignez AgroJi-Tech pour commander des plants aupres des pepinieristes du Senegal.
        </p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Nom complet</span>
          <input
            type="text"
            required
            minLength={2}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Telephone</span>
            <input
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221772222222"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Email (optionnel)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Mot de passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Ville (optionnel)</span>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Region (optionnel)</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
              <option value="">Selectionner...</option>
              {senegalRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={aussiProducteur}
            onChange={(e) => setAussiProducteur(e.target.checked)}
            className="size-4 accent-[#b8552b]"
          />
          <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#241a12]">
            Je suis aussi producteur (pepinieriste)
          </span>
        </label>

        {aussiProducteur && (
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Description de votre pepiniere (optionnel)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Presentez votre pepiniere..."
              className={inputClass}
            />
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-[#b8552b] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#8f3f1c] disabled:opacity-60"
        >
          {loading ? "Inscription..." : "Creer mon compte"}
        </button>

        <p className="text-center font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33]">
          Deja un compte ?{" "}
          <Link href="/login" className="font-medium text-[#8f3f1c] hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
