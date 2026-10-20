import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { programsApi } from "../lib/api";
import RegistrationButton from "../components/RegistrationButton";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function CommunityProgramDetail() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const routeMessage = location.state as { registrationMessage?: string; registrationError?: boolean } | null;
  const validId = Number.isSafeInteger(id) && id > 0;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["programs"],
    queryFn: programsApi.all,
    enabled: validId,
    select: programs => programs.find(program => program.id === id),
  });

  if (!validId) return <ProgramDetailMessage message="Community program not found." />;
  if (isLoading) return <Spinner />;
  if (isError) {
    return <ProgramDetailMessage message="Could not load this community program." onRetry={() => void refetch()} isFetching={isFetching} />;
  }
  if (!data) return <ProgramDetailMessage message="Community program not found." />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/community-programs" className="text-sm font-medium text-brand-600 hover:underline">← All community programs</Link>
      <article className="card mt-4 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-brand-700">{data.name}</h1>
          <span className={`badge ${data.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
            {data.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-line text-slate-700">{data.description || "Program details will be announced."}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-medium text-slate-500">Location</dt><dd>{data.location || "To be announced"}</dd></div>
          {data.scheduledFor && <div><dt className="font-medium text-slate-500">Scheduled</dt><dd>{new Date(data.scheduledFor).toLocaleString()}</dd></div>}
          {data.registrationCount !== undefined && <div><dt className="font-medium text-slate-500">Registrations</dt><dd>{data.registrationCount}</dd></div>}
        </dl>
        {routeMessage?.registrationMessage && (
          <p
            role={routeMessage.registrationError ? "alert" : "status"}
            className={`mt-5 rounded px-4 py-3 text-sm ${routeMessage.registrationError ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}
          >
            {routeMessage.registrationMessage}
          </p>
        )}
        {data.isActive && <RegistrationButton kind="program" id={data.id} />}
        {isAdmin && (
          <Link to={`/admin/community-programs/${data.id}/participants`} className="btn-outline mt-4">
            View participant list
          </Link>
        )}
      </article>
    </div>
  );
}

function ProgramDetailMessage({ message, onRetry, isFetching = false }: { message: string; onRetry?: () => void; isFetching?: boolean }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="card p-6 text-center" role={onRetry ? "alert" : undefined}>
        <p className="text-slate-700">{message}</p>
        {onRetry && <button className="btn-outline mt-4" onClick={onRetry} disabled={isFetching}>Retry</button>}
        <Link to="/community-programs" className="btn-ghost mt-3">Back to community programs</Link>
      </div>
    </div>
  );
}
