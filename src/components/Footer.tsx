import Link from "next/link";

const platformLinks = [
  { label: "Conseils agricoles", href: "/agricultural-advice" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Confidentialite", href: "/privacy-policy" },
  { label: "Conditions d'utilisation", href: "/terms-of-service" },
  { label: "Mentions legales", href: "/legal-mentions" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h4 className="font-mono text-xs font-medium leading-4 text-[#b1f0ce]">
        {title}
      </h4>
      <ul className="flex flex-col items-start gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="font-mono text-xs font-medium leading-4 text-[#d5d8f9] hover:text-[#b1f0ce]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#2b3252]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-12 px-6 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-start gap-4">
          <p className="font-sans text-2xl font-semibold leading-8 text-[#b1f0ce]">
            AgroJi-Tech
          </p>
          <p className="max-w-[320px] font-mono text-xs font-medium leading-4 text-[#d5d8f9]">
            La plateforme qui connecte les pepinieristes et les acheteurs de
            plants au Senegal.
          </p>
        </div>

        <div className="flex flex-col items-start gap-12 sm:flex-row sm:gap-16">
          <FooterColumn title="Plateforme" links={platformLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="flex items-end">
          <p className="font-mono text-sm font-medium leading-5 text-[#d5d8f9]">
            © 2026 AgroJi-Tech Senegal. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
