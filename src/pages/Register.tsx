import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { MembershipTypeLabels, authApi, type MembershipType } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  fullName: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Need an uppercase letter")
    .regex(/[0-9]/, "Need a number"),
  phone: z.string().optional(),
  city: z.string().optional(),
  workAddress: z.string().optional(),
  membershipType: z.string(),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  isMentor: z.boolean(),
  wantsMentor: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isMentor: false, wantsMentor: false, membershipType: "0" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.register({
        ...data,
        membershipType: Number(data.membershipType) as MembershipType,
      });
      setUser(res);
      nav("/profile");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-1">Join ENAT</h1>
        <p className="mb-6 text-sm text-slate-500">
          Membership is reviewed by an admin before activation.
        </p>
        {error && (
          <div className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Full Name</label>
            <input className="input" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register("phone")} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" {...register("city")} />
          </div>
          <div>
            <label className="label">WorkAddress</label>
            <input className="input" {...register("workAddress")} />
          </div>
          <div>
            <label className="label">Membership Type</label>
            <select className="input" {...register("membershipType")}>
              {MembershipTypeLabels.map((l, i) => (
                <option key={l} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">License # (optional)</label>
            <input className="input" {...register("licenseNumber")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Specialty (optional)</label>
            <input className="input" {...register("specialty")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isMentor")} /> I want to be a mentor
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("wantsMentor")} /> I want a mentor
          </label>
          <div className="md:col-span-2">
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already a member?{" "}
          <Link to="/login" className="text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}