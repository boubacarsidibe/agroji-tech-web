"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

export default function RegisterAsProducerPage() {
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
        roles: ["PRODUCTEUR"],
        ville: ville || undefined,
        region: region || undefined,
        description: description || undefined,
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
    "rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]";
  const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]";

  if (step === "otp") {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col gap-8 px-6 py-24">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-3xl font-bold text-[#171c19]">Verification</h1>
          <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
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
            className="mt-2 rounded-lg bg-[#0f5238] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
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
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Devenir producteur</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Rejoignez AgroJi-Tech et publiez vos annonces de plants aupres des acheteurs du Senegal.
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
              placeholder="+221771111111"
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

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Description (optionnel)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Presentez votre pepiniere..."
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
          {loading ? "Inscription..." : "S'inscrire comme producteur"}
        </button>
      </form>
    </div>
  );
}
