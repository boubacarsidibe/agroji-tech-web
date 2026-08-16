import { useEffect, useSyncExternalStore } from "react";
import { listCommandes, type Commande } from "@/lib/api";
import type { Session } from "@/lib/auth";

type Store = { token: string | null; commandes: Commande[]; loading: boolean };

let store: Store = { token: null, commandes: [], loading: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return store;
}

function getServerSnapshot(): Store {
  return { token: null, commandes: [], loading: false };
}

export function ensureMesCommandesLoaded(session: Session | null) {
  if (!session || store.token === session.token) return;

  store = { token: session.token, commandes: [], loading: true };
  emit();

  listCommandes(session.token, "acheteur")
    .then((commandes) => {
      store = { token: session.token, commandes, loading: false };
      emit();
    })
    .catch(() => {
      store = { token: session.token, commandes: [], loading: false };
      emit();
    });
}

export function invalidateMesCommandes() {
  store = { token: null, commandes: [], loading: false };
  emit();
}

export function useMesCommandesAcheteur(session: Session | null): {
  commandes: Commande[];
  loading: boolean;
} {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureMesCommandesLoaded(session);
  }, [session]);

  if (!session || snapshot.token !== session.token) {
    return { commandes: [], loading: Boolean(session) };
  }
  return { commandes: snapshot.commandes, loading: snapshot.loading };
}
