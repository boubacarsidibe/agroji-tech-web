"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  archiverAnnonceAdmin,
  getAdminDashboard,
  listSignalements,
  listUtilisateurs,
  suspendreUtilisateur,
  traiterSignalement,
  verifierUtilisateur,
  ApiError,
  type AdminDashboard,
  type Producteur,
  type Signalement,
  type StatutSignalement,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

const statutLabels: Record<StatutSignalement, string> = {
  OUVERT: "Ouvert",
  TRAITE: "Traite",
  REJETE: "Rejete",
};

const statutColors: Record<StatutSignalement, string> = {
  OUVERT: "bg-[#fdecea] text-[#7a1f14]",
  TRAITE: "bg-[#e3f3ea] text-[#0f5238]",
  REJETE: "bg-[#eef3ef] text-[#404943]",
};

export default function AdminPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const isAdmin = session?.utilisateur.roles.includes("ADMIN") ?? false;

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [filtre, setFiltre] = useState<StatutSignalement | "">("OUVERT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [utilisateurs, setUtilisateurs] = useState<Producteur[]>([]);
  const [roleFiltre, setRoleFiltre] = useState<"" | "PRODUCTEUR" | "ACHETEUR">("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [userActionId, setUserActionId] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) router.push("/login");
    else if (!isAdmin) router.push("/");
  }, [session, isAdmin, router]);

  useEffect(() => {
    if (!session || !isAdmin) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      Promise.all([
        getAdminDashboard(session.token),
        listSignalements(session.token, filtre || undefined),
      ])
        .then(([dash, sigs]) => {
          setDashboard(dash);
          setSignalements(sigs);
        })
        .catch(() => setError("Impossible de charger les donnees d'administration."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session, isAdmin, filtre]);

  useEffect(() => {
    if (!session || !isAdmin) return;

    const timeout = setTimeout(() => {
      setUsersLoading(true);
      listUtilisateurs({ role: roleFiltre || undefined })
        .then((result) => setUtilisateurs(result.resultats))
        .catch(() => setError("Impossible de charger les utilisateurs."))
        .finally(() => setUsersLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session, isAdmin, roleFiltre]);

  async function handleSuspendre(id: string) {
    if (!session) return;
    setUserActionId(id);
    try {
      await suspendreUtilisateur(session.token, id);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suspension impossible.");
    } finally {
      setUserActionId(null);
    }
  }

  async function handleVerifier(id: string) {
    if (!session) return;
    setUserActionId(id);
    try {
      await verifierUtilisateur(session.token, id);
      setUtilisateurs((prev) => prev.map((u) => (u.id === id ? { ...u, verifie: true } : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification impossible.");
    } finally {
      setUserActionId(null);
    }
  }

  async function handleTraiter(id: string, statut: "TRAITE" | "REJETE") {
    if (!session) return;
    setActionId(id);
    try {
      const updated = await traiterSignalement(session.token, id, statut);
      setSignalements((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise a jour impossible.");
    } finally {
      setActionId(null);
    }
  }

  async function handleArchiver(id: string, annonceId: string) {
    if (!session) return;
    setActionId(id);
    try {
      await archiverAnnonceAdmin(session.token, annonceId);
      const updated = await traiterSignalement(session.token, id, "TRAITE");
      setSignalements((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible.");
    } finally {
      setActionId(null);
    }
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Redirection...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Administration</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Tableau de bord et moderation de la plateforme.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Utilisateurs", value: dashboard?.utilisateurs },
          { label: "Annonces actives", value: dashboard?.annoncesActives },
          { label: "Transactions", value: dashboard?.transactions },
          { label: "Signalements ouverts", value: dashboard?.signalementsOuverts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl border border-[#dfe3e0] bg-white p-4"
          >
            <span className="font-sans text-2xl font-bold text-[#0f5238]">
              {stat.value ?? "—"}
            </span>
            <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-xl font-semibold text-[#171c19]">Signalements</h2>
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value as StatutSignalement | "")}
            className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
          >
            <option value="">Tous</option>
            <option value="OUVERT">Ouverts</option>
            <option value="TRAITE">Traites</option>
            <option value="REJETE">Rejetes</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#eef3ef]" />
            ))}
          </div>
        ) : signalements.length === 0 ? (
          <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
            Aucun signalement.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {signalements.map((signalement) => (
              <div
                key={signalement.id}
                className="flex flex-col gap-3 rounded-xl border border-[#dfe3e0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-sans text-base font-semibold text-[#171c19]">
                    {signalement.annonce
                      ? `${signalement.annonce.espece}${
                          signalement.annonce.variete ? ` · ${signalement.annonce.variete}` : ""
                        }`
                      : "Annonce supprimee"}
                  </p>
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
                    &laquo;{signalement.raison}&raquo; — par {signalement.auteur?.nom ?? "utilisateur supprime"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 font-mono text-xs font-medium ${statutColors[signalement.statut]}`}
                  >
                    {statutLabels[signalement.statut]}
                  </span>

                  {signalement.statut === "OUVERT" && (
                    <div className="flex gap-2">
                      {signalement.annonceId && (
                        <button
                          type="button"
                          disabled={actionId === signalement.id}
                          onClick={() => handleArchiver(signalement.id, signalement.annonceId!)}
                          className="whitespace-nowrap rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                        >
                          Archiver l&apos;annonce
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionId === signalement.id}
                        onClick={() => handleTraiter(signalement.id, "TRAITE")}
                        className="whitespace-nowrap rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#404943] hover:bg-black/5 disabled:opacity-60"
                      >
                        Marquer traite
                      </button>
                      <button
                        type="button"
                        disabled={actionId === signalement.id}
                        onClick={() => handleTraiter(signalement.id, "REJETE")}
                        className="whitespace-nowrap rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7a1f14] hover:bg-black/5 disabled:opacity-60"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-xl font-semibold text-[#171c19]">Utilisateurs</h2>
          <select
            value={roleFiltre}
            onChange={(e) => setRoleFiltre(e.target.value as "" | "PRODUCTEUR" | "ACHETEUR")}
            className="rounded-lg border border-[#bfc9c1] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
          >
            <option value="">Tous les roles</option>
            <option value="PRODUCTEUR">Producteurs</option>
            <option value="ACHETEUR">Acheteurs</option>
          </select>
        </div>

        {usersLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#eef3ef]" />
            ))}
          </div>
        ) : utilisateurs.length === 0 ? (
          <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
            Aucun utilisateur actif ne correspond a ce filtre.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {utilisateurs.map((utilisateur) => (
              <div
                key={utilisateur.id}
                className="flex flex-col gap-3 rounded-xl border border-[#dfe3e0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-sans text-base font-semibold text-[#171c19]">
                    {utilisateur.nom}
                    {utilisateur.verifie ? " ✓" : ""}
                  </p>
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                    {utilisateur.roles.join(", ")}
                    {utilisateur.region ? ` · ${utilisateur.region}` : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!utilisateur.verifie && (
                    <button
                      type="button"
                      disabled={userActionId === utilisateur.id}
                      onClick={() => handleVerifier(utilisateur.id)}
                      className="whitespace-nowrap rounded-lg bg-[#0f5238] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#0c4029] disabled:opacity-60"
                    >
                      Verifier
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={userActionId === utilisateur.id}
                    onClick={() => handleSuspendre(utilisateur.id)}
                    className="whitespace-nowrap rounded-lg border border-[#bfc9c1] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7a1f14] hover:bg-black/5 disabled:opacity-60"
                  >
                    Suspendre
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
