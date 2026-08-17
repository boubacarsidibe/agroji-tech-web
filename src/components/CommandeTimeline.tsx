import type { CommandeHistoriqueEntry, StatutCommande } from "@/lib/api";

const ETAPES: StatutCommande[] = ["ENVOYEE", "ACCEPTEE", "FINALISEE"];

const etapeLabels: Record<StatutCommande, string> = {
  ENVOYEE: "Envoyee",
  ACCEPTEE: "Acceptee",
  REFUSEE: "Refusee",
  FINALISEE: "Finalisee",
};

function formatDateHeure(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommandeTimeline({
  historique,
  statutActuel,
}: {
  historique: CommandeHistoriqueEntry[];
  statutActuel: StatutCommande;
}) {
  const dateParStatut = Object.fromEntries(historique.map((h) => [h.statut, h.createdAt])) as Partial<
    Record<StatutCommande, string>
  >;

  if (statutActuel === "REFUSEE") {
    const etapes: StatutCommande[] = ["ENVOYEE", "REFUSEE"];
    return (
      <ol className="flex items-center gap-1.5">
        {etapes.map((etape, i) => (
          <li key={etape} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`size-2.5 rounded-full ${
                  etape === "REFUSEE" ? "bg-[#c0392b]" : "bg-[#0f5238]"
                }`}
                title={dateParStatut[etape] ? formatDateHeure(dateParStatut[etape]!) : undefined}
              />
              <span className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-[10px] text-[#7c8a80]">
                {etapeLabels[etape]}
              </span>
            </div>
            {i < etapes.length - 1 && <span className="mb-4 h-px w-6 bg-[#c0392b]" />}
          </li>
        ))}
      </ol>
    );
  }

  const indexActuel = ETAPES.indexOf(statutActuel);

  return (
    <ol className="flex items-center gap-1.5">
      {ETAPES.map((etape, i) => {
        const atteinte = i <= indexActuel;
        return (
          <li key={etape} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`size-2.5 rounded-full ${atteinte ? "bg-[#0f5238]" : "bg-[#dfe3e0]"}`}
                title={dateParStatut[etape] ? formatDateHeure(dateParStatut[etape]!) : undefined}
              />
              <span
                className={`whitespace-nowrap font-[family-name:var(--font-work-sans)] text-[10px] ${
                  atteinte ? "text-[#404943]" : "text-[#bfc9c1]"
                }`}
              >
                {etapeLabels[etape]}
              </span>
            </div>
            {i < ETAPES.length - 1 && (
              <span className={`mb-4 h-px w-6 ${i < indexActuel ? "bg-[#0f5238]" : "bg-[#dfe3e0]"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
