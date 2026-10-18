import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: dashboardApi.stats,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-700">Admin Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">
        A snapshot of association activity.
      </p>

      {isLoading || !data ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Members" value={data.totalMembers} to="/members" />
          <StatCard label="Active" value={data.activeMembers} to="/members?status=1" accent="brand" />
          <StatCard label="Pending Approval" value={data.pendingMembers} to="/members?status=0" accent="gold" />
          <StatCard label="Active Mentorships" value={data.activeMentorships} to="/mentorship" />
          <StatCard label="Upcoming Events" value={data.upcomingEvents} to="/events" accent="gold" />
          <StatCard label="Active Programs" value={data.activePrograms} to="/programs" accent="brand" />
        </div>
      )}
    </div>
  );
}