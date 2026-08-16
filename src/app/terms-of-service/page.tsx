import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation de la plateforme AgroJi-Tech.",
  alternates: { canonical: "/terms-of-service" },
  robots: { index: false, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      updated="16 aout 2026"
      sections={[
        {
          titre: "1. Objet",
          paragraphes: [
            "AgroJi-Tech est une plateforme de mise en relation entre pepinieristes (producteurs) et acheteurs de plants au Senegal. La plateforme facilite la publication d'annonces, la recherche de plants et le suivi des demandes de commande.",
          ],
        },
        {
          titre: "2. Comptes et roles",
          paragraphes: [
            "Un compte peut avoir le role acheteur, producteur, ou les deux. L'inscription en tant que producteur necessite une verification du numero de telephone par code envoye par SMS.",
            "Vous etes responsable de l'exactitude des informations fournies et de la confidentialite de votre mot de passe.",
          ],
        },
        {
          titre: "3. Annonces et commandes",
          paragraphes: [
            "Les producteurs sont responsables de l'exactitude des annonces qu'ils publient (espece, quantite, prix, disponibilite).",
            "Une commande est une demande adressee au producteur, qui peut l'accepter, la refuser, puis la marquer comme finalisee une fois la transaction realisee.",
            "AgroJi-Tech ne prend pas en charge le paiement en ligne ni la logistique de livraison dans cette version: ces aspects sont geres directement entre l'acheteur et le producteur.",
          ],
        },
        {
          titre: "4. Comportement attendu",
          paragraphes: [
            "Toute annonce ou comportement frauduleux, trompeur ou abusif peut etre signale et fera l'objet d'une moderation, pouvant aller jusqu'a l'archivage de l'annonce ou la suspension du compte concerne.",
          ],
        },
        {
          titre: "5. Evaluations",
          paragraphes: [
            "Seul l'acheteur d'une commande finalisee peut evaluer le producteur correspondant. Les evaluations refletent l'opinion de leur auteur et non celle d'AgroJi-Tech.",
          ],
        },
      ]}
    />
  );
}
