import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Catalog", href: "/catalog" },
  { label: "Producers", href: "/producers" },
  { label: "Orders", href: "/orders" },
  { label: "Support", href: "/support" },
];

export default function Header() {
  return (
    <header className="flex items-center justify-center border-b border-[#bfc9c1] bg-[#fbf8ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 w-full max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="whitespace-nowrap font-sans text-2xl font-semibold tracking-[-0.6px] text-[#0f5238]"
          >
            AgroJi-Tech
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap px-2 py-1 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:text-[#0f5238]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Cart"
              className="flex size-10 items-center justify-center rounded-full hover:bg-black/5"
            >
              <Image src="/icons/cart.svg" alt="" width={20} height={20} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-10 items-center justify-center rounded-full hover:bg-black/5"
            >
              <Image src="/icons/bell.svg" alt="" width={16} height={20} />
            </button>
          </div>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-full bg-[#0f5238] px-6 py-2 font-mono text-xs font-medium text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#0c4029]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
