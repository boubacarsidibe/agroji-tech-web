"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCommande, createSignalement, ApiError, type Annonce } from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";
import { categorieColors } from "@/lib/colors";
import { invalidateMesCommandes, useMesCommandesAcheteur } from "@/lib/commandesStore";
import { toggleFavori, useFavoris } from "@/lib/favorisStore";

const categorieLabels: Record<Annonce["categorie"], string> = {
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

export default function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const photo = annonce.photos[0];
  const { commandes: mesCommandes } = useMesCommandesAcheteur(session);
  const commandeExistante = mesCommandes.find((c) => c.annonceId === annonce.id);
  const { isFavori } = useFavoris(session);
  const [togglingFavori, setTogglingFavori] = useState(false);

  const [ordering, setOrdering] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [reporting, setReporting] = useState(false);
  const [raison, setRaison] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  function handleOrderClick() {
    if (!session) {
      router.push("/login");
      return;
    }
    setError(null);
    setOrdering(true);
  }

  async function handleConfirm() {
    if (!session) return;
    setLoading(true);
    setError(null);

    try {
      await createCommande(session.token, { annonceId: annonce.id, quantiteDemandee: quantite });
      invalidateMesCommandes();
      setSent(true);
      setOrdering(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavori() {
    if (!session) {
      router.push("/login");
      return;
    }
    setTogglingFavori(true);
    try {
      await toggleFavori(session, annonce);
    } catch {
      // l'etat optimiste reste affiche; une nouvelle tentative resynchronisera au prochain chargement
    } finally {
      setTogglingFavori(false);
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

  async function handleReportConfirm() {
    if (!session || !raison.trim()) return;
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

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#dfe3e0] bg-white shadow-sm transition hover:shadow-md">
      <div className={`h-1.5 w-full ${categorieColors[annonce.categorie].bar}`} />
      <div className="relative">
        <Link href={`/catalog/${annonce.id}`} className="relative block aspect-[4/3] w-full bg-[#eef3ef]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time
            <img src={photo} alt={annonce.espece} className="h-full w-full object-cover" />
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
        </Link>

        <button
          type="button"
          onClick={handleToggleFavori}
          disabled={togglingFavori}
          aria-label={isFavori(annonce.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavori(annonce.id)}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-60"
        >
          <span className={isFavori(annonce.id) ? "text-[#c0392b]" : "text-[#bfc9c1]"}>
            {isFavori(annonce.id) ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/catalog/${annonce.id}`}>
            <h3 className="font-sans text-lg font-semibold text-[#171c19] hover:text-[#0f5238]">
              {annonce.espece}
              {annonce.variete ? (
                <span className="font-normal text-[#7c8a80]"> · {annonce.variete}</span>
              ) : null}
            </h3>
          </Link>
          <span
            className={`whitespace-nowrap rounded-full border px-2 py-1 font-mono text-xs ${categorieColors[annonce.categorie].bg} ${categorieColors[annonce.categorie].text} ${categorieColors[annonce.categorie].ring}`}
          >
            {categorieLabels[annonce.categorie]}
          </span>
        </div>

        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
          {[annonce.ville, annonce.region].filter(Boolean).join(", ") || "Localisation non precisee"}
          {annonce.distanceKm != null ? ` · ${annonce.distanceKm.toFixed(1)} km` : ""}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-sans text-xl font-bold text-[#0f5238]">
            {annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA
          </span>
          <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
            {annonce.quantite} en stock
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
            {annonce.producteur.nom}
            {annonce.producteur.verifie ? " ✓" : ""}
            {annonce.producteur.noteMoyenne != null
              ? ` · ${annonce.producteur.noteMoyenne.toFixed(1)}★`
              : ""}
          </p>
          {!reportSent && (
            <button
              type="button"
              onClick={handleReportClick}
              className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80] hover:text-[#7a1f14] hover:underline"
            >
              Signaler
            </button>
          )}
        </div>

        {reporting && (
          <div className="flex flex-col gap-2 rounded-lg border border-[#bfc9c1] p-2">
            <textarea
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              placeholder="Motif du signalement..."
              rows={2}
              className="rounded-lg border border-[#bfc9c1] px-2 py-1.5 font-[family-name:var(--font-work-sans)] text-xs text-[#171c19] outline-none focus:border-[#0f5238]"
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
                onClick={handleReportConfirm}
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

        {error && (
          <p className="rounded-lg bg-[#fdecea] px-3 py-2 font-[family-name:var(--font-work-sans)] text-xs text-[#7a1f14]">
            {error}
          </p>
        )}

        {commandeExistante && !sent && (
          <Link
            href="/orders"
            className="rounded-lg bg-[#eef3ef] px-3 py-2 text-center font-[family-name:var(--font-work-sans)] text-xs font-medium text-[#404943] hover:bg-[#e3e9e5]"
          >
            Vous avez deja commande ce plant · {commandeStatutLabels[commandeExistante.statut]}
          </Link>
        )}

        {sent ? (
          <p className="rounded-lg bg-[#e3f3ea] px-3 py-2 text-center font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#0f5238]">
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
              className="w-16 rounded-lg border border-[#bfc9c1] px-2 py-1.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="flex-1 rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setOrdering(false)}
              className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:bg-black/5"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOrderClick}
            className="rounded-lg bg-[#0f5238] px-3 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029]"
          >
            Commander
          </button>
        )}
      </div>
    </div>
  );
}
