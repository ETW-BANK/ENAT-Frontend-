import { MembershipStatusLabels, type MembershipStatus } from "../lib/api";
const styles = [
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-slate-200 text-slate-700",
];

export default function StatusBadge({ status }: { status: MembershipStatus }) {
  return <span className={`badge ${styles[status]}`}>{MembershipStatusLabels[status]}</span>;
}