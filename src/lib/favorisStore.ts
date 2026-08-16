import { useEffect, useSyncExternalStore } from "react";
import { addFavori, listFavoris, removeFavori, type Annonce } from "@/lib/api";
import type { Session } from "@/lib/auth";

type Store = { token: string | null; favoris: Annonce[]; loading: boolean };

let store: Store = { token: null, favoris: [], loading: false };
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
  return { token: null, favoris: [], loading: false };
}

export function ensureFavorisLoaded(session: Session | null) {
  if (!session || store.token === session.token) return;

  store = { token: session.token, favoris: [], loading: true };
  emit();

  listFavoris(session.token)
    .then((favoris) => {
      store = { token: session.token, favoris, loading: false };
      emit();
    })
    .catch(() => {
      store = { token: session.token, favoris: [], loading: false };
      emit();
    });
}

export function invalidateFavoris() {
  store = { token: null, favoris: [], loading: false };
  emit();
}

export async function toggleFavori(session: Session, annonce: Annonce) {
  const isFavori = store.favoris.some((a) => a.id === annonce.id);

  if (isFavori) {
    store = { ...store, favoris: store.favoris.filter((a) => a.id !== annonce.id) };
    emit();
    await removeFavori(session.token, annonce.id);
  } else {
    store = { ...store, favoris: [annonce, ...store.favoris] };
    emit();
    await addFavori(session.token, annonce.id);
  }
}

export function useFavoris(session: Session | null): {
  favoris: Annonce[];
  loading: boolean;
  isFavori: (annonceId: string) => boolean;
} {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureFavorisLoaded(session);
  }, [session]);

  if (!session || snapshot.token !== session.token) {
    return { favoris: [], loading: Boolean(session), isFavori: () => false };
  }
  return {
    favoris: snapshot.favoris,
    loading: snapshot.loading,
    isFavori: (annonceId: string) => snapshot.favoris.some((a) => a.id === annonceId),
  };
}
