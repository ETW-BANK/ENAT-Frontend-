import { useQuery } from "@tanstack/react-query";
import { programsApi } from "../lib/api";
import Spinner from "../components/Spinner";

export default function Programs() {
  const { data, isLoading } = useQuery({ queryKey: ["programs"], queryFn: programsApi.all });
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-700 mb-1">Community Health Programs</h1>
      <p className="text-sm text-slate-500 mb-6">Free screenings and outreach across Texas.</p>
      {isLoading ? <Spinner /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map(p => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-brand-700">{p.name}</h3>
                <span className={`badge ${p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{p.description}</p>
              <p className="mt-3 text-sm text-slate-500">📍 {p.location || "TBD"}</p>
              {p.scheduledFor && <p className="text-sm text-slate-500">📅 {new Date(p.scheduledFor).toLocaleString()}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}