import axios from "axios";

export type RegistrationKind = "event" | "program";

export interface RegistrationIntent {
  kind: RegistrationKind;
  id: number;
  returnUrl: string;
}

export function registrationPath(kind: RegistrationKind, id: number) {
  return kind === "event" ? `/events/${id}` : `/community-programs/${id}`;
}

export function registrationLoginPath(kind: RegistrationKind, id: number) {
  const query = new URLSearchParams({
    returnUrl: registrationPath(kind, id),
    action: "register",
  });
  return `/login?${query.toString()}`;
}

export function getRegistrationIntent(search: string): RegistrationIntent | null {
  const params = new URLSearchParams(search);
  if (params.get("action") !== "register") return null;

  const returnUrl = params.get("returnUrl");
  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) return null;

  const match = /^\/(events|community-programs)\/([1-9]\d*)\/?$/.exec(returnUrl);
  if (!match) return null;

  const id = Number(match[2]);
  if (!Number.isSafeInteger(id)) return null;

  const kind = match[1] === "events" ? "event" : "program";
  return { kind, id, returnUrl: registrationPath(kind, id) };
}

function responseMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "";
  const data: unknown = error.response?.data;
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  const body = data as Record<string, unknown>;
  for (const key of ["message", "error", "detail", "title"]) {
    if (typeof body[key] === "string") return body[key];
  }
  return "";
}

export function registrationErrorMessage(error: unknown, kind: RegistrationKind) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const message = responseMessage(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("duplicate")) {
    return { message: "You are already registered for this activity.", alreadyRegistered: true };
  }
  if (normalized.includes("full") || normalized.includes("capacity") || normalized.includes("places left")) {
    return {
      message: kind === "event"
        ? "This event is full and no longer accepting registrations."
        : "This program is no longer accepting registrations.",
      alreadyRegistered: false,
    };
  }
  if (normalized.includes("member") && (normalized.includes("profile") || normalized.includes("not found"))) {
    return { message: "A member profile is required to register. Please contact ENAT for help.", alreadyRegistered: false };
  }
  if (normalized.includes("inactive") || normalized.includes("not active")) {
    return { message: "This community program is inactive and is not accepting registrations.", alreadyRegistered: false };
  }
  if (status === 409) {
    return {
      message: kind === "event"
        ? "This event cannot accept another registration. It may already be full or you may already be registered."
        : "You may already be registered for this community program.",
      alreadyRegistered: false,
    };
  }
  return {
    message: message || `Unable to register for this ${kind}. Please try again.`,
    alreadyRegistered: false,
  };
}
