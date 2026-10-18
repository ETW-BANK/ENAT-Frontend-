import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { membersApi, MembershipTypeLabels } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const memberId = Number(id);
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => membersApi.byId(memberId),
    enabled: !Number.isNaN(memberId),
  });

  const approve = useMutation({
    mutationFn: () => membersApi.approve(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member", memberId] }),
  });
  const suspend = useMutation({
    mutationFn: () => membersApi.suspend(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member", memberId] }),
  });
  const remove = useMutation({
    mutationFn: () => membersApi.remove(memberId),
    onSuccess: () => nav("/members"),
  });

  if (isLoading) return <Spinner />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="card p-8 text-center">
          <p className="text-slate-600">Member not found.</p>
          <Link to="/members" className="btn-primary mt-4">Back to directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/members" className="text-sm text-brand-600 hover:underline">
        ← Back to directory
      </Link>
      <div className="card mt-3 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-700">{data.fullName}</h1>
            <p className="text-sm text-slate-500">{data.email}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-slate-500">Membership Type</dt>
            <dd className="text-sm">{MembershipTypeLabels[data.membershipType]}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Phone</dt>
            <dd className="text-sm">{data.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">City</dt>
            <dd className="text-sm">{data.city || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">License #</dt>
            <dd className="text-sm">{data.licenseNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Specialty</dt>
            <dd className="text-sm">{data.specialty || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Joined</dt>
            <dd className="text-sm">{new Date(data.joinedOn).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Mentor</dt>
            <dd className="text-sm">{data.isMentor ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Looking for Mentor</dt>
            <dd className="text-sm">{data.wantsMentor ? "Yes" : "No"}</dd>
          </div>
        </dl>

        {isAdmin && (
          <div className="mt-8 flex flex-wrap gap-2 border-t pt-4">
            {data.status === 0 && (
              <button className="btn-primary" onClick={() => approve.mutate()}>
                Approve Member
              </button>
            )}
            {data.status === 1 && (
              <button className="btn-outline" onClick={() => suspend.mutate()}>
                Suspend
              </button>
            )}
            <button
              className="btn-ghost text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm(`Delete ${data.fullName}?`)) remove.mutate();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}