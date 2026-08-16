import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden py-[75px]">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-nursery.png"
          alt="AgroJi-Tech plant nursery in Senegal"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(43,47,72,0.9)] via-[rgba(43,47,72,0.7)] via-50% to-[rgba(43,47,72,0)]" />
      </div>

      <div className="relative flex w-full max-w-[1280px] flex-col items-start px-6 py-16 sm:px-10 md:px-16 md:py-24">
        <div className="flex max-w-[672px] flex-col items-start gap-6">
          <span className="rounded-full border border-[rgba(15,82,56,0.2)] bg-[#2d6a4f] px-[17px] py-[7px] font-mono text-xs font-medium text-[#a8e7c5] backdrop-blur-[2px]">
            L&apos;agriculture senegalaise, connectee
          </span>

          <h1 className="font-sans text-3xl font-bold leading-tight tracking-[-0.8px] text-white drop-shadow-[0px_2px_1px_rgba(0,0,0,0.06),0px_4px_1.5px_rgba(0,0,0,0.07)] sm:text-4xl">
            Connectez-vous aux meilleures pépinières du Sénégal.
          </h1>

          <p className="max-w-[576px] font-[family-name:var(--font-work-sans)] text-base leading-7 text-[#d5d8f9] sm:text-lg">
            AgroJi-Tech relie les pepinieristes traditionnels senegalais aux
            besoins agricoles modernes. Trouvez des plants de qualite
            directement aupres de producteurs certifies.
          </p>

          <div className="flex w-full flex-col items-stretch gap-3 pt-4 sm:w-auto sm:flex-row sm:items-start sm:gap-4">
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#b1f0ce] px-8 py-[18px] font-[family-name:var(--font-work-sans)] text-base font-semibold text-[#002114] drop-shadow-[0px_4px_6px_rgba(45,106,79,0.15)] hover:bg-[#9de3bc]"
            >
              Explorer le catalogue
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={14}
                height={14}
              />
            </Link>
            <Link
              href="/producers/register"
              className="flex items-center justify-center rounded-lg border-2 border-[#b1f0ce] px-[34px] py-[18px] font-[family-name:var(--font-work-sans)] text-base font-semibold text-[#b1f0ce] hover:bg-white/5"
            >
              Devenir producteur
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
