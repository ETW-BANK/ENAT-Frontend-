import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { eventsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function Events() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.all(false) });

  const register = useMutation({
    mutationFn: eventsApi.register,
    onSuccess: () => { setMsg("You're registered for this event."); qc.invalidateQueries({ queryKey: ["events"] }); },
    onError: (e: any) => setMsg(e?.response?.data?.error || "Registration failed"),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-700 mb-1">Events & Professional Development</h1>
      <p className="text-sm text-slate-500 mb-6">CE workshops, conferences, and NCLEX prep.</p>
      {msg && <div className="mb-4 rounded bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</div>}

      {isLoading ? <Spinner /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map(e => (
            <div key={e.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-brand-700">{e.title}</h3>
                <span className="badge bg-gold-400/20 text-gold-600">{e.ceHours} CE</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{e.description}</p>
              <div className="mt-3 text-sm text-slate-500 space-y-1">
                <p>📅 {new Date(e.startsAt).toLocaleString()}</p>
                <p>📍 {e.isVirtual ? "Virtual" : e.location || "TBD"}</p>
                <p>👥 {e.registrationCount} registered</p>
              </div>
              {user && (
                <button className="btn-primary mt-4 self-start"
                  onClick={() => register.mutate(e.id)}>
                  Register
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}