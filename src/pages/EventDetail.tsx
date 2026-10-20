import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { eventsApi } from "../lib/api";
import RegistrationButton from "../components/RegistrationButton";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

function isEventFull(capacity?: number, placesLeft?: number, registrationCount = 0) {
  return placesLeft !== undefined
    ? placesLeft <= 0
    : capacity !== undefined && registrationCount >= capacity;
}

export default function EventDetail() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const routeMessage = location.state as { registrationMessage?: string; registrationError?: boolean } | null;
  const validId = Number.isSafeInteger(id) && id > 0;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.byId(id),
    enabled: validId,
  });

  if (!validId) {
    return <DetailMessage message="Event not found." />;
  }
  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return <DetailMessage message="Could not load this event." onRetry={() => void refetch()} isFetching={isFetching} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/events" className="text-sm font-medium text-brand-600 hover:underline">← All events</Link>
      <article className="card mt-4 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-brand-700">{data.title}</h1>
          <span className="badge bg-gold-400/20 text-gold-600">{data.ceHours} CE</span>
        </div>
        <p className="mt-4 whitespace-pre-line text-slate-700">{data.description || "Event details will be announced."}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-medium text-slate-500">Date</dt><dd>{new Date(data.startsAt).toLocaleString()}</dd></div>
          {data.endsAt && <div><dt className="font-medium text-slate-500">Ends</dt><dd>{new Date(data.endsAt).toLocaleString()}</dd></div>}
          <div><dt className="font-medium text-slate-500">Location</dt><dd>{data.isVirtual ? "Virtual" : data.location || "To be announced"}</dd></div>
          <div><dt className="font-medium text-slate-500">Registrations</dt><dd>{data.registrationCount}</dd></div>
          {data.placesLeft !== undefined && <div><dt className="font-medium text-slate-500">Places available</dt><dd>{data.placesLeft}</dd></div>}
        </dl>
        {routeMessage?.registrationMessage && (
          <p
            role={routeMessage.registrationError ? "alert" : "status"}
            className={`mt-5 rounded px-4 py-3 text-sm ${routeMessage.registrationError ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}
          >
            {routeMessage.registrationMessage}
          </p>
        )}
        <RegistrationButton
          kind="event"
          id={data.id}
          full={isEventFull(data.capacity, data.placesLeft, data.registrationCount)}
        />
        {isAdmin && (
          <Link to={`/admin/events/${data.id}/participants`} className="btn-outline mt-4">
            View participant list
          </Link>
        )}
      </article>
    </div>
  );
}

function DetailMessage({ message, onRetry, isFetching = false }: { message: string; onRetry?: () => void; isFetching?: boolean }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="card p-6 text-center" role={onRetry ? "alert" : undefined}>
        <p className="text-slate-700">{message}</p>
        {onRetry && <button className="btn-outline mt-4" onClick={onRetry} disabled={isFetching}>Retry</button>}
        <Link to="/events" className="btn-ghost mt-3">Back to events</Link>
      </div>
    </div>
  );
}
