"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCommande,
  createSignalement,
  getAnnonce,
  listEvaluationsPourUtilisateur,
  ApiError,
  type AnnonceDetail,
  type EvaluationAvecAuteur,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";
import { categorieColors } from "@/lib/colors";
import { invalidateMesCommandes, useMesCommandesAcheteur } from "@/lib/commandesStore";
import AnnonceMap from "@/components/AnnonceMap";

const categorieLabels: Record<AnnonceDetail["categorie"], string> = {
  FRUITIER: "Fruitier",
  FORESTIER: "Forestier",
  MARAICHER: "Maraicher",
  ORNEMENTAL: "Ornemental",
};

const commandeStatutLabels = {
  ENVOYEE: "envoyee",
  ACCEPTEE: "acceptee",
  REFUSEE: "refusee",
  FINALISEE: "finalisee",
} as const;

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  return `il y a ${days} jours`;
}

export default function AnnonceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const { commandes: mesCommandes } = useMesCommandesAcheteur(session);

  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [evaluations, setEvaluations] = useState<EvaluationAvecAuteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ordering, setOrdering] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [reporting, setReporting] = useState(false);
  const [raison, setRaison] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      getAnnonce(params.id)
        .then((a) => {
          setAnnonce(a);
          setSelectedPhoto(0);
          return listEvaluationsPourUtilisateur(a.producteur.id);
        })
        .then(setEvaluations)
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Impossible de charger cette annonce.")
        )
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [params.id]);

  function handleOrderClick() {
    if (!session) {
      router.push("/login");
      return;
    }
    setOrderError(null);
    setOrdering(true);
  }

  async function handleConfirmOrder() {
    if (!session || !annonce) return;
    setOrderLoading(true);
    setOrderError(null);

    try {
      await createCommande(session.token, { annonceId: annonce.id, quantiteDemandee: quantite });
      invalidateMesCommandes();
      setSent(true);
      setOrdering(false);
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setOrderLoading(false);
    }
  }

  function handleReportClick() {
    if (!session) {
      router.push("/login");
      return;
    }
    setReportError(null);
    setReporting(true);
  }

  async function handleConfirmReport() {
    if (!session || !annonce || !raison.trim()) return;
    setReportLoading(true);
    setReportError(null);

    try {
      await createSignalement(session.token, { annonceId: annonce.id, raison: raison.trim() });
      setReportSent(true);
      setReporting(false);
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : "Impossible d'envoyer le signalement.");
    } finally {
      setReportLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-6 py-12">
        <div className="h-80 animate-pulse rounded-xl bg-[#eef3ef]" />
        <div className="h-24 animate-pulse rounded-xl bg-[#eef3ef]" />
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#7a1f14]">
          {error ?? "Annonce introuvable."}
        </p>
        <Link href="/catalog" className="font-medium text-[#0f5238] hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const colors = categorieColors[annonce.categorie];

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 py-12">
      <Link
        href="/catalog"
        className="w-fit font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
      >
        ← Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eef3ef]">
            {annonce.photos[selectedPhoto] ? (
              // eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time
              <img
                src={annonce.photos[selectedPhoto]}
                alt={annonce.espece}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#7c8a80]">
                Pas de photo
              </div>
            )}
            {annonce.miseEnAvant && (
              <span className="absolute left-3 top-3 rounded-full bg-[#0f5238] px-3 py-1 font-mono text-xs font-medium text-white">
                En avant
              </span>
            )}
          </div>

          {annonce.photos.length > 1 && (
            <div className="flex gap-2">
              {annonce.photos.map((photo, i) => (
                <button
                  key={photo + i}
                  type="button"
                  onClick={() => setSelectedPhoto(i)}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selectedPhoto ? "border-[#0f5238]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time */}
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span
              className={`w-fit rounded-full border px-3 py-1 font-mono text-xs ${colors.bg} ${colors.text} ${colors.ring}`}
            >
              {categorieLabels[annonce.categorie]}
            </span>
            <h1 className="font-sans text-2xl font-bold text-[#171c19]">
              {annonce.espece}
              {annonce.variete ? (
                <span className="font-normal text-[#7c8a80]"> · {annonce.variete}</span>
              ) : null}
            </h1>
            <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
              {[annonce.ville, annonce.region].filter(Boolean).join(", ") ||
                "Localisation non precisee"}{" "}
              · {annonce.vues} vue{annonce.vues > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#dfe3e0] bg-white p-4">
            <span className="font-sans text-2xl font-bold text-[#0f5238]">
              {annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA
            </span>
            <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
              {annonce.quantite} en stock
            </span>
          </div>

          <Link
            href={`/producers/${annonce.producteur.id}`}
            className="flex items-center justify-between rounded-xl border border-[#dfe3e0] bg-white p-4 hover:border-[#0f5238]"
          >
            <div className="flex flex-col">
              <span className="font-sans text-base font-semibold text-[#171c19]">
                {annonce.producteur.nom}
                {annonce.producteur.verifie ? " ✓" : ""}
              </span>
              <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                {annonce.producteur.noteMoyenne != null && annonce.producteur.nombreAvis > 0
                  ? `${annonce.producteur.noteMoyenne.toFixed(1)}★ (${annonce.producteur.nombreAvis} avis)`
                  : "Pas encore d'avis"}
              </span>
            </div>
          </Link>

          {orderError && (
            <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
              {orderError}
            </p>
          )}

          {!sent &&
            (() => {
              const commandeExistante = mesCommandes.find((c) => c.annonceId === annonce.id);
              return commandeExistante ? (
                <Link
                  href="/orders"
                  className="rounded-lg bg-[#eef3ef] px-4 py-3 text-center font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-[#e3e9e5]"
                >
                  Vous avez deja commande ce plant · {commandeStatutLabels[commandeExistante.statut]}
                </Link>
              ) : null;
            })()}

          {annonce.statut !== "DISPONIBLE" ? (
            <p className="rounded-lg bg-[#eef3ef] px-4 py-3 text-center font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7c8a80]">
              Cette annonce n&apos;est plus disponible
            </p>
          ) : sent ? (
            <p className="rounded-lg bg-[#e3f3ea] px-4 py-3 text-center font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#0f5238]">
              Demande envoyee
            </p>
          ) : ordering ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={annonce.quantite}
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className="w-20 rounded-lg border border-[#bfc9c1] px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
              />
              <button
                type="button"
                disabled={orderLoading}
                onClick={handleConfirmOrder}
                className="flex-1 rounded-lg bg-[#0f5238] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
              >
                {orderLoading ? "Envoi..." : "Confirmer"}
              </button>
              <button
                type="button"
                onClick={() => setOrdering(false)}
                className="rounded-lg border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:bg-black/5"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOrderClick}
              className="rounded-lg bg-[#0f5238] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#0c4029]"
            >
              Commander
            </button>
          )}

          {!reportSent && (
            <button
              type="button"
              onClick={handleReportClick}
              className="w-fit font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80] hover:text-[#7a1f14] hover:underline"
            >
              Signaler cette annonce
            </button>
          )}

          {reporting && (
            <div className="flex flex-col gap-2 rounded-lg border border-[#bfc9c1] p-3">
              <textarea
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                placeholder="Motif du signalement..."
                rows={2}
                className="rounded-lg border border-[#bfc9c1] px-3 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
              />
              {reportError && (
                <p className="font-[family-name:var(--font-work-sans)] text-xs text-[#7a1f14]">
                  {reportError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={reportLoading || !raison.trim()}
                  onClick={handleConfirmReport}
                  className="flex-1 rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-xs font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                >
                  {reportLoading ? "Envoi..." : "Envoyer"}
                </button>
                <button
                  type="button"
                  onClick={() => setReporting(false)}
                  className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-xs text-[#404943] hover:bg-black/5"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {reportSent && (
            <p className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
              Signalement envoye, merci.
            </p>
          )}

          {annonce.latitude != null && annonce.longitude != null && (
            <div className="flex flex-col gap-2">
              <h2 className="font-sans text-base font-semibold text-[#171c19]">
                Localisation
              </h2>
              <AnnonceMap
                latitude={annonce.latitude}
                longitude={annonce.longitude}
                label={`${annonce.espece} · ${annonce.producteur.nom}`}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-xl font-semibold text-[#171c19]">
          Avis sur {annonce.producteur.nom}
        </h2>

        {evaluations.length === 0 ? (
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
            Ce producteur n&apos;a pas encore recu d&apos;avis.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="flex flex-col gap-1 rounded-xl border border-[#dfe3e0] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-[#171c19]">
                    {evaluation.auteur.nom}
                  </span>
                  <span className="font-mono text-xs text-[#0f5238]">
                    {evaluation.note}★ · {timeAgo(evaluation.createdAt)}
                  </span>
                </div>
                {evaluation.commentaire && (
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
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
