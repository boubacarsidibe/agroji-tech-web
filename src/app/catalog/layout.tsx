import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue de plants",
  description:
    "Parcourez les plants fruitiers, forestiers, maraichers et ornementaux disponibles aupres des pepinieristes du Senegal. Filtrez par categorie, region et prix.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
