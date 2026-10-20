import axios from "axios";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi, eventsApi, programsApi } from "../lib/api";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

function eventPlacesLeft(event: { placesLeft?: number; capacity?: number; registrationCount: number }) {
  if (event.placesLeft !== undefined) return event.placesLeft;
  if (event.capacity !== undefined) return Math.max(0, event.capacity - event.registrationCount);
  return null;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [stats, events, programs] = await Promise.all([
        dashboardApi.stats(),
        eventsApi.all(false),
        programsApi.all(),
      ]);
      return { stats, events, programs };
    },
  });

  const programParticipantQueries = useQueries({
    queries: (data?.programs ?? []).map(program => ({
      queryKey: ["program-participants", program.id],
      queryFn: () => programsApi.participants(program.id),
      enabled: Boolean(data) && program.registrationCount === undefined,
      staleTime: 30_000,
    })),
  });

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const message = status === 401
      ? "Your session has expired. Sign in again with an administrator account."
      : status === 403
        ? "Your account does not have permission to view the admin dashboard."
        : "Could not load dashboard information. Please try again.";
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-700">Admin Dashboard</h1>
        <div className="card mt-6 p-6 text-center" role="alert">
          <p className="text-rose-700">{message}</p>
          <button type="button" className="btn-outline mt-4" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const activePrograms = data.programs.filter(program => program.isActive).length;
  const inactivePrograms = data.programs.length - activePrograms;
  const refresh = async () => {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ["program-participants"] }),
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Association activity, events, and community programs.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void refresh()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section aria-label="Association statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={data.stats.totalMembers} to="/members" />
        <StatCard label="Active Members" value={data.stats.activeMembers} to="/members?status=1" accent="brand" />
        <StatCard label="Pending Approval" value={data.stats.pendingMembers} to="/members?status=0" accent="gold" />
        <StatCard label="Active Mentorships" value={data.stats.activeMentorships} to="/mentorship" />
        <StatCard label="Total Events" value={data.events.length} to="/events" />
        <StatCard label="Upcoming Events" value={data.stats.upcomingEvents} to="/events" accent="gold" />
        <StatCard label="Total Community Programs" value={data.programs.length} to="/community-programs" accent="brand" />
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Program status</p>
          <p className="mt-2 text-3xl font-bold text-brand-600">{activePrograms} active</p>
          <p className="mt-1 text-sm text-slate-600">{inactivePrograms} inactive</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-brand-700">Events</h2>
        {data.events.length === 0 ? (
          <p className="card p-5 text-slate-600">No events found.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Registrations</th>
                  <th className="px-4 py-3">Available places</th>
                  <th className="px-4 py-3">Participants</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map(event => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/events/${event.id}`} className="font-medium text-brand-600 hover:underline">{event.title}</Link>
                    </td>
                    <td className="px-4 py-3">{new Date(event.startsAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{event.registrationCount}</td>
                    <td className="px-4 py-3">{eventPlacesLeft(event) ?? "Not provided"}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/events/${event.id}/participants`} className="font-medium text-brand-600 hover:underline">
                        View list
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-brand-700">Community programs</h2>
        {data.programs.length === 0 ? (
          <p className="card p-5 text-slate-600">No community programs found.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registrations</th>
                  <th className="px-4 py-3">Participants</th>
                </tr>
              </thead>
              <tbody>
                {data.programs.map((program, index) => {
                  const participantQuery = programParticipantQueries[index];
                  const count = program.registrationCount ?? participantQuery?.data?.length;
                  const participantErrorStatus = axios.isAxiosError(participantQuery?.error)
                    ? participantQuery.error.response?.status
                    : undefined;
                  return (
                    <tr key={program.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link to={`/community-programs/${program.id}`} className="font-medium text-brand-600 hover:underline">
                          {program.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{program.scheduledFor ? new Date(program.scheduledFor).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">{program.isActive ? "Active" : "Inactive"}</td>
                      <td className="px-4 py-3">
                        {count ?? (participantQuery?.isError
                          ? participantErrorStatus === 403
                            ? "Access denied"
                            : participantErrorStatus === 401
                              ? "Session expired"
                              : participantErrorStatus === 404
                                ? "Not available"
                                : "Unavailable"
                          : participantQuery?.isLoading ? "Loading..." : "—")}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/community-programs/${program.id}/participants`} className="font-medium text-brand-600 hover:underline">
                          View list
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
