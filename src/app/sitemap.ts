import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/catalog", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/producers", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/producers/register", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/register", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/agricultural-advice", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/support", priority: 0.3, changeFrequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const res = await fetch(`${API_URL}/api/annonces/search?limite=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      for (const annonce of data.resultats ?? []) {
        entries.push({
          url: `${SITE_URL}/catalog/${annonce.id}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: annonce.miseEnAvant ? 0.8 : 0.6,
        });
      }
    }
  } catch {
    // La sitemap reste valide meme si l'API est indisponible au moment de la generation.
  }

  try {
    const res = await fetch(`${API_URL}/api/utilisateurs?role=PRODUCTEUR&page=1`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      for (const producteur of data.resultats ?? []) {
        entries.push({
          url: `${SITE_URL}/producers/${producteur.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // idem
  }

  return entries;
}
