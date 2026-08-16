"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducteurs, type Producteur } from "@/lib/api";

export default function ProducersPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [producteurs, setProducteurs] = useState<Producteur[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      listProducteurs({ q: q || undefined, region: region || undefined })
        .then((result) => {
          setProducteurs(result.resultats);
          setTotal(result.total);
        })
        .catch(() => setError("Impossible de charger les producteurs pour le moment."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [q, region]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Producteurs</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Decouvrez les pepinieristes partenaires d&apos;AgroJi-Tech au Senegal.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un producteur..."
          className="min-w-[240px] flex-1 rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        />
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region"
          className="w-[160px] rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      {!error && !loading && (
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
          {total} producteur{total > 1 ? "s" : ""} trouve{total > 1 ? "s" : ""}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[220px] animate-pulse rounded-xl bg-[#eef3ef]" />
          ))}
        </div>
      ) : producteurs.length === 0 && !error ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Aucun producteur ne correspond a votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {producteurs.map((producteur) => (
            <div
              key={producteur.id}
              className="flex flex-col gap-3 rounded-xl border border-[#dfe3e0] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {producteur.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time
                  <img
                    src={producteur.photoUrl}
                    alt={producteur.nom}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#eef3ef] font-sans text-lg font-semibold text-[#0f5238]">
                    {producteur.nom.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="font-sans text-base font-semibold text-[#171c19]">
                    {producteur.nom}
                    {producteur.verifie ? " ✓" : ""}
                  </p>
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                    {[producteur.ville, producteur.region].filter(Boolean).join(", ") ||
                      "Localisation non precisee"}
                  </p>
                </div>
              </div>

              {producteur.description && (
                <p className="line-clamp-3 font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
                  {producteur.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                  {producteur.nombreAvis > 0
                    ? `${producteur.noteMoyenne.toFixed(1)}★ (${producteur.nombreAvis} avis)`
                    : "Pas encore d'avis"}
                </span>
                <Link
                  href={`/catalog?region=${encodeURIComponent(producteur.region ?? "")}`}
                  className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#0f5238] hover:underline"
                >
                  Voir les annonces
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
