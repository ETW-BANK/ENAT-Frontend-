import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { eventsApi, programsApi, type RegistrationParticipant } from "../lib/api";
import Spinner from "../components/Spinner";

interface AdminParticipantsProps {
  kind: "event" | "program";
}

function participantName(participant: RegistrationParticipant) {
  return participant.fullName || participant.participantName || participant.name || "Name unavailable";
}

function registrationDate(participant: RegistrationParticipant) {
  const value = participant.registeredAt || participant.registrationDate;
  return value ? new Date(value).toLocaleString() : "Not provided";
}

function attendance(participant: RegistrationParticipant) {
  if (participant.attendanceStatus) return participant.attendanceStatus;
  const isAttended = participant.isAttended ?? participant.attended;
  return isAttended === undefined ? "Not recorded" : isAttended ? "Attended" : "Not attended";
}

export default function AdminParticipants({ kind }: AdminParticipantsProps) {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const query = useQuery({
    queryKey: [kind === "event" ? "event-participants" : "program-participants", id],
    queryFn: () => kind === "event" ? eventsApi.participants(id) : programsApi.participants(id),
    enabled: validId,
  });
  const title = kind === "event" ? "Event participants" : "Community program participants";
  const listPath = kind === "event" ? "/events" : "/community-programs";
  const errorStatus = axios.isAxiosError(query.error) ? query.error.response?.status : undefined;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to={listPath} className="text-sm font-medium text-brand-600 hover:underline">← Back</Link>
      <div className="mb-5 mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">{title}</h1>
          <p className="text-sm text-slate-600">Participant details are available to administrators only.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void query.refetch()} disabled={!validId || query.isFetching}>
          {query.isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!validId ? (
        <p className="card p-6 text-center text-slate-600">Invalid activity ID.</p>
      ) : query.isLoading ? (
        <Spinner />
      ) : query.isError ? (
        <div className="card p-6 text-center" role="alert">
          <p className="text-rose-700">
            {errorStatus === 401
              ? "Your session has expired. Sign in again with an administrator account."
              : errorStatus === 403
                ? "You do not have permission to view participant information."
                : errorStatus === 404
                  ? "The participant-list endpoint or activity was not found."
                  : "Could not load participants. Please try again."}
          </p>
          <button type="button" className="btn-outline mt-4" onClick={() => void query.refetch()} disabled={query.isFetching}>
            Retry
          </button>
        </div>
      ) : query.data?.length === 0 ? (
        <p className="card p-6 text-center text-slate-600">No participants are registered yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Registered</th>
                {kind === "event" && <th className="px-4 py-3">Attendance</th>}
              </tr>
            </thead>
            <tbody>
              {query.data?.map((participant, index) => (
                <tr key={participant.id ?? `${participant.email}-${index}`} className="border-b last:border-0">
                  <td className="px-4 py-3">{participantName(participant)}</td>
                  <td className="px-4 py-3">{participant.email || "Email unavailable"}</td>
                  <td className="px-4 py-3">{registrationDate(participant)}</td>
                  {kind === "event" && <td className="px-4 py-3">{attendance(participant)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
