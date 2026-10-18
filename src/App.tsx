import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Events from "./pages/Events";
import Mentorship from "./pages/Mentorship";
import Programs from "./pages/Programs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function Protected({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter
          basename={import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")}
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="events" element={<Events />} />
              <Route path="programs" element={<Programs />} />
              <Route path="dashboard" element={<Protected adminOnly><Dashboard /></Protected>} />
              <Route path="members" element={<Protected><Members /></Protected>} />
              <Route path="members/:id" element={<Protected><MemberDetail /></Protected>} />
              <Route path="mentorship" element={<Protected><Mentorship /></Protected>} />
              <Route path="profile" element={<Protected><Profile /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}