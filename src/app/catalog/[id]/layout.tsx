import type { Metadata } from "next";
import { getAnnonce } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const categorieLabels: Record<string, string> = {
  FRUITIER: "Fruitier",
  FORESTIER: "Forestier",
  MARAICHER: "Maraicher",
  ORNEMENTAL: "Ornemental",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const annonce = await getAnnonce(id);
    const nom = `${annonce.espece}${annonce.variete ? ` ${annonce.variete}` : ""}`;
    const lieu = [annonce.ville, annonce.region].filter(Boolean).join(", ");
    const description = `${nom} (${categorieLabels[annonce.categorie] ?? annonce.categorie}) a ${
      annonce.prixUnitaire
    } FCFA, propose par ${annonce.producteur.nom}${lieu ? ` a ${lieu}` : ""} sur AgroJi-Tech.`;
    const image = annonce.photos[0];

    return {
      title: nom,
      description,
      alternates: { canonical: `/catalog/${id}` },
      openGraph: {
        type: "website",
        title: `${nom} · ${SITE_NAME}`,
        description,
        url: `${SITE_URL}/catalog/${id}`,
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: nom,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Annonce",
      robots: { index: false, follow: true },
    };
  }
}

export default async function AnnonceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const annonce = await getAnnonce(id);
    const nom = `${annonce.espece}${annonce.variete ? ` ${annonce.variete}` : ""}`;
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: nom,
      category: categorieLabels[annonce.categorie] ?? annonce.categorie,
      image: annonce.photos,
      description: `${nom}, propose par ${annonce.producteur.nom} sur AgroJi-Tech.`,
      offers: {
        "@type": "Offer",
        priceCurrency: "XOF",
        price: annonce.prixUnitaire,
        availability:
          annonce.statut === "DISPONIBLE"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `${SITE_URL}/catalog/${id}`,
        seller: { "@type": "Organization", name: annonce.producteur.nom },
      },
      ...(annonce.producteur.noteMoyenne
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: annonce.producteur.noteMoyenne,
              reviewCount: annonce.producteur.nombreAvis || 1,
            },
          }
        : {}),
    };
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- server-fetched product data, not user-controlled HTML
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
