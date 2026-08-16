"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import AnnonceCard from "@/components/AnnonceCard";
import {
  createRecherche,
  deleteRecherche,
  listRecherches,
  searchAnnonces,
  ApiError,
  type Annonce,
  type Categorie,
  type RechercheSauvegardee,
  type SearchAnnoncesParams,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

const categories: { value: Categorie | ""; label: string }[] = [
  { value: "", label: "Toutes categories" },
  { value: "FRUITIER", label: "Fruitier" },
  { value: "FORESTIER", label: "Forestier" },
  { value: "MARAICHER", label: "Maraicher" },
  { value: "ORNEMENTAL", label: "Ornemental" },
];

const sortOptions = [
  { value: "pertinence", label: "Pertinence" },
  { value: "proximite", label: "Proximite" },
  { value: "prixAsc", label: "Prix croissant" },
  { value: "prixDesc", label: "Prix decroissant" },
] as const;

const rayonOptions = [10, 25, 50, 100, 200];

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogView />
    </Suspense>
  );
}

function CatalogView() {
  const searchParams = useSearchParams();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState<Categorie | "">("");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [tri, setTri] = useState<NonNullable<SearchAnnoncesParams["tri"]>>("pertinence");

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recherches, setRecherches] = useState<RechercheSauvegardee[]>([]);
  const [showRecherches, setShowRecherches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rayonKm, setRayonKm] = useState(50);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleToggleNearMe() {
    if (coords) {
      setCoords(null);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("La geolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setTri("proximite");
        setGeoLoading(false);
      },
      () => {
        setGeoError("Impossible d'acceder a votre position. Verifiez les autorisations.");
        setGeoLoading(false);
      },
      { timeout: 10_000 }
    );
  }

  useEffect(() => {
    if (!session) return;
    listRecherches(session.token)
      .then(setRecherches)
      .catch(() => {});
  }, [session]);

  async function handleSaveRecherche() {
    if (!session) return;
    setSaving(true);
    setSaveError(null);
    try {
      const nom = [q, categorie, region].filter(Boolean).join(" · ") || "Recherche sans nom";
      const created = await createRecherche(session.token, {
        nom,
        criteres: {
          q: q || undefined,
          categorie: categorie || undefined,
          region: region || undefined,
          tri,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          rayonKm: coords ? rayonKm : undefined,
        },
      });
      setRecherches((prev) => [created, ...prev]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Impossible d'enregistrer la recherche.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecherche(id: string) {
    if (!session) return;
    try {
      await deleteRecherche(session.token, id);
      setRecherches((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  }

  function handleApplyRecherche(recherche: RechercheSauvegardee) {
    setQ(recherche.criteres.q ?? "");
    setCategorie(recherche.criteres.categorie ?? "");
    setRegion(recherche.criteres.region ?? "");
    setTri(recherche.criteres.tri ?? "pertinence");
    if (recherche.criteres.latitude != null && recherche.criteres.longitude != null) {
      setCoords({ latitude: recherche.criteres.latitude, longitude: recherche.criteres.longitude });
      setRayonKm(recherche.criteres.rayonKm ?? 50);
    } else {
      setCoords(null);
    }
    setShowRecherches(false);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      searchAnnonces({
        q: q || undefined,
        categorie: categorie || undefined,
        region: region || undefined,
        tri,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        rayonKm: coords ? rayonKm : undefined,
      })
        .then((result) => {
          setAnnonces(result.resultats);
          setTotal(result.total);
        })
        .catch(() => setError("Impossible de charger le catalogue pour le moment."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [q, categorie, region, tri, coords, rayonKm]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Catalogue</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Parcourez les plants disponibles aupres des pepinieristes du Senegal.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une espece ou variete..."
          className="min-w-[240px] flex-1 rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        />
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value as Categorie | "")}
          className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region"
          className="w-[160px] rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        />
        <select
          value={tri}
          onChange={(e) => setTri(e.target.value as (typeof sortOptions)[number]["value"])}
          className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={geoLoading}
          onClick={handleToggleNearMe}
          className={`whitespace-nowrap rounded-lg border px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium disabled:opacity-60 ${
            coords
              ? "border-[#0f5238] bg-[#0f5238] text-white"
              : "border-[#bfc9c1] text-[#404943] hover:bg-black/5"
          }`}
        >
          {geoLoading ? "Localisation..." : coords ? "✕ Pres de moi" : "📍 Pres de moi"}
        </button>

        {coords && (
          <select
            value={rayonKm}
            onChange={(e) => setRayonKm(Number(e.target.value))}
            className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
          >
            {rayonOptions.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        )}

        {session && (
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveRecherche}
              className="whitespace-nowrap rounded-lg border border-[#0f5238] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#0f5238] hover:bg-[#0f5238]/5 disabled:opacity-60"
            >
              {saved ? "Enregistree ✓" : saving ? "Enregistrement..." : "Sauvegarder cette recherche"}
            </button>
            <button
              type="button"
              onClick={() => setShowRecherches((v) => !v)}
              className="whitespace-nowrap rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-black/5"
            >
              Mes recherches ({recherches.length})
            </button>

            {showRecherches && (
              <div className="fixed inset-x-4 top-16 z-10 flex max-h-[70vh] w-auto flex-col overflow-hidden rounded-xl border border-[#dfe3e0] bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-72">
                {recherches.length === 0 ? (
                  <p className="px-4 py-6 text-center font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                    Aucune recherche enregistree.
                  </p>
                ) : (
                  recherches.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 border-b border-[#eef3ef] px-4 py-3 last:border-b-0 hover:bg-[#eef3ef]/60"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyRecherche(r)}
                        className="flex-1 truncate text-left font-[family-name:var(--font-work-sans)] text-sm text-[#171c19]"
                      >
                        {r.nom}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecherche(r.id)}
                        aria-label="Supprimer"
                        className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-xs text-[#7a1f14] hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {saveError && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {saveError}
        </p>
      )}

      {geoError && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {geoError}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      {!error && !loading && (
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
          {total} annonce{total > 1 ? "s" : ""} trouvee{total > 1 ? "s" : ""}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-xl bg-[#eef3ef]" />
          ))}
        </div>
      ) : annonces.length === 0 && !error ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Aucune annonce ne correspond a votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {annonces.map((annonce) => (
            <AnnonceCard key={annonce.id} annonce={annonce} />
          ))}
        </div>
      )}
    </div>
  );
}
