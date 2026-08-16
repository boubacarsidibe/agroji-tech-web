import Link from "next/link";

const channels = [
  {
    label: "Telephone",
    value: "+221 77 000 00 00",
    detail: "Du lundi au vendredi, 9h - 18h",
  },
  {
    label: "Email",
    value: "contact@agroji-tech.sn",
    detail: "Reponse sous 48h ouvrees",
  },
  {
    label: "Adresse",
    value: "Dakar, Senegal",
    detail: "Equipe repartie sur l'ensemble du territoire",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Contactez-nous</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Une question sur une commande, un compte producteur ou la plateforme ? Notre equipe
          vous repond.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.label}
            className="flex flex-col gap-1 rounded-xl border border-[#dfe3e0] bg-white p-4"
          >
            <span className="font-mono text-xs font-medium text-[#0f5238]">{channel.label}</span>
            <span className="font-sans text-base font-semibold text-[#171c19]">
              {channel.value}
            </span>
            <span className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
              {channel.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[#dfe3e0] bg-white p-5">
        <h2 className="font-sans text-lg font-semibold text-[#171c19]">
          Un probleme avec une annonce ou une commande ?
        </h2>
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
          Utilisez le bouton &laquo;Signaler&raquo; directement sur l&apos;annonce concernee dans
          le{" "}
          <Link href="/catalog" className="font-medium text-[#0f5238] hover:underline">
            catalogue
          </Link>
          , ou consultez le{" "}
          <Link href="/support" className="font-medium text-[#0f5238] hover:underline">
            centre d&apos;aide
          </Link>{" "}
          pour les questions courantes.
        </p>
      </div>
    </div>
  );
}
