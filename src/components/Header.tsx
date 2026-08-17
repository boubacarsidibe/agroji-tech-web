"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession, subscribeToAuthChanges } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

const navLinks = [
  { label: "Catalogue", href: "/catalog" },
  { label: "Producteurs", href: "/producers" },
  { label: "Commandes", href: "/orders" },
  { label: "Support", href: "/support" },
];

export default function Header() {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToAuthChanges,
    getSession,
    () => null
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const isProducteur = session?.utilisateur.roles.includes("PRODUCTEUR") ?? false;
  const isAdmin = session?.utilisateur.roles.includes("ADMIN") ?? false;

  function handleLogout() {
    clearSession();
    setMenuOpen(false);
    router.push("/");
  }

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <header className="flex flex-col border-b border-[#bfc9c1] bg-[#fbf8ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="whitespace-nowrap font-sans text-xl font-semibold tracking-[-0.6px] text-[#0f5238] sm:text-2xl"
          >
            AgroJi-Tech
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
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

        <div className="flex items-center gap-2 sm:gap-4">
          {session && (
            <div className="hidden items-center gap-1 sm:flex">
              <NotificationBell session={session} />
            </div>
          )}

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/favorites"
                  className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                >
                  Favoris
                </Link>
                <Link
                  href="/messages"
                  className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                >
                  Messages
                </Link>
                {isProducteur && (
                  <Link
                    href="/dashboard"
                    className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                  >
                    Mes annonces
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                >
                  {session.utilisateur.nom}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whitespace-nowrap rounded-full border border-[#0f5238] px-6 py-2 font-mono text-xs font-medium text-[#0f5238] hover:bg-[#0f5238]/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full bg-[#0f5238] px-6 py-2 font-mono text-xs font-medium text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#0c4029]"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {session && (
            <div className="sm:hidden">
              <NotificationBell session={session} />
            </div>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#171c19" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#171c19" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-[#bfc9c1] px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleNavClick}
              className="rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <>
              <Link
                href="/favorites"
                onClick={handleNavClick}
                className="rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:bg-black/5"
              >
                Favoris
              </Link>
              <Link
                href="/messages"
                onClick={handleNavClick}
                className="rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:bg-black/5"
              >
                Messages
              </Link>
              {isProducteur && (
                <Link
                  href="/dashboard"
                  onClick={handleNavClick}
                  className="rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:bg-black/5"
                >
                  Mes annonces
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={handleNavClick}
                  className="rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base text-[#404943] hover:bg-black/5"
                >
                  Admin
                </Link>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-[#eef3ef] px-3 pt-3">
                <Link
                  href="/account"
                  onClick={handleNavClick}
                  className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943] hover:text-[#0f5238]"
                >
                  {session.utilisateur.nom}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whitespace-nowrap rounded-full border border-[#0f5238] px-5 py-1.5 font-mono text-xs font-medium text-[#0f5238] hover:bg-[#0f5238]/5"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/register"
                onClick={handleNavClick}
                className="rounded-lg border border-[#0f5238] px-3 py-2.5 text-center font-mono text-sm font-medium text-[#0f5238] hover:bg-[#0f5238]/5"
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/login"
                onClick={handleNavClick}
                className="rounded-lg bg-[#0f5238] px-3 py-2.5 text-center font-mono text-sm font-medium text-white hover:bg-[#0c4029]"
              >
                Login
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
