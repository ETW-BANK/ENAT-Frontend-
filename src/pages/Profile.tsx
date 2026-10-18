import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { membersApi, authApi, MembershipTypeLabels, type Member } from "../lib/api";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

export default function Profile() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: membersApi.me,
  });

  const [form, setForm] = useState<Partial<Member>>({});
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName, phone: data.phone, city: data.city,
        membershipType: data.membershipType, licenseNumber: data.licenseNumber,
        specialty: data.specialty, isMentor: data.isMentor, wantsMentor: data.wantsMentor,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => membersApi.update(data!.id, form),
    onSuccess: () => {
      setSaveMsg("Profile saved.");
      refetch();
    },
    onError: (e: any) => setSaveMsg(e?.response?.data?.error || "Save failed"),
  });

  const changePw = useMutation({
    mutationFn: () => authApi.changePassword(pw.currentPassword, pw.newPassword),
    onSuccess: () => {
      setPwMsg("Password changed.");
      setPw({ currentPassword: "", newPassword: "" });
    },
    onError: (e: any) => setPwMsg(e?.response?.data?.error || "Change failed"),
  });

  if (!user) return null;
  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">My Profile</h1>
        <p className="text-sm text-slate-500">
          {user.email} · Roles: {user.roles.join(", ")}
        </p>
      </div>

      {data && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Member Info</h2>
            <StatusBadge status={data.status} />
          </div>
          {saveMsg && <div className="mb-3 rounded bg-brand-50 px-3 py-2 text-sm text-brand-700">{saveMsg}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.fullName || ""}
                     onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ""}
                     onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city || ""}
                     onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="label">Membership Type</label>
              <select className="input" value={form.membershipType ?? 0}
                      onChange={(e) => setForm({ ...form, membershipType: Number(e.target.value) as any })}>
                {MembershipTypeLabels.map((l, i) => <option key={l} value={i}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">License #</label>
              <input className="input" value={form.licenseNumber || ""}
                     onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Specialty</label>
              <input className="input" value={form.specialty || ""}
                     onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isMentor}
                     onChange={(e) => setForm({ ...form, isMentor: e.target.checked })} />
              I want to be a mentor
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.wantsMentor}
                     onChange={(e) => setForm({ ...form, wantsMentor: e.target.checked })} />
              I want a mentor
            </label>
          </div>
          <button className="btn-primary mt-6" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {pwMsg && <div className="mb-3 rounded bg-brand-50 px-3 py-2 text-sm text-brand-700">{pwMsg}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pw.currentPassword}
                   onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pw.newPassword}
                   onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
        </div>
        <button className="btn-outline mt-4"
                onClick={() => changePw.mutate()}
                disabled={!pw.currentPassword || !pw.newPassword || changePw.isPending}>
          {changePw.isPending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}