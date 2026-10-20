import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi, programsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  registrationErrorMessage,
  registrationLoginPath,
  type RegistrationKind,
} from "../lib/registration";
import axios from "axios";

interface RegistrationButtonProps {
  kind: RegistrationKind;
  id: number;
  full?: boolean;
}

export default function RegistrationButton({ kind, id, full = false }: RegistrationButtonProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const register = async () => {
    setMessage("");
    setIsError(false);

    if (!user) {
      navigate(registrationLoginPath(kind, id));
      return;
    }
    if (full || registered || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (kind === "event") await eventsApi.register(id);
      else await programsApi.register(id);
      setRegistered(true);
      setMessage("Registration successful.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        navigate(registrationLoginPath(kind, id), { replace: true });
        return;
      }
      const result = registrationErrorMessage(error, kind);
      setRegistered(result.alreadyRegistered);
      setMessage(result.message);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = full
    ? "Event full"
    : registered
      ? "Registered"
      : isSubmitting
        ? "Registering..."
        : user
          ? "Register"
          : "Sign in to register";

  return (
    <div className="mt-4">
      <button
        type="button"
        className="btn-primary self-start"
        onClick={register}
        disabled={full || registered || isSubmitting}
      >
        {label}
      </button>
      {message && (
        <p role={isError ? "alert" : "status"} className={`mt-2 text-sm ${isError ? "text-rose-700" : "text-emerald-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
