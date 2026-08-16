"use client";

import { useEffect, useState } from "react";
import AnnonceCard from "@/components/AnnonceCard";
import { searchAnnonces, type Annonce, type Categorie } from "@/lib/api";

const categories: { value: Categorie | ""; label: string }[] = [
  { value: "", label: "Toutes categories" },
  { value: "FRUITIER", label: "Fruitier" },
  { value: "FORESTIER", label: "Forestier" },
  { value: "MARAICHER", label: "Maraicher" },
  { value: "ORNEMENTAL", label: "Ornemental" },
];

const sortOptions = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prixAsc", label: "Prix croissant" },
  { value: "prixDesc", label: "Prix decroissant" },
] as const;

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState<Categorie | "">("");
  const [region, setRegion] = useState("");
  const [tri, setTri] = useState<(typeof sortOptions)[number]["value"]>("pertinence");

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      searchAnnonces({
        q: q || undefined,
        categorie: categorie || undefined,
        region: region || undefined,
        tri,
      })
        .then((result) => {
          setAnnonces(result.resultats);
          setTotal(result.total);
        })
        .catch(() => setError("Impossible de charger le catalogue pour le moment."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [q, categorie, region, tri]);

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
      </div>

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
