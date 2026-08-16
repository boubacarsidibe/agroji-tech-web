import Link from "next/link";

const faqs = [
  {
    question: "Comment commander des plants ?",
    answer:
      "Parcourez le catalogue, ouvrez la fiche du plant qui vous interesse et cliquez sur «Commander». Le producteur recoit votre demande et peut l'accepter ou la refuser.",
  },
  {
    question: "Comment devenir producteur sur AgroJi-Tech ?",
    answer:
      "Inscrivez-vous depuis la page «Devenir producteur» avec votre telephone. Un code de verification par SMS vous est envoye pour activer votre compte, puis vous pouvez publier vos annonces depuis votre tableau de bord.",
  },
  {
    question: "Je n'ai pas recu mon code de verification, que faire ?",
    answer:
      "Verifiez que le numero saisi est correct. Le code reste valable quelques minutes; vous pouvez retenter l'inscription pour en recevoir un nouveau.",
  },
  {
    question: "Comment suivre l'etat de ma commande ?",
    answer:
      "Rendez-vous sur la page «Orders» depuis le menu: vous y retrouvez toutes vos demandes et leur statut (envoyee, acceptee, refusee, finalisee).",
  },
  {
    question: "Comment signaler une annonce suspecte ?",
    answer:
      "Sur la fiche de l'annonce dans le catalogue, cliquez sur «Signaler» et decrivez le probleme. Notre equipe de moderation examine chaque signalement.",
  },
  {
    question: "Comment evaluer un producteur ?",
    answer:
      "Une fois une commande marquee «Finalisee», un bouton «Evaluer» apparait sur la page Orders pour noter votre experience.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#241a12]">Centre d&apos;aide</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#4a3f33]">
          Les reponses aux questions les plus frequentes sur AgroJi-Tech.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-[#e4d3ae] bg-white p-4 open:pb-5"
          >
            <summary className="cursor-pointer list-none font-sans text-base font-semibold text-[#241a12] marker:content-none">
              {faq.question}
            </summary>
            <p className="mt-2 font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[#e4d3ae] bg-white p-5">
        <h2 className="font-sans text-lg font-semibold text-[#241a12]">
          Vous ne trouvez pas de reponse ?
        </h2>
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33]">
          Notre equipe reste disponible sur la page{" "}
          <Link href="/contact" className="font-medium text-[#8f3f1c] hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
