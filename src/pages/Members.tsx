import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  membersApi,
  MembershipStatusLabels,
  MembershipTypeLabels,
  type MembershipType,
  type MembershipStatus,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

export default function Members() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [type, setType] = useState<MembershipType | "">("");
  const [status, setStatus] = useState<MembershipStatus | "">("");

  const { data, isLoading } = useQuery({
    queryKey: ["members", q, type, status],
    queryFn: () =>
      membersApi.search({
        q: q || undefined,
        type: type === "" ? undefined : (type as MembershipType),
        status: status === "" ? undefined : (status as MembershipStatus),
        page: 1,
        pageSize: 50,
      }),
  });

  const approve = useMutation({
    mutationFn: membersApi.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
  const suspend = useMutation({
    mutationFn: membersApi.suspend,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Membership Directory</h1>
          <p className="text-sm text-slate-500">
            {data?.total ?? 0} member{data?.total === 1 ? "" : "s"} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search name or specialty..."
            className="input md:w-64"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="input md:w-44"
            value={type}
            onChange={(e) =>
              setType(e.target.value === "" ? "" : (Number(e.target.value) as MembershipType))
            }
          >
            <option value="">All Types</option>
            {MembershipTypeLabels.map((l, i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
          <select
            className="input md:w-40"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value === "" ? "" : (Number(e.target.value) as MembershipStatus))
            }
          >
            <option value="">All Statuses</option>
            {MembershipStatusLabels.map((l, i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No members match your filters.
                  </td>
                </tr>
              )}
              {data?.items.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/members/${m.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {m.fullName}
                    </Link>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">{MembershipTypeLabels[m.membershipType]}</td>
                  <td className="px-4 py-3">{m.city || "—"}</td>
                  <td className="px-4 py-3">{m.specialty || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    {isAdmin && m.status === 0 && (
                      <button
                        className="btn-primary px-2 py-1 text-xs"
                        onClick={() => approve.mutate(m.id)}
                        disabled={approve.isPending}
                      >
                        Approve
                      </button>
                    )}
                    {isAdmin && m.status === 1 && (
                      <button
                        className="btn-outline px-2 py-1 text-xs"
                        onClick={() => suspend.mutate(m.id)}
                        disabled={suspend.isPending}
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}