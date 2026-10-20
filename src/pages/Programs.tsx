import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { programsApi } from "../lib/api";
import RegistrationButton from "../components/RegistrationButton";
import Spinner from "../components/Spinner";

export default function Programs() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["programs"],
    queryFn: programsApi.all,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-brand-700">Community Health Programs</h1>
          <p className="text-sm text-slate-600">Free screenings and outreach across Texas.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {isLoading ? <Spinner /> : isError ? (
        <div className="card p-6 text-center" role="alert">
          <p className="text-rose-700">Could not load community programs. Please try again.</p>
          <button type="button" className="btn-outline mt-4" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : data?.length === 0 ? (
        <p className="card p-6 text-center text-slate-600">There are no community programs to display.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map(program => (
            <article key={program.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-brand-700">{program.name}</h2>
                <span className={`badge shrink-0 ${program.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {program.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{program.description || "Program details will be announced."}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>📍 {program.location || "Location to be announced"}</p>
                {program.scheduledFor && <p>📅 {new Date(program.scheduledFor).toLocaleString()}</p>}
                {program.registrationCount !== undefined && <p>👥 {program.registrationCount} registered</p>}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                <Link to={`/community-programs/${program.id}`} className="btn-outline">View details</Link>
                {program.isActive && <RegistrationButton kind="program" id={program.id} />}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
