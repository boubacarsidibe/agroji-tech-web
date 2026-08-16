import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producteurs",
  description:
    "Decouvrez les pepinieristes partenaires d'AgroJi-Tech au Senegal : profils verifies, notes et avis des acheteurs.",
  alternates: { canonical: "/producers" },
};

export default function ProducersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
