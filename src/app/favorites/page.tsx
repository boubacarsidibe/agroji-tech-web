"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnnonceCard from "@/components/AnnonceCard";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";
import { useFavoris } from "@/lib/favorisStore";

export default function FavoritesPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const { favoris, loading } = useFavoris(session);

  useEffect(() => {
    if (session === null) router.push("/login");
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Mes favoris</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Les plants que vous avez mis de cote.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-xl bg-[#eef3ef]" />
          ))}
        </div>
      ) : favoris.length === 0 ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Vous n&apos;avez pas encore de favoris.{" "}
          <Link href="/catalog" className="font-medium text-[#0f5238] hover:underline">
            Parcourir le catalogue
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoris.map((annonce) => (
            <AnnonceCard key={annonce.id} annonce={annonce} />
          ))}
        </div>
      )}
    </div>
  );
}
