import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/programs", label: "Community" },
  { to: "/members", label: "Members", auth: true },
  { to: "/mentorship", label: "Mentorship", auth: true },
  { to: "/dashboard", label: "Dashboard", auth: true, admin: true },
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">E</div>
            <div>
              <p className="text-sm font-semibold leading-none text-brand-600">ENAT</p>
              <p className="text-xs text-slate-500 leading-none mt-1">Ethiopian Nurses Assoc. of Texas</p>
            </div>
          </NavLink>

          <nav className="hidden gap-1 md:flex">
            {navItems
              .filter(i => (!i.auth || user) && (!i.admin || isAdmin))
              .map(i => (
                <NavLink key={i.to} to={i.to} end
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-slate-600 hover:bg-slate-100"}`}>
                  {i.label}
                </NavLink>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NavLink to="/profile" className="hidden text-sm text-slate-600 hover:text-brand-600 md:inline">
                  {user.fullName}
                </NavLink>
                <button className="btn-outline" onClick={() => { logout(); navigate("/"); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-ghost">Login</NavLink>
                <NavLink to="/register" className="btn-primary">Join</NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Ethiopian Nurses Association of Texas — ENAT
      </footer>
    </div>
  );
}