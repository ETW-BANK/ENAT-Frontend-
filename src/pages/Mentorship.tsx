import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { mentorshipApi } from "../lib/api";
import Spinner from "../components/Spinner";

export default function Mentorship() {
  const qc = useQueryClient();
  const [mentorId, setMentorId] = useState<number | "">("");
  const [menteeId, setMenteeId] = useState<number | "">("");
  const [msg, setMsg] = useState("");

  const list = useQuery({ queryKey: ["mentorships"], queryFn: mentorshipApi.all });
  const mentors = useQuery({ queryKey: ["mentors"], queryFn: mentorshipApi.mentors });
  const mentees = useQuery({ queryKey: ["mentees"], queryFn: mentorshipApi.mentees });

  const create = useMutation({
    mutationFn: () => mentorshipApi.create(Number(mentorId), Number(menteeId)),
    onSuccess: () => {
      setMsg("Mentorship created.");
      setMentorId("");
      setMenteeId("");
      qc.invalidateQueries({ queryKey: ["mentorships"] });
    },
    onError: (e: any) => setMsg(e?.response?.data?.error || "Failed to create mentorship"),
  });

  const complete = useMutation({
    mutationFn: mentorshipApi.complete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentorships"] }),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-700">Mentorship</h1>
      <p className="text-sm text-slate-500 mb-6">Pair experienced nurses with newcomers.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Create Pairing</h2>
          {msg && <div className="mb-3 rounded bg-brand-50 px-3 py-2 text-xs text-brand-700">{msg}</div>}
          <label className="label">Mentor</label>
          <select className="input mb-3" value={mentorId}
                  onChange={(e) => setMentorId(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Choose a mentor…</option>
            {mentors.data?.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName} {m.specialty ? `· ${m.specialty}` : ""}</option>
            ))}
          </select>
          <label className="label">Mentee</label>
          <select className="input mb-4" value={menteeId}
                  onChange={(e) => setMenteeId(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Choose a mentee…</option>
            {mentees.data?.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
          </select>
          <button
            className="btn-primary w-full"
            disabled={mentorId === "" || menteeId === "" || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Creating…" : "Create Pairing"}
          </button>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Active & Past Pairings</h2>
          {list.isLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Mentor</th>
                    <th className="py-2">Mentee</th>
                    <th className="py-2">Started</th>
                    <th className="py-2">Status</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {list.data?.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">No pairings yet.</td></tr>
                  )}
                  {list.data?.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2">{m.mentorName}</td>
                      <td className="py-2">{m.menteeName}</td>
                      <td className="py-2">{new Date(m.startedOn).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`badge ${m.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"}`}>{m.status}</span>
                      </td>
                      <td className="py-2 text-right">
                        {m.status === "Active" && (
                          <button className="btn-ghost px-2 py-1 text-xs"
                                  onClick={() => complete.mutate(m.id)}>
                            Complete
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
      </div>
    </div>
  );
}