import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions legales",
  description: "Mentions legales de la plateforme AgroJi-Tech.",
  alternates: { canonical: "/legal-mentions" },
  robots: { index: false, follow: true },
};

export default function LegalMentionsPage() {
  return (
    <LegalPage
      title="Mentions legales"
      updated="16 aout 2026"
      sections={[
        {
          titre: "Editeur de la plateforme",
          paragraphes: [
            "AgroJi-Tech est une plateforme numerique de mise en relation entre pepinieristes et acheteurs de plants, operant au Senegal.",
            "Contact: contact@agroji-tech.sn",
          ],
        },
        {
          titre: "Hebergement",
          paragraphes: [
            "L'application est composee d'une API backend et d'une interface web deployees sur une infrastructure cloud standard.",
          ],
        },
        {
          titre: "Propriete intellectuelle",
          paragraphes: [
            "Le nom AgroJi-Tech, le logo et l'ensemble des elements graphiques de la plateforme sont la propriete de leurs auteurs respectifs. Les photos publiees par les producteurs restent leur propriete.",
          ],
        },
        {
          titre: "Responsabilite",
          paragraphes: [
            "AgroJi-Tech agit en tant qu'intermediaire technique entre producteurs et acheteurs et n'est pas partie aux transactions realisees entre eux. La certification officielle des plants par un organisme tiers n'est pas couverte par la plateforme.",
          ],
        },
      ]}
    />
  );
}
