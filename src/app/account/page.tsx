"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  changerMotDePasse,
  deactivateMonCompte,
  deleteMonCompte,
  getMonProfil,
  updateMonProfil,
  ApiError,
  type MonProfil,
} from "@/lib/api";
import { clearSession, getSession, subscribeToAuthChanges } from "@/lib/auth";

const inputClass =
  "rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]";
const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]";

export default function AccountPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);

  const [profil, setProfil] = useState<MonProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [ville, setVille] = useState("");
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerError, setDangerError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) router.push("/login");
  }, [session, router]);

  useEffect(() => {
    if (!session) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      getMonProfil(session.token)
        .then((p) => {
          setProfil(p);
          setNom(p.nom);
          setDescription(p.description ?? "");
          setVille(p.ville ?? "");
          setRegion(p.region ?? "");
        })
        .catch(() => setError("Impossible de charger votre profil."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setSaveError(null);

    try {
      const updated = await updateMonProfil(session.token, {
        nom,
        description: description || undefined,
        ville: ville || undefined,
        region: region || undefined,
      });
      setProfil((prev) => (prev ? { ...prev, ...updated } : prev));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Mise a jour impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setPasswordSaving(true);
    setPasswordError(null);

    try {
      await changerMotDePasse(session.token, { motDePasseActuel, nouveauMotDePasse });
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Changement impossible.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!session) return;
    setDangerLoading(true);
    setDangerError(null);
    try {
      await deactivateMonCompte(session.token);
      clearSession();
      router.push("/");
    } catch (err) {
      setDangerError(err instanceof ApiError ? err.message : "Desactivation impossible.");
    } finally {
      setDangerLoading(false);
    }
  }

  async function handleDelete() {
    if (!session) return;
    setDangerLoading(true);
    setDangerError(null);
    try {
      await deleteMonCompte(session.token);
      clearSession();
      router.push("/");
    } catch (err) {
      setDangerError(err instanceof ApiError ? err.message : "Suppression impossible.");
    } finally {
      setDangerLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Mon compte</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Gerez vos informations personnelles.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-[#eef3ef]" />
      ) : profil ? (
        <>
          <form
            onSubmit={handleSave}
            className="flex flex-col gap-4 rounded-xl border border-[#dfe3e0] bg-white p-5"
          >
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

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Telephone</span>
              <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                {profil.telephone} (non modifiable)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Ville</span>
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Region</span>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            {profil.roles.includes("PRODUCTEUR") && (
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </label>
            )}

            {saveError && (
              <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
                {saveError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 rounded-lg bg-[#0f5238] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
            >
              {saved ? "Enregistre ✓" : saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4 rounded-xl border border-[#dfe3e0] bg-white p-5"
          >
            <h2 className="font-sans text-lg font-semibold text-[#171c19]">Mot de passe</h2>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Mot de passe actuel</span>
              <input
                type="password"
                required
                value={motDePasseActuel}
                onChange={(e) => setMotDePasseActuel(e.target.value)}
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

            {passwordError && (
              <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
                {passwordError}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="mt-2 w-fit rounded-lg bg-[#0f5238] px-6 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
            >
              {passwordSaved ? "Modifie ✓" : passwordSaving ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>

          <div className="flex flex-col gap-4 rounded-xl border border-[#f0c9c2] bg-white p-5">
            <h2 className="font-sans text-lg font-semibold text-[#7a1f14]">Zone sensible</h2>

            {dangerError && (
              <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
                {dangerError}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
                Desactiver votre compte le rend inaccessible sans le supprimer.
              </p>
              {confirmingDeactivate ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={dangerLoading}
                    onClick={handleDeactivate}
                    className="rounded-lg bg-[#7a1f14] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#5f180f] disabled:opacity-60"
                  >
                    Confirmer la desactivation
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeactivate(false)}
                    className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:bg-black/5"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeactivate(true)}
                  className="w-fit rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-black/5"
                >
                  Desactiver mon compte
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-[#f0c9c2] pt-4">
              <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
                Supprimer votre compte est definitif et irreversible.
              </p>
              {confirmingDelete ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={dangerLoading}
                    onClick={handleDelete}
                    className="rounded-lg bg-[#7a1f14] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#5f180f] disabled:opacity-60"
                  >
                    Confirmer la suppression definitive
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:bg-black/5"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="w-fit rounded-lg border border-[#7a1f14] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7a1f14] hover:bg-[#7a1f14]/5"
                >
                  Supprimer mon compte
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
