import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import logo from "../assets/logo2.png";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleNavItems = navItems.filter(i => (!i.auth || user) && (!i.admin || isAdmin));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <NavLink to="/" className="flex items-center gap-3">
              <img src={logo} alt="ENAT logo" className="h-24 w-24 shrink-0 object-contain md:h-48 md:w-48" />
              <div>
                <p className="text-sm font-semibold leading-none text-brand-600">ENAT</p>
                <p className="mt-1 text-[10px] leading-tight text-slate-500 sm:text-xs">Ethiopian Nurses Assoc. of Texas</p>
              </div>
            </NavLink>

            <nav className="hidden gap-1 md:flex">
              {visibleNavItems.map(i => (
                <NavLink key={i.to} to={i.to} end
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-slate-600 hover:bg-slate-100"}`}>
                  {i.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <NavLink to="/profile" className="text-sm text-slate-600 hover:text-brand-600">
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

            <button
              type="button"
              className="btn-ghost shrink-0 md:hidden"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(open => !open)}
            >
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div id="mobile-navigation" className="mt-3 border-t border-slate-200 pt-3 md:hidden">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {visibleNavItems.map(i => (
                  <NavLink
                    key={i.to}
                    to={i.to}
                    end
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium ${isActive
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {i.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-2 flex flex-col gap-1 border-t border-slate-200 pt-2">
                {user ? (
                  <>
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                      {user.fullName}
                    </NavLink>
                    <button
                      className="btn-outline justify-start"
                      onClick={() => { setMenuOpen(false); logout(); navigate("/"); }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">Login</NavLink>
                    <NavLink to="/register" onClick={() => setMenuOpen(false)} className="btn-primary justify-start">Join</NavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Ethiopian Nurses Association of Texas — ENAT
      </footer>
    </div>
  );
}