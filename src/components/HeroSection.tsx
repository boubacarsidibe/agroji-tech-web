import Image from "next/image";
import Link from "next/link";
import WeaveDivider from "@/components/WeaveDivider";

export default function HeroSection() {
  return (
    <section className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-start justify-center gap-6 bg-[#241c15] px-6 py-16 sm:px-10 md:px-16 md:py-24">
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold uppercase tracking-[0.16em] text-[#d69a2d]">
            Marche des pepinieristes — Senegal
          </span>

          <h1 className="max-w-[520px] font-[family-name:var(--font-hanken-grotesk)] text-4xl font-bold leading-[1.05] text-[#f2e8d5] sm:text-5xl">
            De la terre du Sénégal
            <br />
            <span className="text-[#d69a2d]">jusqu&apos;à vous.</span>
          </h1>

          <p className="max-w-[460px] font-[family-name:var(--font-work-sans)] text-base leading-7 text-[#cbbfa8] sm:text-lg">
            AgroJi-Tech relie les pepinieristes traditionnels aux acheteurs
            d&apos;aujourd&apos;hui. Manguiers, baobabs, plants maraichers et
            ornementaux, choisis directement chez le producteur.
          </p>

          <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 rounded-md bg-[#d69a2d] px-8 py-4 font-[family-name:var(--font-work-sans)] text-base font-semibold text-[#241c15] transition hover:bg-[#c58a24]"
            >
              Explorer le catalogue
              <Image src="/icons/arrow-right.svg" alt="" width={14} height={14} />
            </Link>
            <Link
              href="/producers/register"
              className="flex items-center justify-center rounded-md border border-[#6f5c42] px-8 py-4 font-[family-name:var(--font-work-sans)] text-base font-semibold text-[#f2e8d5] transition hover:border-[#d69a2d] hover:text-[#d69a2d]"
            >
              Devenir producteur
            </Link>
          </div>
        </div>

        <div className="relative min-h-[280px] md:min-h-0">
          <Image
            src="/images/hero-nursery.png"
            alt="Pepiniere de plants au Senegal"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      <WeaveDivider color="#241c15" background="#f2e8d5" />
    </section>
  );
}
