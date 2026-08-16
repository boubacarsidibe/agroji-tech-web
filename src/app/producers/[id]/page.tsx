"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnnonceCard from "@/components/AnnonceCard";
import {
  getUtilisateur,
  listEvaluationsPourUtilisateur,
  searchAnnonces,
  ApiError,
  type Annonce,
  type EvaluationAvecAuteur,
  type Producteur,
} from "@/lib/api";

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  return `il y a ${days} jours`;
}

export default function ProducerDetailPage() {
  const params = useParams<{ id: string }>();

  const [producteur, setProducteur] = useState<Producteur | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationAvecAuteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      getUtilisateur(params.id)
        .then((p) => {
          setProducteur(p);
          return Promise.all([
            searchAnnonces({ producteurId: params.id }),
            listEvaluationsPourUtilisateur(params.id),
          ]);
        })
        .then(([annoncesResult, evaluationsResult]) => {
          setAnnonces(annoncesResult.resultats);
          setEvaluations(evaluationsResult);
        })
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Impossible de charger ce profil.")
        )
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 py-12">
        <div className="h-40 animate-pulse rounded-xl bg-[#ebdfc3]" />
        <div className="h-64 animate-pulse rounded-xl bg-[#ebdfc3]" />
      </div>
    );
  }

  if (error || !producteur) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#7a1f14]">
          {error ?? "Producteur introuvable."}
        </p>
        <Link href="/producers" className="font-medium text-[#8f3f1c] hover:underline">
          Retour aux producteurs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-10 px-6 py-12">
      <Link
        href="/producers"
        className="w-fit font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33] hover:text-[#8f3f1c]"
      >
        ← Retour aux producteurs
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-[#e4d3ae] bg-white p-6 sm:flex-row sm:items-center">
        {producteur.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time
          <img
            src={producteur.photoUrl}
            alt={producteur.nom}
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-[#ebdfc3] font-sans text-2xl font-semibold text-[#8f3f1c]">
            {producteur.nom.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h1 className="font-sans text-2xl font-bold text-[#241a12]">
            {producteur.nom}
            {producteur.verifie ? " ✓" : ""}
          </h1>
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
            {[producteur.ville, producteur.region].filter(Boolean).join(", ") ||
              "Localisation non precisee"}
          </p>
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
            {producteur.nombreAvis > 0
              ? `${producteur.noteMoyenne.toFixed(1)}★ (${producteur.nombreAvis} avis)`
              : "Pas encore d'avis"}
          </p>
          {producteur.description && (
            <p className="mt-2 font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33]">
              {producteur.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-xl font-semibold text-[#241a12]">
          Annonces disponibles ({annonces.length})
        </h2>

        {annonces.length === 0 ? (
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
            Aucune annonce disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {annonces.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-xl font-semibold text-[#241a12]">Avis</h2>

        {evaluations.length === 0 ? (
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
            Ce producteur n&apos;a pas encore recu d&apos;avis.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="flex flex-col gap-1 rounded-xl border border-[#e4d3ae] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-[#241a12]">
                    {evaluation.auteur.nom}
                  </span>
                  <span className="font-mono text-xs text-[#8f3f1c]">
                    {evaluation.note}★ · {timeAgo(evaluation.createdAt)}
                  </span>
                </div>
                {evaluation.commentaire && (
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33]">
                    {evaluation.commentaire}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
