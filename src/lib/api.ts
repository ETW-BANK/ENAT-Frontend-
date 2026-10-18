import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("enat_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("enat_token");
      localStorage.removeItem("enat_user");
    }
    return Promise.reject(error);
  }
);

// ---------- Types ----------
export type MembershipType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const MembershipTypeLabels = [
  "Registered Nurse", "LPN", "APRN", "Student", "Retired", "Associate", "Supporter",
] as const;

export type MembershipStatus = 0 | 1 | 2 | 3;
export const MembershipStatusLabels = ["Pending", "Active", "Suspended", "Expired"] as const;

export interface Member {
  id: number; fullName: string; email: string; phone?: string; city?: string;
  membershipType: MembershipType; status: MembershipStatus;
  licenseNumber?: string; specialty?: string; joinedOn: string;
  renewalDue?: string; isMentor: boolean; wantsMentor: boolean;
}

export interface AuthResponse {
  token: string; expiresAt: string; userId: string; email: string;
  fullName: string; roles: string[]; memberId?: number;
}

export interface EventDto {
  id: number; title: string; description?: string; startsAt: string;
  endsAt?: string; location?: string; isVirtual: boolean;
  ceHours: number; registrationCount: number;
}

export interface MentorshipDto {
  id: number; mentorId: number; mentorName: string;
  menteeId: number; menteeName: string; startedOn: string; status: string;
}

export interface CommunityProgramDto {
  id: number; name: string; description?: string;
  location?: string; scheduledFor?: string; isActive: boolean;
}

export interface DashboardStats {
  totalMembers: number; activeMembers: number; pendingMembers: number;
  activeMentorships: number; upcomingEvents: number; activePrograms: number;
}

export interface RegisterUserRequest {
  fullName: string; email: string; password: string; phone?: string; city?: string;
  membershipType: MembershipType; licenseNumber?: string; specialty?: string;
  isMentor: boolean; wantsMentor: boolean;
}

// ---------- Endpoints ----------
export const authApi = {
  register: (b: RegisterUserRequest) =>
    api.post<AuthResponse>("/api/Auth/register", b).then(r => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/Auth/login", { email, password }).then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/api/Auth/change-password", { currentPassword, newPassword }),
};

export const membersApi = {
  search: (p: { q?: string; type?: MembershipType; status?: MembershipStatus;
                page?: number; pageSize?: number }) =>
    api.get<{ items: Member[]; total: number; page: number; pageSize: number }>(
      "/api/Members", { params: p }).then(r => r.data),
  me: () => api.get<Member>("/api/Members/me").then(r => r.data),
  byId: (id: number) => api.get<Member>(`/api/Members/${id}`).then(r => r.data),
  update: (id: number, body: Partial<Member>) =>
    api.put<Member>(`/api/Members/${id}`, body).then(r => r.data),
  approve: (id: number) => api.post(`/api/Members/${id}/approve`),
  suspend: (id: number) => api.post(`/api/Members/${id}/suspend`),
  remove: (id: number) => api.delete(`/api/Members/${id}`),
};

export const eventsApi = {
  all: (upcomingOnly = false) =>
    api.get<EventDto[]>("/api/Events", { params: { upcomingOnly } }).then(r => r.data),
  byId: (id: number) => api.get<EventDto>(`/api/Events/${id}`).then(r => r.data),
  create: (b: Omit<EventDto, "id" | "registrationCount">) =>
    api.post<EventDto>("/api/Events", b).then(r => r.data),
  remove: (id: number) => api.delete(`/api/Events/${id}`),
  register: (eventId: number) => api.post(`/api/Events/${eventId}/register`),
};

export const mentorshipApi = {
  all: () => api.get<MentorshipDto[]>("/api/Mentorship").then(r => r.data),
  mentors: () => api.get<Member[]>("/api/Mentorship/mentors").then(r => r.data),
  mentees: () => api.get<Member[]>("/api/Mentorship/mentees").then(r => r.data),
  create: (mentorId: number, menteeId: number, notes?: string) =>
    api.post<MentorshipDto>("/api/Mentorship", { mentorId, menteeId, notes }).then(r => r.data),
  complete: (id: number) => api.post(`/api/Mentorship/${id}/complete`),
};

export const programsApi = {
  all: () => api.get<CommunityProgramDto[]>("/api/CommunityPrograms").then(r => r.data),
  create: (b: { name: string; description?: string; location?: string; scheduledFor?: string }) =>
    api.post<CommunityProgramDto>("/api/CommunityPrograms", b).then(r => r.data),
  deactivate: (id: number) => api.post(`/api/CommunityPrograms/${id}/deactivate`),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/api/Dashboard/stats").then(r => r.data),
};