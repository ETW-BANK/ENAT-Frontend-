import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Protected } from "../App";
import { eventsApi, programsApi, type AuthResponse } from "../lib/api";
import AdminParticipants from "./AdminParticipants";
import Events from "./Events";
import EventDetail from "./EventDetail";
import CommunityProgramDetail from "./CommunityProgramDetail";
import Login from "./Login";
import Programs from "./Programs";

const authMocks = vi.hoisted(() => ({
  state: {
    user: null as AuthResponse | null,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authMocks.state,
}));

function LocationOutput() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}{location.search}{JSON.stringify(location.state ?? {})}
    </output>
  );
}

function renderAt(path: string, element: React.ReactNode, routePath = "*") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath} element={<>{element}<LocationOutput /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderLogin(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<LocationOutput />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const event = {
  id: 12,
  title: "ENAT Community Conference",
  description: "Public event",
  startsAt: "2026-11-01T10:00:00Z",
  location: "Dallas",
  isVirtual: false,
  ceHours: 2,
  registrationCount: 1,
  capacity: 10,
  placesLeft: 9,
};

const program = {
  id: 22,
  name: "Health Screening",
  description: "Community program",
  location: "Austin",
  scheduledFor: "2026-11-05T10:00:00Z",
  isActive: true,
};

const loggedInUser: AuthResponse = {
  token: "test-token",
  expiresAt: "2099-01-01T00:00:00Z",
  userId: "user-1",
  email: "member@example.org",
  fullName: "Test Member",
  roles: ["Member"],
  memberId: 1,
};

beforeEach(() => {
  authMocks.state.user = null;
  authMocks.state.isAdmin = false;
  authMocks.state.login.mockReset();
  authMocks.state.logout.mockReset();
  vi.restoreAllMocks();
});

describe("public event and program browsing", () => {
  it("loads public events without redirecting visitors to login", async () => {
    vi.spyOn(eventsApi, "all").mockResolvedValue([event]);

    renderAt("/events", <Events />);

    expect(await screen.findByText("ENAT Community Conference")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute("href", "/events/12");
    expect(screen.getByTestId("location")).toHaveTextContent("/events{}");
  });

  it("loads public event details without authentication", async () => {
    vi.spyOn(eventsApi, "byId").mockResolvedValue(event);

    renderAt("/events/12", <EventDetail />, "/events/:id");

    expect(await screen.findByRole("heading", { name: "ENAT Community Conference" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in to register" })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/events/12{}");
  });

  it("loads public community programs and exposes details without authentication", async () => {
    vi.spyOn(programsApi, "all").mockResolvedValue([program]);

    renderAt("/community-programs", <Programs />);

    expect(await screen.findByText("Health Screening")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute("href", "/community-programs/22");
    expect(screen.getByTestId("location")).toHaveTextContent("/community-programs{}");
  });

  it("loads public community program details without authentication", async () => {
    vi.spyOn(programsApi, "all").mockResolvedValue([program]);

    renderAt("/community-programs/22", <CommunityProgramDetail />, "/community-programs/:id");

    expect(await screen.findByRole("heading", { name: "Health Screening" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in to register" })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/community-programs/22{}");
  });

  it("sends unauthenticated event registration to login with the event action preserved", async () => {
    vi.spyOn(eventsApi, "all").mockResolvedValue([event]);
    const user = userEvent.setup();

    renderAt("/events", <Events />);
    await user.click(await screen.findByRole("button", { name: "Sign in to register" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/login?returnUrl=%2Fevents%2F12&action=register{}",
    );
  });
});

describe("registration flow", () => {
  it("automatically registers the original event after login and returns to its detail page", async () => {
    authMocks.state.login.mockResolvedValue(loggedInUser);
    vi.spyOn(eventsApi, "register").mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();

    renderLogin("/login?returnUrl=%2Fevents%2F12&action=register");
    await user.type(screen.getByLabelText("Email"), "member@example.org");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(eventsApi.register).toHaveBeenCalledWith(12));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(
      "/events/12{\"registrationMessage\":\"Registration successful.\",\"registrationError\":false}",
    ));
  });

  it("registers an authenticated user for an active program", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(programsApi, "all").mockResolvedValue([program]);
    vi.spyOn(programsApi, "register").mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();

    renderAt("/community-programs", <Programs />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(programsApi.register).toHaveBeenCalledWith(22);
    expect(await screen.findByText("Registration successful.")).toBeInTheDocument();
  });

  it("registers an authenticated user for an event", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(eventsApi, "all").mockResolvedValue([event]);
    vi.spyOn(eventsApi, "register").mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();

    renderAt("/events", <Events />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(eventsApi.register).toHaveBeenCalledWith(12);
    expect(await screen.findByText("Registration successful.")).toBeInTheDocument();
  });

  it("automatically registers the original program after login", async () => {
    authMocks.state.login.mockResolvedValue(loggedInUser);
    vi.spyOn(programsApi, "register").mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();

    renderLogin("/login?returnUrl=%2Fcommunity-programs%2F22&action=register");
    await user.type(screen.getByLabelText("Email"), "member@example.org");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(programsApi.register).toHaveBeenCalledWith(22));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(
      "/community-programs/22{\"registrationMessage\":\"Registration successful.\",\"registrationError\":false}",
    ));
  });

  it("shows a duplicate-registration response as already registered", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(programsApi, "all").mockResolvedValue([program]);
    vi.spyOn(programsApi, "register").mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { message: "Already registered" } },
    });
    const user = userEvent.setup();

    renderAt("/community-programs", <Programs />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(await screen.findByText("You are already registered for this activity.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registered" })).toBeDisabled();
  });

  it("clearly disables registration for full events", async () => {
    vi.spyOn(eventsApi, "all").mockResolvedValue([{ ...event, capacity: 1, placesLeft: 0, registrationCount: 1 }]);

    renderAt("/events", <Events />);

    expect(await screen.findByRole("button", { name: "Event full" })).toBeDisabled();
  });

  it("shows a clear message when the API reports a full event", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(eventsApi, "all").mockResolvedValue([event]);
    vi.spyOn(eventsApi, "register").mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { error: "Event is full" } },
    });
    const user = userEvent.setup();

    renderAt("/events", <Events />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(await screen.findByText("This event is full and no longer accepting registrations.")).toBeInTheDocument();
  });

  it("explains when a member profile is missing for program registration", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(programsApi, "all").mockResolvedValue([program]);
    vi.spyOn(programsApi, "register").mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { error: "Member profile not found" } },
    });
    const user = userEvent.setup();

    renderAt("/community-programs", <Programs />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(await screen.findByText(/A member profile is required to register/)).toBeInTheDocument();
  });

  it("clears an invalid session and preserves the event registration when a request returns 401", async () => {
    authMocks.state.user = loggedInUser;
    vi.spyOn(eventsApi, "all").mockResolvedValue([event]);
    vi.spyOn(eventsApi, "register").mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: {} },
    });
    const user = userEvent.setup();

    renderAt("/events", <Events />);
    await user.click(await screen.findByRole("button", { name: "Register" }));

    expect(authMocks.state.logout).toHaveBeenCalled();
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/login?returnUrl=%2Fevents%2F12&action=register{}",
    );
  });

  it("does not show registration controls for inactive programs", async () => {
    vi.spyOn(programsApi, "all").mockResolvedValue([{ ...program, isActive: false }]);

    renderAt("/community-programs", <Programs />);

    expect(await screen.findByText("Inactive")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
  });
});

describe("admin participant access", () => {
  it("shows participant information to an authenticated admin", async () => {
    authMocks.state.user = { ...loggedInUser, roles: ["Admin"] };
    authMocks.state.isAdmin = true;
    vi.spyOn(eventsApi, "participants").mockResolvedValue([{
      id: 1,
      fullName: "Participant One",
      email: "participant@example.org",
      registeredAt: "2026-10-01T12:00:00Z",
      attended: true,
    }]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/admin/events/12/participants"]}>
          <Routes>
            <Route
              path="/admin/events/:id/participants"
              element={<Protected adminOnly><AdminParticipants kind="event" /></Protected>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Participant One")).toBeInTheDocument();
    expect(screen.getByText("participant@example.org")).toBeInTheDocument();
    expect(screen.getByText("Attended")).toBeInTheDocument();
    expect(eventsApi.participants).toHaveBeenCalledWith(12);
  });

  it("loads community-program participants for an authenticated admin", async () => {
    authMocks.state.user = { ...loggedInUser, roles: ["Admin"] };
    authMocks.state.isAdmin = true;
    vi.spyOn(programsApi, "participants").mockResolvedValue([{
      id: 2,
      name: "Program Participant",
      email: "program-participant@example.org",
      registrationDate: "2026-10-02T12:00:00Z",
    }]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/admin/community-programs/22/participants"]}>
          <Routes>
            <Route
              path="/admin/community-programs/:id/participants"
              element={<Protected adminOnly><AdminParticipants kind="program" /></Protected>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Program Participant")).toBeInTheDocument();
    expect(screen.getByText("program-participant@example.org")).toBeInTheDocument();
    expect(programsApi.participants).toHaveBeenCalledWith(22);
  });

  it("shows an access-denied error when the API forbids participant access", async () => {
    authMocks.state.user = { ...loggedInUser, roles: ["Admin"] };
    authMocks.state.isAdmin = true;
    vi.spyOn(eventsApi, "participants").mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/admin/events/12/participants"]}>
          <Routes>
            <Route
              path="/admin/events/:id/participants"
              element={<Protected adminOnly><AdminParticipants kind="event" /></Protected>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("You do not have permission to view participant information.")).toBeInTheDocument();
  });

  it("redirects non-admin users before requesting participant information", async () => {
    authMocks.state.user = loggedInUser;
    authMocks.state.isAdmin = false;
    const participants = vi.spyOn(eventsApi, "participants").mockResolvedValue([]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/admin/events/12/participants"]}>
          <Routes>
            <Route
              path="/admin/events/:id/participants"
              element={<Protected adminOnly><AdminParticipants kind="event" /></Protected>}
            />
            <Route path="*" element={<LocationOutput />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("location")).toHaveTextContent("/");
    expect(participants).not.toHaveBeenCalled();
  });
});
