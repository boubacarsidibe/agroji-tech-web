"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSession, subscribeToAuthChanges } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

const navLinks = [
  { label: "Catalogue", href: "/catalog" },
  { label: "Producteurs", href: "/producers" },
  { label: "Commandes", href: "/orders" },
  { label: "Support", href: "/support" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSyncExternalStore(
    subscribeToAuthChanges,
    getSession,
    () => null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isProducteur = session?.utilisateur.roles.includes("PRODUCTEUR") ?? false;
  const isAdmin = session?.utilisateur.roles.includes("ADMIN") ?? false;
  const initiale = session?.utilisateur.nom?.trim().charAt(0).toUpperCase() ?? "?";

  // Un administrateur n'a pas de compte marketplace : pas de catalogue, favoris,
  // messages ni commandes a afficher, uniquement l'acces au tableau de bord.
  const displayedNavLinks = isAdmin ? [] : navLinks;
  const accountLinks = !session
    ? []
    : isAdmin
      ? [{ label: "Administration", href: "/admin" }]
      : [
          { label: "Favoris", href: "/favorites" },
          { label: "Messages", href: "/messages" },
          ...(isProducteur ? [{ label: "Mes annonces", href: "/dashboard" }] : []),
        ];

  function handleLogout() {
    clearSession();
    setMenuOpen(false);
    setAccountOpen(false);
    router.push(isAdmin ? "/admin/login" : "/");
  }

  function handleNavClick() {
    setMenuOpen(false);
    setAccountOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b border-white/10 bg-[#232a4a]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={handleNavClick}
            className="whitespace-nowrap font-sans text-xl font-semibold tracking-[-0.6px] text-[#b1f0ce] sm:text-2xl"
          >
            AgroJi-Tech
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {displayedNavLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative whitespace-nowrap px-3 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium transition-colors ${
                    active ? "text-[#b1f0ce]" : "text-[#d5d8f9] hover:text-[#b1f0ce]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-[#b1f0ce]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {session && (
            <div className="hidden text-[#d5d8f9] sm:block">
              <NotificationBell session={session} />
            </div>
          )}

          <div className="hidden items-center gap-1 md:flex">
            {session ? (
              <>
                {accountLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`whitespace-nowrap px-3 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium transition-colors ${
                      isActive(pathname, link.href)
                        ? "text-[#b1f0ce]"
                        : "text-[#d5d8f9] hover:text-[#b1f0ce]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                    aria-label="Mon compte"
                    className="flex size-9 items-center justify-center rounded-full bg-[#b1f0ce] font-mono text-sm font-semibold text-[#002114] hover:bg-[#9de3bc]"
                  >
                    {initiale}
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-11 z-10 flex w-48 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#2b3252] py-1 shadow-lg">
                      <span className="truncate px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-white">
                        {session.utilisateur.nom}
                      </span>
                      <Link
                        href="/account"
                        onClick={handleNavClick}
                        className="px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#d5d8f9] hover:bg-white/5 hover:text-[#b1f0ce]"
                      >
                        Mon compte
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 text-left font-[family-name:var(--font-work-sans)] text-sm text-[#d5d8f9] hover:bg-white/5 hover:text-[#b1f0ce]"
                      >
                        Se deconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="whitespace-nowrap px-3 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#d5d8f9] hover:text-[#b1f0ce]"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full bg-[#b1f0ce] px-6 py-2 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-[#002114] hover:bg-[#9de3bc]"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {session && (
            <div className="text-[#d5d8f9] sm:hidden">
              <NotificationBell session={session} />
            </div>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full text-[#d5d8f9] hover:bg-white/10 md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
          {displayedNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleNavClick}
              className={`rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base ${
                isActive(pathname, link.href)
                  ? "bg-white/5 text-[#b1f0ce]"
                  : "text-[#d5d8f9] hover:bg-white/5 hover:text-[#b1f0ce]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <>
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`rounded-lg px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-base ${
                    isActive(pathname, link.href)
                      ? "bg-white/5 text-[#b1f0ce]"
                      : "text-[#d5d8f9] hover:bg-white/5 hover:text-[#b1f0ce]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-white/10 px-3 pt-3">
                <Link
                  href="/account"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 font-[family-name:var(--font-work-sans)] text-sm text-[#d5d8f9] hover:text-[#b1f0ce]"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#b1f0ce] font-mono text-xs font-semibold text-[#002114]">
                    {initiale}
                  </span>
                  {session.utilisateur.nom}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whitespace-nowrap rounded-full border border-[#b1f0ce] px-5 py-1.5 font-mono text-xs font-medium text-[#b1f0ce] hover:bg-white/5"
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
                className="rounded-lg border border-[#b1f0ce] px-3 py-2.5 text-center font-mono text-sm font-medium text-[#b1f0ce] hover:bg-white/5"
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/login"
                onClick={handleNavClick}
                className="rounded-lg bg-[#b1f0ce] px-3 py-2.5 text-center font-mono text-sm font-semibold text-[#002114] hover:bg-[#9de3bc]"
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
