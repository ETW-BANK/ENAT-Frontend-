export default function StatCard({ label, value, accent = "brand" }:
  { label: string; value: number | string; accent?: "brand" | "gold" | "slate" }) {
  const color =
    accent === "brand" ? "text-brand-600" :
    accent === "gold"  ? "text-gold-500"  : "text-slate-600";
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}