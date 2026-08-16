import type { Annonce } from "@/lib/api";

const categorieLabels: Record<Annonce["categorie"], string> = {
  FRUITIER: "Fruitier",
  FORESTIER: "Forestier",
  MARAICHER: "Maraicher",
  ORNEMENTAL: "Ornemental",
};

export default function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const photo = annonce.photos[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#dfe3e0] bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-[#eef3ef]">
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
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-lg font-semibold text-[#171c19]">
            {annonce.espece}
            {annonce.variete ? (
              <span className="font-normal text-[#7c8a80]"> · {annonce.variete}</span>
            ) : null}
          </h3>
          <span className="whitespace-nowrap rounded-full bg-[#eef3ef] px-2 py-1 font-mono text-xs text-[#0f5238]">
            {categorieLabels[annonce.categorie]}
          </span>
        </div>

        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
          {[annonce.ville, annonce.region].filter(Boolean).join(", ") || "Localisation non precisee"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-sans text-xl font-bold text-[#0f5238]">
            {annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA
          </span>
          <span className="font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
            {annonce.quantite} en stock
          </span>
        </div>

        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
          {annonce.producteur.nom}
          {annonce.producteur.verifie ? " ✓" : ""}
          {annonce.producteur.noteMoyenne != null
            ? ` · ${annonce.producteur.noteMoyenne.toFixed(1)}★`
            : ""}
        </p>
      </div>
    </div>
  );
}
