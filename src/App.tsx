import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Events from "./pages/Events";
import Mentorship from "./pages/Mentorship";
import Programs from "./pages/Programs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EventDetail from "./pages/EventDetail";
import CommunityProgramDetail from "./pages/CommunityProgramDetail";
import Spinner from "./components/Spinner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminParticipants = lazy(() => import("./pages/AdminParticipants"));

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function Protected({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          returnUrl: location.pathname,
          accessError: location.pathname.startsWith("/admin/")
            ? "Your session expired. Sign in again with an administrator account."
            : undefined,
        }}
      />
    );
  }
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LegacyProgramDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/community-programs/${id ?? ""}`} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter
          basename={import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")}
        >
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="events/:id" element={<EventDetail />} />
                <Route path="events" element={<Events />} />
                <Route path="community-programs/:id" element={<CommunityProgramDetail />} />
                <Route path="community-programs" element={<Programs />} />
                <Route path="programs/:id" element={<LegacyProgramDetailRedirect />} />
                <Route path="programs" element={<Programs />} />
                <Route path="dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="admin/dashboard" element={<Protected adminOnly><Dashboard /></Protected>} />
                <Route path="admin/events/:id/participants" element={<Protected adminOnly><AdminParticipants kind="event" /></Protected>} />
                <Route path="admin/community-programs/:id/participants" element={<Protected adminOnly><AdminParticipants kind="program" /></Protected>} />
                <Route path="members" element={<Protected><Members /></Protected>} />
                <Route path="members/:id" element={<Protected><MemberDetail /></Protected>} />
                <Route path="mentorship" element={<Protected><Mentorship /></Protected>} />
                <Route path="profile" element={<Protected><Profile /></Protected>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}