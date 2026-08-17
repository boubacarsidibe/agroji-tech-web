"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listConversations, type ConversationResume } from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

const POLL_INTERVAL_MS = 15_000;

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function titre(conversation: ConversationResume, monId: string): string {
  if (conversation.type === "SUPPORT") {
    return conversation.utilisateur && conversation.utilisateur.id !== monId
      ? conversation.utilisateur.nom
      : "Support AgroJi-Tech";
  }

  if (conversation.type === "PRODUIT") {
    if (!conversation.annonce || !conversation.acheteur) return "Annonce";
    const autre =
      conversation.acheteur.id === monId ? conversation.annonce.producteur : conversation.acheteur;
    const { espece, variete } = conversation.annonce;
    return `${autre.nom} · ${espece}${variete ? ` (${variete})` : ""}`;
  }

  if (!conversation.commande) return "Commande";
  const autre =
    conversation.commande.acheteur.id === monId
      ? conversation.commande.producteur
      : conversation.commande.acheteur;
  const { espece, variete } = conversation.commande.annonce;
  return `${autre.nom} · ${espece}${variete ? ` (${variete})` : ""}`;
}

export default function MessagesPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const [conversations, setConversations] = useState<ConversationResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === null) router.push("/login");
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    const token = session.token;
    let cancelled = false;

    function load() {
      listConversations(token)
        .then((result) => {
          if (!cancelled) setConversations(result);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  const estAdmin = session.utilisateur.roles.includes("ADMIN");

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Messages</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          {estAdmin
            ? "Conversations de support avec les utilisateurs."
            : "Vos echanges avec les producteurs, acheteurs et le support."}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[#eef3ef]" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#7c8a80]">
          Aucune conversation pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#dfe3e0] bg-white p-4 hover:border-[#0f5238]"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-sans text-base font-semibold text-[#171c19]">
                  {titre(conversation, session.utilisateur.id)}
                </span>
                <span className="truncate font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                  {conversation.dernierMessage ? conversation.dernierMessage.contenu : "Aucun message."}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
                  {conversation.dernierMessage ? timeAgo(conversation.dernierMessage.createdAt) : ""}
                </span>
                {conversation.nonLus > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#c0392b] font-mono text-[10px] font-medium text-white">
                    {conversation.nonLus > 9 ? "9+" : conversation.nonLus}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
