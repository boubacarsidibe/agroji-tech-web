const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Categorie = "FRUITIER" | "FORESTIER" | "MARAICHER" | "ORNEMENTAL";

export type Annonce = {
  id: string;
  espece: string;
  variete?: string | null;
  categorie: Categorie;
  quantite: number;
  prixUnitaire: number;
  photos: string[];
  ville?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  miseEnAvant: boolean;
  distanceKm?: number | null;
  producteur: {
    id: string;
    nom: string;
    ville?: string | null;
    region?: string | null;
    verifie: boolean;
    noteMoyenne: number | null;
  };
};

export type SearchAnnoncesParams = {
  q?: string;
  categorie?: Categorie;
  region?: string;
  producteurId?: string;
  prixMin?: number;
  prixMax?: number;
  latitude?: number;
  longitude?: number;
  rayonKm?: number;
  tri?: "pertinence" | "proximite" | "prixAsc" | "prixDesc";
  page?: number;
};

export type SearchAnnoncesResult = {
  total: number;
  page: number;
  limite: number;
  resultats: Annonce[];
};

export type Utilisateur = {
  id: string;
  nom: string;
  telephone: string;
  roles: ("PRODUCTEUR" | "ACHETEUR" | "ADMIN")[];
  verifie: boolean;
};

export type LoginResult = {
  token: string;
  utilisateur: Utilisateur;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function login(telephone: string, motDePasse: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telephone, motDePasse }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Connexion impossible", res.status);
  }

  return body as LoginResult;
}

export async function requestPasswordResetOtp(telephone: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telephone }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'envoyer le code", res.status);
  }
}

export async function resetPassword(data: {
  telephone: string;
  code: string;
  nouveauMotDePasse: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Reinitialisation impossible", res.status);
  }
}

export type RegisterInput = {
  nom: string;
  telephone: string;
  email?: string;
  motDePasse: string;
  roles: ("PRODUCTEUR" | "ACHETEUR")[];
  ville?: string;
  region?: string;
  description?: string;
};

export type RegisterResult = {
  message: string;
  utilisateur: Pick<Utilisateur, "id" | "nom" | "telephone"> & { email?: string | null; roles: Utilisateur["roles"] };
};

export async function register(data: RegisterInput): Promise<RegisterResult> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Inscription impossible", res.status);
  }

  return body as RegisterResult;
}

export async function verifyAccount(telephone: string, code: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telephone, code }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Verification impossible", res.status);
  }

  return body as LoginResult;
}

export type StatutCommande = "ENVOYEE" | "ACCEPTEE" | "REFUSEE" | "FINALISEE";

export type Commande = {
  id: string;
  annonceId: string;
  acheteurId: string;
  producteurId: string;
  quantiteDemandee: number;
  message?: string | null;
  statut: StatutCommande;
  createdAt: string;
  annonce: Pick<Annonce, "id" | "espece" | "variete" | "prixUnitaire" | "photos">;
  evaluation?: { id: string; note: number; commentaire?: string | null } | null;
};

export async function createCommande(
  token: string,
  data: { annonceId: string; quantiteDemandee: number; message?: string }
): Promise<Commande> {
  const res = await fetch(`${API_URL}/api/commandes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'envoyer la demande", res.status);
  }

  return body as Commande;
}

export async function listCommandes(
  token: string,
  role: "acheteur" | "producteur"
): Promise<Commande[]> {
  const res = await fetch(`${API_URL}/api/commandes?role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger les commandes", res.status);
  }

  return body as Commande[];
}

export async function updateCommandeStatut(
  token: string,
  id: string,
  statut: Exclude<StatutCommande, "ENVOYEE">
): Promise<Commande> {
  const res = await fetch(`${API_URL}/api/commandes/${id}/statut`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ statut }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }

  return body as Commande;
}

export type Evaluation = {
  id: string;
  commandeId: string;
  note: number;
  commentaire?: string | null;
};

export async function createEvaluation(
  token: string,
  data: { commandeId: string; note: number; commentaire?: string }
): Promise<Evaluation> {
  const res = await fetch(`${API_URL}/api/evaluations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'envoyer l'evaluation", res.status);
  }

  return body as Evaluation;
}

export async function createSignalement(
  token: string,
  data: { annonceId?: string; raison: string }
): Promise<void> {
  const res = await fetch(`${API_URL}/api/signalements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'envoyer le signalement", res.status);
  }
}

export type Producteur = {
  id: string;
  nom: string;
  photoUrl?: string | null;
  description?: string | null;
  ville?: string | null;
  region?: string | null;
  roles: Utilisateur["roles"];
  verifie: boolean;
  noteMoyenne: number;
  nombreAvis: number;
};

export type ListProducteursParams = {
  q?: string;
  region?: string;
  page?: number;
};

export type ListUtilisateursParams = ListProducteursParams & {
  role?: "PRODUCTEUR" | "ACHETEUR";
};

export type ListProducteursResult = {
  total: number;
  page: number;
  limite: number;
  resultats: Producteur[];
};

export async function listUtilisateurs(
  params: ListUtilisateursParams
): Promise<ListProducteursResult> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const res = await fetch(`${API_URL}/api/utilisateurs?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Echec du chargement des utilisateurs (${res.status})`);
  }

  return res.json();
}

export async function listProducteurs(
  params: ListProducteursParams
): Promise<ListProducteursResult> {
  return listUtilisateurs({ ...params, role: "PRODUCTEUR" });
}

export async function getUtilisateur(id: string): Promise<Producteur> {
  const res = await fetch(`${API_URL}/api/utilisateurs/${id}`, { cache: "no-store" });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Utilisateur introuvable", res.status);
  }

  return body as Producteur;
}

export type StatutAnnonce = "DISPONIBLE" | "RUPTURE" | "ARCHIVEE";

export type AnnonceInput = {
  espece: string;
  variete?: string;
  categorie: Categorie;
  quantite: number;
  prixUnitaire: number;
  ville?: string;
  region?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
};

export type MonAnnonce = Omit<Annonce, "producteur"> & { statut: StatutAnnonce };

export async function uploadPhoto(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'envoyer la photo", res.status);
  }

  return body.url as string;
}

export async function listMesAnnonces(token: string): Promise<MonAnnonce[]> {
  const res = await fetch(`${API_URL}/api/annonces/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger vos annonces", res.status);
  }

  return body as MonAnnonce[];
}

export async function createAnnonce(token: string, data: AnnonceInput): Promise<MonAnnonce> {
  const res = await fetch(`${API_URL}/api/annonces`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de creer l'annonce", res.status);
  }

  return body as MonAnnonce;
}

export async function updateAnnonce(
  token: string,
  id: string,
  data: Partial<AnnonceInput> & { statut?: StatutAnnonce; miseEnAvant?: boolean }
): Promise<MonAnnonce> {
  const res = await fetch(`${API_URL}/api/annonces/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }

  return body as MonAnnonce;
}

export async function deleteAnnonce(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/annonces/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Suppression impossible", res.status);
  }
}

export type Notification = {
  id: string;
  type: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
};

export async function listNotifications(token: string): Promise<Notification[]> {
  const res = await fetch(`${API_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger les notifications", res.status);
  }

  return body as Notification[];
}

export async function markNotificationAsRead(token: string, id: string): Promise<Notification> {
  const res = await fetch(`${API_URL}/api/notifications/${id}/lue`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }

  return body as Notification;
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/notifications/lues/toutes`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }
}

export type AdminDashboard = {
  utilisateurs: number;
  annoncesActives: number;
  transactions: number;
  signalementsOuverts: number;
};

export async function getAdminDashboard(token: string): Promise<AdminDashboard> {
  const res = await fetch(`${API_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger le tableau de bord", res.status);
  }

  return body as AdminDashboard;
}

export type StatutSignalement = "OUVERT" | "TRAITE" | "REJETE";

export type Signalement = {
  id: string;
  annonceId?: string | null;
  auteurId: string;
  raison: string;
  statut: StatutSignalement;
  createdAt: string;
  annonce?: Pick<Annonce, "id" | "espece" | "variete"> | null;
  auteur: { id: string; nom: string } | null;
};

export async function listSignalements(
  token: string,
  statut?: StatutSignalement
): Promise<Signalement[]> {
  const query = statut ? `?statut=${statut}` : "";
  const res = await fetch(`${API_URL}/api/admin/signalements${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger les signalements", res.status);
  }

  return body as Signalement[];
}

export async function traiterSignalement(
  token: string,
  id: string,
  statut: "TRAITE" | "REJETE"
): Promise<Signalement> {
  const res = await fetch(`${API_URL}/api/admin/signalements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ statut }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }

  return body as Signalement;
}

export type AnnonceAdmin = MonAnnonce & {
  producteur: { id: string; nom: string; telephone: string; ville?: string | null; region?: string | null };
};

export async function listToutesAnnonces(
  token: string,
  statut?: StatutAnnonce
): Promise<AnnonceAdmin[]> {
  const query = statut ? `?statut=${statut}` : "";
  const res = await fetch(`${API_URL}/api/admin/annonces${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger les annonces", res.status);
  }

  return body as AnnonceAdmin[];
}

export async function archiverAnnonceAdmin(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/annonces/${id}/archiver`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Archivage impossible", res.status);
  }
}

export async function suspendreUtilisateur(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/utilisateurs/${id}/suspendre`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Suspension impossible", res.status);
  }
}

export async function verifierUtilisateur(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/utilisateurs/${id}/verifier`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Verification impossible", res.status);
  }
}

export async function searchAnnonces(
  params: SearchAnnoncesParams
): Promise<SearchAnnoncesResult> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const res = await fetch(`${API_URL}/api/annonces/search?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Echec de la recherche d'annonces (${res.status})`);
  }

  return res.json();
}

export type AnnonceDetail = Annonce & {
  vues: number;
  statut: StatutAnnonce;
  producteur: Annonce["producteur"] & { photoUrl?: string | null; nombreAvis: number };
};

export async function getAnnonce(id: string): Promise<AnnonceDetail> {
  const res = await fetch(`${API_URL}/api/annonces/${id}`, { cache: "no-store" });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Annonce introuvable", res.status);
  }

  return body as AnnonceDetail;
}

export type EvaluationAvecAuteur = Evaluation & {
  createdAt: string;
  auteur: { id: string; nom: string };
};

export async function listEvaluationsPourUtilisateur(
  userId: string
): Promise<EvaluationAvecAuteur[]> {
  const res = await fetch(`${API_URL}/api/evaluations/utilisateur/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Echec du chargement des evaluations (${res.status})`);
  }

  return res.json();
}

export type RechercheSauvegardee = {
  id: string;
  nom: string;
  criteres: SearchAnnoncesParams;
  createdAt: string;
};

export async function listRecherches(token: string): Promise<RechercheSauvegardee[]> {
  const res = await fetch(`${API_URL}/api/recherches`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger vos recherches", res.status);
  }

  return body as RechercheSauvegardee[];
}

export async function createRecherche(
  token: string,
  data: { nom: string; criteres: SearchAnnoncesParams }
): Promise<RechercheSauvegardee> {
  const res = await fetch(`${API_URL}/api/recherches`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible d'enregistrer la recherche", res.status);
  }

  return body as RechercheSauvegardee;
}

export async function deleteRecherche(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/recherches/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Suppression impossible", res.status);
  }
}

export type MonProfil = Producteur & {
  telephone: string;
  email?: string | null;
};

export type UpdateProfilInput = {
  nom?: string;
  photoUrl?: string;
  description?: string;
  ville?: string;
  region?: string;
};

export async function getMonProfil(token: string): Promise<MonProfil> {
  const res = await fetch(`${API_URL}/api/utilisateurs/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Impossible de charger le profil", res.status);
  }

  return body as MonProfil;
}

export async function updateMonProfil(
  token: string,
  data: UpdateProfilInput
): Promise<MonProfil> {
  const res = await fetch(`${API_URL}/api/utilisateurs/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Mise a jour impossible", res.status);
  }

  return body as MonProfil;
}

export async function changerMotDePasse(
  token: string,
  data: { motDePasseActuel: string; nouveauMotDePasse: string }
): Promise<void> {
  const res = await fetch(`${API_URL}/api/utilisateurs/me/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Changement de mot de passe impossible", res.status);
  }
}

export async function deactivateMonCompte(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/utilisateurs/me/deactivate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Desactivation impossible", res.status);
  }
}

export async function deleteMonCompte(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/utilisateurs/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? "Suppression impossible", res.status);
  }
}
