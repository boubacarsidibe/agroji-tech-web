import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creer un compte",
  description: "Creez votre compte AgroJi-Tech pour commander des plants aupres des pepinieristes du Senegal.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
