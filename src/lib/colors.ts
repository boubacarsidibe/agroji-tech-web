import type { Categorie } from "@/lib/api";

export const categorieColors: Record<
  Categorie,
  { bg: string; text: string; ring: string; bar: string }
> = {
  FRUITIER: { bg: "bg-[#fdece0]", text: "text-[#b45309]", ring: "border-[#f3c894]", bar: "bg-[#e8973f]" },
  FORESTIER: { bg: "bg-[#e6ecdd]", text: "text-[#1b4332]", ring: "border-[#a8d5bc]", bar: "bg-[#2d6a4f]" },
  MARAICHER: { bg: "bg-[#f0f5df]", text: "text-[#5c7a1e]", ring: "border-[#cddc9b]", bar: "bg-[#8aa844]" },
  ORNEMENTAL: { bg: "bg-[#fbe8f3]", text: "text-[#a3327a]", ring: "border-[#f0b8db]", bar: "bg-[#c65a9c]" },
};
