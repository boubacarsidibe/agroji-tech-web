"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
  type TypeNotification,
} from "@/lib/api";
import type { Session } from "@/lib/auth";

const POLL_INTERVAL_MS = 30_000;

const typeLabels: Record<TypeNotification, string> = {
  NOUVELLE_DEMANDE: "Nouvelle demande",
  MISE_A_JOUR_COMMANDE: "Commande",
  MESSAGE: "Information",
  ALERTE_RECHERCHE: "Alerte recherche",
  NOUVEAU_MESSAGE: "Message",
};

const typeColors: Record<TypeNotification, string> = {
  NOUVELLE_DEMANDE: "bg-[#e3f3ea] text-[#0f5238]",
  MISE_A_JOUR_COMMANDE: "bg-[#e8f0fe] text-[#1d4ed8]",
  MESSAGE: "bg-[#eef3ef] text-[#404943]",
  ALERTE_RECHERCHE: "bg-[#fdf3e0] text-[#b45309]",
  NOUVEAU_MESSAGE: "bg-[#e3f3ea] text-[#0f5238]",
};

// Notifications don't yet carry a stored deep link, so route by type: the
// two commande-related types are always safe to send to /orders. MESSAGE
// covers several unrelated cases (annonce archived, verified, signalement
// traite) with no shared destination, so it stays non-navigable.
const typeDestination: Partial<Record<TypeNotification, string>> = {
  NOUVELLE_DEMANDE: "/orders",
  MISE_A_JOUR_COMMANDE: "/orders",
  ALERTE_RECHERCHE: "/catalog",
  NOUVEAU_MESSAGE: "/messages",
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell({ session }: { session: Session }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      listNotifications(session.token)
        .then((result) => {
          if (!cancelled) setNotifications(result);
        })
        .catch(() => {});
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session.token]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.lu).length;

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead(session.token);
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    } catch {
      // ignore
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.lu) {
      try {
        await markNotificationAsRead(session.token, notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, lu: true } : n))
        );
      } catch {
        // ignore
      }
    }

    const destination = typeDestination[notification.type];
    if (destination) {
      setOpen(false);
      router.push(destination);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-full hover:bg-white/10"
      >
        <Image src="/icons/bell.svg" alt="" width={16} height={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#c0392b] font-mono text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-10 flex max-h-[70vh] w-auto flex-col overflow-hidden rounded-xl border border-[#dfe3e0] bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80">
          <div className="flex items-center justify-between border-b border-[#dfe3e0] px-4 py-3">
            <span className="font-sans text-sm font-semibold text-[#171c19]">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="font-[family-name:var(--font-work-sans)] text-xs font-medium text-[#0f5238] hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center font-[family-name:var(--font-work-sans)] text-sm text-[#7c8a80]">
                Aucune notification.
              </p>
            ) : (
              notifications.map((notification) => {
                const clickable = Boolean(typeDestination[notification.type]);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full flex-col gap-1.5 border-b border-[#eef3ef] px-4 py-3 text-left last:border-b-0 hover:bg-[#eef3ef]/60 ${
                      notification.lu ? "" : "bg-[#e3f3ea]/50"
                    } ${clickable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${typeColors[notification.type]}`}
                      >
                        {typeLabels[notification.type]}
                      </span>
                      {!notification.lu && (
                        <span className="size-1.5 shrink-0 rounded-full bg-[#0f5238]" />
                      )}
                    </div>
                    <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#171c19]">
                      {notification.contenu}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
                        {timeAgo(notification.createdAt)}
                      </span>
                      {clickable && (
                        <span className="whitespace-nowrap font-[family-name:var(--font-work-sans)] text-xs font-medium text-[#0f5238]">
                          Voir →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
