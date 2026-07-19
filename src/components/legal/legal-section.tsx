export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 md:py-10">
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand">
        {title}
      </h2>
      <div className="mt-3 max-w-2xl space-y-4 text-sm leading-relaxed text-brand/80">
        {children}
      </div>
    </section>
  );
}
