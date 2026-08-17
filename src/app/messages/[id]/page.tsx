"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  listConversations,
  listMessages,
  envoyerMessage,
  marquerConversationLue,
  ApiError,
  type ChatMessage,
  type ConversationResume,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";

const POLL_INTERVAL_MS = 5_000;

function titre(conversation: ConversationResume | null, monId: string): string {
  if (!conversation) return "Conversation";
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

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);

  const [conversation, setConversation] = useState<ConversationResume | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session === null) router.push("/login");
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    listConversations(session.token)
      .then((result) => setConversation(result.find((c) => c.id === params.id) ?? null))
      .catch(() => {});
  }, [session, params.id]);

  useEffect(() => {
    if (!session) return;
    const token = session.token;
    let cancelled = false;

    function load() {
      listMessages(token, params.id)
        .then((result) => {
          if (cancelled) return;
          setMessages(result);
          setError(null);
          marquerConversationLue(token, params.id).catch(() => {});
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof ApiError ? err.message : "Impossible de charger la conversation.");
          }
        })
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
  }, [session, params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!session || !contenu.trim()) return;

    setSending(true);
    setError(null);
    try {
      const message = await envoyerMessage(session.token, params.id, contenu.trim());
      setMessages((prev) => [...prev, message]);
      setContenu("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

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
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[720px] flex-col px-6 py-6">
      <div className="flex items-center gap-3 border-b border-[#dfe3e0] pb-4">
        <Link
          href="/messages"
          aria-label="Retour aux messages"
          className="flex size-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#171c19" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-sans text-lg font-semibold text-[#171c19]">
          {titre(conversation, session.utilisateur.id)}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-2/3 animate-pulse rounded-xl bg-[#eef3ef]" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
            Aucun message. Ecrivez le premier !
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((message) => {
              const estMoi = message.auteur.id === session.utilisateur.id;
              return (
                <div key={message.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm ${
                      estMoi ? "bg-[#0f5238] text-white" : "bg-[#eef3ef] text-[#171c19]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.contenu}</p>
                    <span
                      className={`mt-1 block text-right text-[10px] ${estMoi ? "text-white/70" : "text-[#7c8a80]"}`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <p className="mb-2 rounded-lg bg-[#fdecea] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#dfe3e0] pt-4">
        <input
          type="text"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Ecrire un message..."
          className="flex-1 rounded-full border border-[#bfc9c1] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#171c19] outline-none focus:border-[#0f5238]"
        />
        <button
          type="submit"
          disabled={sending || !contenu.trim()}
          className="rounded-full bg-[#0f5238] px-5 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#0c4029] disabled:opacity-60"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
