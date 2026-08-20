import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell, Bus, Calendar, Check, ClipboardCheck, ClipboardList, FileText, GraduationCap,
  Home, Megaphone, Menu, PieChart, Search, Settings as Cog, User, Users, Wallet, X
} from "lucide-react";
import { SCHOOL_NAME } from "./data";
import { useApp } from "./store";
import { Avatar } from "./ui";

/** Teachers sit third in MAIN, per the school's own reading order. */
const PRINCIPAL_NAV = [
  { group: "Main", items: [
    { to: "/", label: "Dashboard", Icon: Home },
    { to: "/students", label: "Students", Icon: Users },
    { to: "/teachers", label: "Teachers", Icon: GraduationCap },
    { to: "/admissions", label: "Admissions", Icon: ClipboardList },
    { to: "/fees", label: "Fees", Icon: Wallet },
    { to: "/attendance", label: "Attendance", Icon: Calendar },
    { to: "/communication", label: "Communication", Icon: Megaphone }
  ] },
  { group: "Academics", items: [
    { to: "/exams", label: "Exams", Icon: PieChart },
    { to: "/worklog", label: "Teacher Worklog", Icon: ClipboardCheck }
  ] },
  { group: "Operations", items: [
    { to: "/documents", label: "Documents", Icon: FileText },
    { to: "/transport", label: "Transport", Icon: Bus }
  ] },
  { group: "Administration", items: [{ to: "/settings", label: "Settings", Icon: Cog }] }
];

const TEACHER_NAV = [
  { group: "Main", items: [
    { to: "/", label: "Dashboard", Icon: Home },
    { to: "/attendance", label: "Attendance", Icon: Calendar },
    { to: "/worklog", label: "My Worklog", Icon: ClipboardCheck }
  ] },
  { group: "Academics", items: [{ to: "/exams", label: "Exams", Icon: PieChart }] },
  { group: "Account", items: [{ to: "/me", label: "My Profile", Icon: User }] }
];

export default function Layout() {
  const { state, dispatch, toast, toasts, me } = useApp();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const nav = state.role === "teacher" ? TEACHER_NAV : PRINCIPAL_NAV;
  const who = me ? me.name : "Mrs. Priya Raman";
  const roleLabel = me ? me.subject + " teacher" : "Principal";

  const sidebar = (
    <>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-line shrink-0">
        <span className="h-9 w-9 rounded-lg bg-accent text-white grid place-items-center font-display font-bold text-[16px] shadow-xs">S</span>
        <div className="leading-tight">
          <div className="font-display font-bold text-[16px] text-ink">SchoolOS</div>
          <div className="text-[11px] text-muted">School management</div>
        </div>
        <button className="icon-btn ml-auto lg:hidden h-8 w-8" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {nav.map(g => (
          <div key={g.group}>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint px-3 mb-1.5">{g.group}</div>
            <div className="flex flex-col gap-0.5">
              {g.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    "group flex items-center gap-3 w-full px-3 h-[38px] rounded-md text-[14px] transition-colors " +
                    (isActive
                      ? "bg-accent-50 text-accent-700 font-semibold"
                      : "text-body font-medium hover:bg-subtle hover:text-ink")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={"shrink-0 " + (isActive ? "text-accent" : "text-faint group-hover:text-muted")} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-subtle transition-colors">
          <Avatar name={who} size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold text-ink truncate">{who}</div>
            <div className="text-[12px] text-muted truncate">
              {me ? (me.classTeacherOf ? "Class teacher · " + me.classTeacherOf : me.department) : "School Administrator"}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] bg-surface border-r border-line flex-col z-30">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[272px] bg-surface border-r border-line flex flex-col animate-slide-up">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-[248px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur-md border-b border-line h-16 flex items-center gap-3 px-4 sm:px-6">
          <button className="icon-btn lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>

          <div className="font-display font-bold text-[14px] text-ink whitespace-nowrap hidden sm:block truncate max-w-[240px] md:max-w-none">
            {SCHOOL_NAME}
          </div>

          {state.role === "principal" && (
            <form
              className="field-shell flex-1 max-w-[440px] ml-auto sm:ml-4"
              onSubmit={e => { e.preventDefault(); navigate("/students?q=" + encodeURIComponent(q)); }}
            >
              <Search size={16} className="text-faint shrink-0" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search students, parents, admission no…"
                aria-label="Search"
              />
            </form>
          )}

          <div className={"flex items-center gap-2 sm:gap-3 " + (state.role === "principal" ? "" : "ml-auto")}>
            <button
              className="icon-btn relative"
              onClick={() => toast("4 new notifications", "Fees, attendance and worklogs need review")}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-bad text-white text-[10px] font-bold h-[17px] min-w-[17px] px-1 grid place-items-center rounded-full ring-2 ring-surface">4</span>
            </button>
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-line">
              <Avatar name={who} size={34} />
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-ink">{who}</div>
                <div className="text-[11.5px] text-muted">{roleLabel}</div>
              </div>
            </div>
            <button
              className="btn btn-ghost text-[13px] px-2.5"
              onClick={() => dispatch({ type: "signOut" })}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center w-[calc(100%-2rem)] max-w-md pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 bg-ink text-white px-4 py-3 rounded-lg shadow-pop w-full animate-toast-in"
          >
            <span className="grid place-items-center h-6 w-6 rounded-full bg-ok-strong/20 text-[#5ee08a] shrink-0 mt-0.5">
              <Check size={15} />
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold">{t.title}</div>
              {t.sub && <div className="text-[12.5px] text-white/70 mt-0.5">{t.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
