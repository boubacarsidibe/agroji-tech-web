import Link from "next/link";
import WeaveDivider from "@/components/WeaveDivider";

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
      <h4 className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold uppercase tracking-[0.14em] text-[#d69a2d]">
        {title}
      </h4>
      <ul className="flex flex-col items-start gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="font-[family-name:var(--font-work-sans)] text-sm text-[#cbbfa8] hover:text-[#f2e8d5]"
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
    <footer className="flex flex-col">
      <WeaveDivider color="#241c15" background="#f2e8d5" />
      <div className="bg-[#241c15]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-12 px-6 py-12 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-start gap-4">
            <p className="font-[family-name:var(--font-hanken-grotesk)] text-2xl font-bold leading-8 text-[#f2e8d5]">
              AgroJi-Tech
            </p>
            <p className="max-w-[320px] font-[family-name:var(--font-work-sans)] text-sm leading-5 text-[#cbbfa8]">
              La plateforme qui connecte les pepinieristes et les acheteurs de
              plants au Senegal.
            </p>
          </div>

          <div className="flex flex-col items-start gap-12 sm:flex-row sm:gap-16">
            <FooterColumn title="Plateforme" links={platformLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div className="flex items-end">
            <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
              © 2026 AgroJi-Tech Senegal. Tous droits reserves.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
