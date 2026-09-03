import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "./Logo";
import { useAuth, can } from "../lib/AuthContext";
import { useOpenReportCount } from "../lib/hooks";

const NAV = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/reports", label: "Report queue", icon: FlagIcon, countKey: "reports" },
  { to: "/users", label: "Users", icon: UsersIcon },
  { to: "/staff", label: "Staff", icon: StaffIcon, staffOnly: true },
  { to: "/squads", label: "Squads", icon: SquadsIcon },
  { to: "/games", label: "Games", icon: GamesIcon },
  { to: "/audit", label: "Audit log", icon: HistoryIcon },
];

export default function Layout() {
  const { session, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openReports = useOpenReportCount();

  const visibleNav = NAV.filter((item) => {
    if (item.staffOnly) return can(role, "manage_staff");
    return true;
  });

  return (
    <div className="shell">
      <div className="mobile-topbar">
        <button onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          ☰
        </button>
        <Logo size={20} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Konex Staff</span>
      </div>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Logo />
          <div>
            <div className="sidebar-brand-text">KONEX</div>
            <div className="sidebar-brand-sub">STAFF CONSOLE</div>
          </div>
        </div>

        <nav className="nav-group">
          {visibleNav.map(({ to, label, icon: Icon, end, countKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />
              <span>{label}</span>
              {countKey === "reports" && openReports > 0 && (
                <span className="badge-count">{openReports}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-email">{session?.user?.email}</span>
            <span className={`sidebar-user-role pill-role-${role}`}>{role}</span>
          </div>
          <button className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21V4a1 1 0 0 1 1.4-.9c3 1.4 6.2 1.4 9.2 0a1 1 0 0 1 1.4.9v9a1 1 0 0 1-1.4.9c-3-1.4-6.2-1.4-9.2 0" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17.5" cy="8.8" r="2.4" />
      <path d="M21 20c0-2.6-1.7-4.5-4-5.1" />
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z" />
    </svg>
  );
}
function SquadsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M3 20c0-2.8 2.2-5 5-5h0c1.1 0 2.1.4 2.9 1" />
      <path d="M13.1 16c.8-.6 1.8-1 2.9-1h0c2.8 0 5 2.2 5 5" />
    </svg>
  );
}
function GamesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2.5" y="7.5" width="19" height="10" rx="4" />
      <line x1="7" y1="12.5" x2="7" y2="12.51" />
      <line x1="6" y1="10.5" x2="6" y2="14.5" transform="rotate(90 6 12.5)" />
      <circle cx="16.5" cy="10.5" r="0.9" fill="currentColor" />
      <circle cx="18.5" cy="12.5" r="0.9" fill="currentColor" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
