import { Link } from "react-router-dom";

export default function StatCard({ label, value, to, accent = "brand" }:
  { label: string; value: number | string; to: string; accent?: "brand" | "gold" | "slate" }) {
  const color =
    accent === "brand" ? "text-brand-600" :
    accent === "gold"  ? "text-gold-500"  : "text-slate-600";
  return (
    <Link
      to={to}
      className="card block p-5 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </Link>
  );
}