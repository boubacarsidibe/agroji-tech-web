export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <h1 className="font-sans text-2xl font-semibold text-[#2b3252]">
        {title}
      </h1>
    </div>
  );
}
