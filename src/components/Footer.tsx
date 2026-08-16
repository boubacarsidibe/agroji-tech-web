const platformLinks = [
  { label: "Agricultural Advice", href: "#" },
  { label: "Contact Us", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Legal Mentions", href: "#" },
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
            <a
              href={link.href}
              className="font-mono text-xs font-medium leading-4 text-[#d5d8f9] hover:text-[#b1f0ce]"
            >
              {link.label}
            </a>
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
            Cultivating Digital Empowerment across Senegal&apos;s agricultural
            landscape.
          </p>
        </div>

        <div className="flex flex-col items-start gap-12 sm:flex-row sm:gap-16">
          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="flex items-end">
          <p className="font-mono text-sm font-medium leading-5 text-[#d5d8f9]">
            © 2024 AgroJi-Tech Senegal. Cultivating Digital Empowerment.
          </p>
        </div>
      </div>
    </footer>
  );
}
