"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createEvaluation,
  listCommandes,
  updateCommandeStatut,
  ApiError,
  type Commande,
  type StatutCommande,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

const statutLabels: Record<StatutCommande, string> = {
  ENVOYEE: "Envoyee",
  ACCEPTEE: "Acceptee",
  REFUSEE: "Refusee",
  FINALISEE: "Finalisee",
};

const statutColors: Record<StatutCommande, string> = {
  ENVOYEE: "bg-[#eef3ef] text-[#404943]",
  ACCEPTEE: "bg-[#e3f3ea] text-[#0f5238]",
  REFUSEE: "bg-[#fdecea] text-[#7a1f14]",
  FINALISEE: "bg-[#0f5238] text-white",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);

  const isProducteur = session?.utilisateur.roles.includes("PRODUCTEUR") ?? false;
  const isAcheteur = session?.utilisateur.roles.includes("ACHETEUR") ?? false;
  const [role, setRole] = useState<"acheteur" | "producteur">(
    isProducteur && !isAcheteur ? "producteur" : "acheteur"
  );

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [note, setNote] = useState(5);

  useEffect(() => {
    if (session === null) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      listCommandes(session.token, role)
        .then(setCommandes)
        .catch(() => setError("Impossible de charger vos commandes pour le moment."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session, role]);

  useEffect(() => {
    if (session === null) router.push("/login");
  }, [session, router]);

  async function handleStatutChange(id: string, statut: Exclude<StatutCommande, "ENVOYEE">) {
    if (!session) return;
    setActionId(id);
    try {
      const updated = await updateCommandeStatut(session.token, id, statut);
      setCommandes((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise a jour impossible.");
    } finally {
      setActionId(null);
    }
  }

  async function handleEvaluer(commandeId: string) {
    if (!session) return;
    setActionId(commandeId);
    try {
      const evaluation = await createEvaluation(session.token, { commandeId, note });
      setCommandes((prev) =>
        prev.map((c) => (c.id === commandeId ? { ...c, evaluation } : c))
      );
      setEvaluatingId(null);
      setNote(5);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer l'evaluation.");
    } finally {
      setActionId(null);
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
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Mes commandes</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Suivez vos demandes de plants et leur statut.
        </p>
      </div>

      {isProducteur && isAcheteur && (
        <div className="flex w-fit rounded-lg border border-[#bfc9c1] p-1">
          {(["acheteur", "producteur"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-md px-4 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium ${
                role === r ? "bg-[#0f5238] text-white" : "text-[#404943]"
              }`}
            >
              {r === "acheteur" ? "En tant qu'acheteur" : "En tant que producteur"}
            </button>
          ))}
        </div>
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
      ) : commandes.length === 0 ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Aucune commande pour le moment.{" "}
          <Link href="/catalog" className="font-medium text-[#0f5238] hover:underline">
            Parcourir le catalogue
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {commandes.map((commande) => (
            <div
              key={commande.id}
              className="flex flex-col gap-3 rounded-xl border border-[#dfe3e0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/catalog/${commande.annonceId}`}
                  className="font-sans text-base font-semibold text-[#171c19] hover:text-[#0f5238]"
                >
                  {commande.annonce.espece}
                  {commande.annonce.variete ? ` · ${commande.annonce.variete}` : ""}
                </Link>
                <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                  Quantite: {commande.quantiteDemandee} · {commande.annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA/unite
                </p>
                <p className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
                  Commande le {formatDate(commande.createdAt)}
                </p>
                {commande.message && (
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
                    &laquo;{commande.message}&raquo;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-xs font-medium ${statutColors[commande.statut]}`}
                >
                  {statutLabels[commande.statut]}
                </span>

                {role === "producteur" && commande.statut === "ENVOYEE" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === commande.id}
                      onClick={() => handleStatutChange(commande.id, "ACCEPTEE")}
                      className="rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      disabled={actionId === commande.id}
                      onClick={() => handleStatutChange(commande.id, "REFUSEE")}
                      className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-black/5 disabled:opacity-60"
                    >
                      Refuser
                    </button>
                  </div>
                )}

                {commande.statut === "ACCEPTEE" && (
                  <button
                    type="button"
                    disabled={actionId === commande.id}
                    onClick={() => handleStatutChange(commande.id, "FINALISEE")}
                    className="rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                  >
                    Finaliser
                  </button>
                )}

                {role === "acheteur" && commande.statut === "FINALISEE" && (
                  commande.evaluation ? (
                    <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                      Note envoyee: {commande.evaluation.note}★
                    </span>
                  ) : evaluatingId === commande.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={note}
                        onChange={(e) => setNote(Number(e.target.value))}
                        className="rounded-lg border border-[#bfc9c1] px-2 py-1.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n}★
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={actionId === commande.id}
                        onClick={() => handleEvaluer(commande.id)}
                        className="rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                      >
                        Envoyer
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEvaluatingId(commande.id)}
                      className="rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-black/5"
                    >
                      Evaluer
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
