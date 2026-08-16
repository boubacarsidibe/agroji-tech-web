import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  description: "Comment AgroJi-Tech collecte, utilise et protege vos donnees personnelles.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Politique de confidentialite"
      updated="16 aout 2026"
      sections={[
        {
          titre: "1. Donnees collectees",
          paragraphes: [
            "Lors de la creation d'un compte, nous collectons votre nom, votre numero de telephone, et facultativement votre email, votre ville, votre region et une description (pour les producteurs).",
            "Lorsque vous utilisez la plateforme, nous conservons les annonces publiees, les demandes de commande, les evaluations, les signalements et les recherches sauvegardees associes a votre compte.",
          ],
        },
        {
          titre: "2. Utilisation des donnees",
          paragraphes: [
            "Vos donnees servent a faire fonctionner la mise en relation entre producteurs et acheteurs: affichage du catalogue, gestion des commandes, notifications, et calcul de la note moyenne des producteurs.",
            "Votre numero de telephone est utilise pour l'authentification et l'envoi du code de verification (OTP) lors de l'inscription.",
          ],
        },
        {
          titre: "3. Partage des donnees",
          paragraphes: [
            "Les informations publiques de votre profil (nom, ville, region, note moyenne) sont visibles par les autres utilisateurs de la plateforme dans le cadre normal des echanges commerciaux.",
            "Nous ne vendons pas vos donnees personnelles a des tiers.",
          ],
        },
        {
          titre: "4. Vos droits",
          paragraphes: [
            "Vous pouvez consulter et modifier votre profil, desactiver votre compte, ou demander la suppression de vos donnees depuis les parametres de votre compte.",
          ],
        },
      ]}
    />
  );
}
