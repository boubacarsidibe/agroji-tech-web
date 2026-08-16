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
  miseEnAvant: boolean;
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
  prixMin?: number;
  prixMax?: number;
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

export type ListProducteursResult = {
  total: number;
  page: number;
  limite: number;
  resultats: Producteur[];
};

export async function listProducteurs(
  params: ListProducteursParams
): Promise<ListProducteursResult> {
  const query = new URLSearchParams({ role: "PRODUCTEUR" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const res = await fetch(`${API_URL}/api/utilisateurs?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Echec du chargement des producteurs (${res.status})`);
  }

  return res.json();
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
