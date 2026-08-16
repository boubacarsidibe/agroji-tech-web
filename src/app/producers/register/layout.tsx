import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir producteur",
  description:
    "Inscrivez-vous comme pepinieriste sur AgroJi-Tech et publiez vos annonces de plants aupres des acheteurs du Senegal.",
  alternates: { canonical: "/producers/register" },
};

export default function ProducersRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
