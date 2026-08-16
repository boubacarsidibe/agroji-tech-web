const articles = [
  {
    categorie: "Fruitier",
    titre: "Reussir la plantation d'un manguier",
    contenu:
      "Choisissez un sol bien draine et une exposition ensoleillee. Espacez les plants de 8 a 10 metres et arrosez regulierement la premiere annee, le temps que le systeme racinaire s'etablisse. Les greffes precoces (Kent, Keitt) sont bien adaptees au climat senegalais.",
  },
  {
    categorie: "Maraicher",
    titre: "Optimiser l'arrosage en saison seche",
    contenu:
      "Privilegiez l'arrosage tot le matin ou en fin de journee pour limiter l'evaporation. Le paillage autour des plants reduit les besoins en eau et limite la proliferation des mauvaises herbes.",
  },
  {
    categorie: "Forestier",
    titre: "Choisir des especes locales pour le reboisement",
    contenu:
      "Le baobab, le neem et le rônier sont bien adaptes aux sols sahéliens et demandent peu d'entretien une fois etablis. Privilegiez une plantation en debut de saison des pluies pour maximiser la reprise.",
  },
  {
    categorie: "Ornemental",
    titre: "Entretenir des plants ornementaux en pot",
    contenu:
      "Utilisez un substrat drainant et rempotez tous les 12 a 18 mois. Surveillez les signes de stress hydrique (feuilles jaunes ou fletries) et adaptez la frequence d'arrosage selon la saison.",
  },
  {
    categorie: "General",
    titre: "Reconnaitre un plant sain avant l'achat",
    contenu:
      "Verifiez l'absence de taches sur les feuilles, la fermete du collet et un systeme racinaire bien developpe sans racines circulaires. N'hesitez pas a consulter les avis et la note du producteur sur AgroJi-Tech.",
  },
];

const categorieColors: Record<string, string> = {
  Fruitier: "bg-[#e3f3ea] text-[#0f5238]",
  Maraicher: "bg-[#eef3ef] text-[#0f5238]",
  Forestier: "bg-[#f3ede3] text-[#6b4e0f]",
  Ornemental: "bg-[#f3e3ee] text-[#6b0f4e]",
  General: "bg-[#eef0f3] text-[#2b3252]",
};

export default function AgriculturalAdvicePage() {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#171c19]">Conseils agricoles</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#404943]">
          Quelques recommandations pratiques pour choisir, planter et entretenir vos plants au
          Senegal.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <article
            key={article.titre}
            className="flex flex-col gap-2 rounded-xl border border-[#dfe3e0] bg-white p-5"
          >
            <span
              className={`w-fit rounded-full px-3 py-1 font-mono text-xs font-medium ${categorieColors[article.categorie]}`}
            >
              {article.categorie}
            </span>
            <h2 className="font-sans text-lg font-semibold text-[#171c19]">{article.titre}</h2>
            <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#404943]">
              {article.contenu}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
