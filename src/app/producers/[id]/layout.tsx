import type { Metadata } from "next";
import { getUtilisateur } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const producteur = await getUtilisateur(id);
    const lieu = [producteur.ville, producteur.region].filter(Boolean).join(", ");
    const description =
      producteur.description ||
      `${producteur.nom} est pepinieriste sur AgroJi-Tech${lieu ? ` a ${lieu}` : ""}. Consultez ses annonces de plants.`;

    return {
      title: producteur.nom,
      description,
      alternates: { canonical: `/producers/${id}` },
      openGraph: {
        type: "profile",
        title: `${producteur.nom} · ${SITE_NAME}`,
        description,
        url: `${SITE_URL}/producers/${id}`,
        images: producteur.photoUrl ? [{ url: producteur.photoUrl }] : undefined,
      },
    };
  } catch {
    return {
      title: "Producteur",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ProducerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const producteur = await getUtilisateur(id);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: producteur.nom,
      description: producteur.description || undefined,
      address: producteur.region
        ? { "@type": "PostalAddress", addressRegion: producteur.region, addressCountry: "SN" }
        : undefined,
      url: `${SITE_URL}/producers/${id}`,
      ...(producteur.nombreAvis > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: producteur.noteMoyenne,
              reviewCount: producteur.nombreAvis,
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
          // eslint-disable-next-line react/no-danger -- server-fetched producer data, not user-controlled HTML
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
