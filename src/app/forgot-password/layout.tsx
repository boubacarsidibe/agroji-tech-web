import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublie",
  description: "Reinitialisez le mot de passe de votre compte AgroJi-Tech.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
