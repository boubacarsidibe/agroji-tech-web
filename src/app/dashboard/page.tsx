"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnonce,
  deleteAnnonce,
  listMesAnnonces,
  updateAnnonce,
  ApiError,
  type Categorie,
  type MonAnnonce,
  type StatutAnnonce,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";
import { categorieColors } from "@/lib/colors";

const categories: { value: Categorie; label: string }[] = [
  { value: "FRUITIER", label: "Fruitier" },
  { value: "FORESTIER", label: "Forestier" },
  { value: "MARAICHER", label: "Maraicher" },
  { value: "ORNEMENTAL", label: "Ornemental" },
];

const categorieLabels: Record<Categorie, string> = {
  FRUITIER: "Fruitier",
  FORESTIER: "Forestier",
  MARAICHER: "Maraicher",
  ORNEMENTAL: "Ornemental",
};

const statutLabels: Record<StatutAnnonce, string> = {
  DISPONIBLE: "Disponible",
  RUPTURE: "Rupture",
  ARCHIVEE: "Archivee",
};

const statutColors: Record<StatutAnnonce, string> = {
  DISPONIBLE: "bg-[#e3f3ea] text-[#0f5238]",
  RUPTURE: "bg-[#fdecea] text-[#7a1f14]",
  ARCHIVEE: "bg-[#eef3ef] text-[#404943]",
};

const inputClass =
  "rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]";
const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const isProducteur = session?.utilisateur.roles.includes("PRODUCTEUR") ?? false;

  const [annonces, setAnnonces] = useState<MonAnnonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [espece, setEspece] = useState("");
  const [variete, setVariete] = useState("");
  const [categorie, setCategorie] = useState<Categorie>("FRUITIER");
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [ville, setVille] = useState("");
  const [region, setRegion] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      listMesAnnonces(session.token)
        .then(setAnnonces)
        .catch(() => setError("Impossible de charger vos annonces pour le moment."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session]);

  useEffect(() => {
    if (session === null) router.push("/login");
    else if (!isProducteur) router.push("/");
  }, [session, isProducteur, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setCreating(true);
    setFormError(null);

    try {
      const created = await createAnnonce(session.token, {
        espece,
        variete: variete || undefined,
        categorie,
        quantite,
        prixUnitaire,
        ville: ville || undefined,
        region: region || undefined,
      });
      setAnnonces((prev) => [created, ...prev]);
      setEspece("");
      setVariete("");
      setQuantite(1);
      setPrixUnitaire(0);
      setVille("");
      setRegion("");
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Impossible de creer l'annonce.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatutChange(id: string, statut: StatutAnnonce) {
    if (!session) return;
    setActionId(id);
    try {
      const updated = await updateAnnonce(session.token, id, { statut });
      setAnnonces((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise a jour impossible.");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!session) return;
    setActionId(id);
    try {
      await deleteAnnonce(session.token, id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible.");
    } finally {
      setActionId(null);
    }
  }

  if (!session || !isProducteur) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Redirection...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-3xl font-bold text-[#171c19]">Mes annonces</h1>
          <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
            Gerez vos plants publies sur le catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="whitespace-nowrap rounded-lg bg-[#0f5238] px-6 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#0c4029]"
        >
          {showForm ? "Annuler" : "Nouvelle annonce"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-xl border border-[#dfe3e0] bg-white p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Espece</span>
              <input
                type="text"
                required
                value={espece}
                onChange={(e) => setEspece(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Variete (optionnel)</span>
              <input
                type="text"
                value={variete}
                onChange={(e) => setVariete(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Categorie</span>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as Categorie)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Quantite</span>
              <input
                type="number"
                min={1}
                required
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Prix unitaire (FCFA)</span>
              <input
                type="number"
                min={0}
                required
                value={prixUnitaire}
                onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Ville (optionnel)</span>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Region (optionnel)</span>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            />
          </label>

          {formError && (
            <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="mt-2 rounded-lg bg-[#0f5238] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
          >
            {creating ? "Publication..." : "Publier l'annonce"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[#eef3ef]" />
          ))}
        </div>
      ) : annonces.length === 0 ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Vous n&apos;avez pas encore publie d&apos;annonce.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {annonces.map((annonce) => (
            <div
              key={annonce.id}
              className={`flex flex-col gap-3 overflow-hidden rounded-xl border-l-4 border-[#dfe3e0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between ${categorieColors[annonce.categorie].ring.replace("border-", "border-l-")}`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-base font-semibold text-[#171c19]">
                    {annonce.espece}
                    {annonce.variete ? ` · ${annonce.variete}` : ""}
                  </p>
                  <span
                    className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-xs ${categorieColors[annonce.categorie].bg} ${categorieColors[annonce.categorie].text} ${categorieColors[annonce.categorie].ring}`}
                  >
                    {categorieLabels[annonce.categorie]}
                  </span>
                </div>
                <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                  {annonce.quantite} en stock · {annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA/unite
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-xs font-medium ${statutColors[annonce.statut]}`}
                >
                  {statutLabels[annonce.statut]}
                </span>

                <select
                  value={annonce.statut}
                  disabled={actionId === annonce.id}
                  onChange={(e) => handleStatutChange(annonce.id, e.target.value as StatutAnnonce)}
                  className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238] disabled:opacity-60"
                >
                  {(Object.keys(statutLabels) as StatutAnnonce[]).map((s) => (
                    <option key={s} value={s}>
                      {statutLabels[s]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={actionId === annonce.id}
                  onClick={() => handleDelete(annonce.id)}
                  className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7a1f14] hover:bg-black/5 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
