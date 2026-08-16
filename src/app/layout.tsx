import type { Metadata } from "next";
import { Fraunces, Archivo, Work_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

const archivo = Archivo({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroJi-Tech",
  description:
    "La plateforme qui connecte les pepinieristes et les acheteurs de plants au Senegal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${archivo.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
