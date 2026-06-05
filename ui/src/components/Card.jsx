function Card({ title, right, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {right || null}
      </div>
      {children}
    </section>
  );
}

export default Card;

