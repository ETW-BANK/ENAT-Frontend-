import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await login(data.email, data.password);
      nav(res.roles.includes("Admin") ? "/dashboard" : "/members");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-6">Welcome back</h1>
        {error && <div className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link to="/register" className="text-brand-600 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}