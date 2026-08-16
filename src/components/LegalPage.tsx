type Section = {
  titre: string;
  paragraphes: string[];
};

export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-bold text-[#241a12]">{title}</h1>
        <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
          Derniere mise a jour : {updated}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.titre} className="flex flex-col gap-2">
            <h2 className="font-sans text-lg font-semibold text-[#241a12]">{section.titre}</h2>
            {section.paragraphes.map((p, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-work-sans)] text-sm leading-6 text-[#4a3f33]"
              >
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
