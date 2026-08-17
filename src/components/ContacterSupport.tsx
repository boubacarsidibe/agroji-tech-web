"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ouvrirConversationSupport, ApiError } from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

export default function ContacterSupport() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const conversation = await ouvrirConversationSupport(session.token);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ouvrir la conversation.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-fit rounded-lg bg-[#0f5238] px-5 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
      >
        {loading ? "Ouverture..." : "Discuter avec le support"}
      </button>
      {error && (
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">{error}</p>
      )}
      {!session && (
        <p className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
          <Link href="/login" className="font-medium text-[#0f5238] hover:underline">
            Connectez-vous
          </Link>{" "}
          pour discuter directement avec notre equipe.
        </p>
      )}
    </div>
  );
}
