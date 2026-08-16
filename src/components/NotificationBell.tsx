"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/lib/api";
import type { Session } from "@/lib/auth";

const POLL_INTERVAL_MS = 30_000;

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationBell({ session }: { session: Session }) {
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
    if (notification.lu) return;
    try {
      await markNotificationAsRead(session.token, notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, lu: true } : n))
      );
    } catch {
      // ignore
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-full hover:bg-black/5"
      >
        <Image src="/icons/bell.svg" alt="" width={16} height={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#c0392b] font-mono text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-10 flex w-80 flex-col overflow-hidden rounded-xl border border-[#dfe3e0] bg-white shadow-lg">
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
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full flex-col gap-1 border-b border-[#eef3ef] px-4 py-3 text-left last:border-b-0 hover:bg-[#eef3ef]/60 ${
                    notification.lu ? "" : "bg-[#e3f3ea]/50"
                  }`}
                >
                  <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#171c19]">
                    {notification.contenu}
                  </p>
                  <span className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
                    {timeAgo(notification.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
