import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { eventsApi, programsApi } from "../lib/api";
import {
  getRegistrationIntent,
  registrationErrorMessage,
} from "../lib/registration";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const routeState = location.state as { accessError?: string } | null;
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await login(data.email, data.password);
      const intent = getRegistrationIntent(location.search);
      if (intent) {
        try {
          if (intent.kind === "event") await eventsApi.register(intent.id);
          else await programsApi.register(intent.id);
          await queryClient.invalidateQueries({ queryKey: [intent.kind === "event" ? "events" : "programs"] });
          nav(intent.returnUrl, {
            replace: true,
            state: { registrationMessage: "Registration successful.", registrationError: false },
          });
        } catch (registrationError) {
          if (axios.isAxiosError(registrationError) && registrationError.response?.status === 401) {
            setError("Your session could not be authorized. Please sign in again.");
            return;
          }
          const result = registrationErrorMessage(registrationError, intent.kind);
          nav(intent.returnUrl, {
            replace: true,
            state: { registrationMessage: result.message, registrationError: true },
          });
        }
        return;
      }
      nav(res.roles.includes("Admin") ? "/admin/dashboard" : "/members");
    } catch (e) {
      const message = axios.isAxiosError(e) && typeof e.response?.data?.error === "string"
        ? e.response.data.error
        : "Login failed";
      setError(message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-6">Welcome back</h1>
        {routeState?.accessError && (
          <div className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
            {routeState.accessError}
          </div>
        )}
        {error && <div className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input id="login-email" className="input" autoComplete="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" className="input" {...register("password")} />
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