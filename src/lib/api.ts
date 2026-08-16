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
