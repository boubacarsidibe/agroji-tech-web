import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Work_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Plants et pepinieres au Senegal`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "pepiniere Senegal",
    "plants Senegal",
    "achat plants en ligne",
    "manguier",
    "baobab",
    "pepinieriste",
    "maraichage Senegal",
    "AgroJi-Tech",
  ],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Plants et pepinieres au Senegal`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/hero-nursery.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Plants et pepinieres au Senegal`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-nursery.png"],
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  areaServed: { "@type": "Country", name: "Senegal" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- static, non-user-controlled JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
