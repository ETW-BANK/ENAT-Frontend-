import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";
import RegistrationButton from "../components/RegistrationButton";
import Spinner from "../components/Spinner";

function isEventFull(capacity?: number, placesLeft?: number, registrationCount = 0) {
  return placesLeft !== undefined
    ? placesLeft <= 0
    : capacity !== undefined && registrationCount >= capacity;
}

export default function Events() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.all(false),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-brand-700">Events &amp; Professional Development</h1>
          <p className="text-sm text-slate-600">CE workshops, conferences, and NCLEX prep.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading ? <Spinner /> : isError ? (
        <div className="card p-6 text-center" role="alert">
          <p className="text-rose-700">Could not load events. Please try again.</p>
          <button type="button" className="btn-outline mt-4" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : data?.length === 0 ? (
        <p className="card p-6 text-center text-slate-600">There are no events to display.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map(event => (
            <article key={event.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-brand-700">{event.title}</h2>
                <span className="badge shrink-0 bg-gold-400/20 text-gold-600">{event.ceHours} CE</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{event.description || "Event details will be announced."}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>📅 {new Date(event.startsAt).toLocaleString()}</p>
                <p>📍 {event.isVirtual ? "Virtual" : event.location || "Location to be announced"}</p>
                <p>👥 {event.registrationCount} registered</p>
                {event.placesLeft !== undefined && <p>🎟️ {event.placesLeft} places available</p>}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                <Link to={`/events/${event.id}`} className="btn-outline">View details</Link>
                <RegistrationButton
                  kind="event"
                  id={event.id}
                  full={isEventFull(event.capacity, event.placesLeft, event.registrationCount)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
