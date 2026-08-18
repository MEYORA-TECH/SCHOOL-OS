import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell, Bus, Calendar, Check, ClipboardCheck, ClipboardList, FileText, GraduationCap,
  Home, Megaphone, PieChart, Search, Settings as Cog, User, Users, Wallet
} from "lucide-react";
import { SCHOOL_NAME } from "./data";
import { useApp } from "./store";
import { Avatar } from "./ui";

/** Teachers sit third in MAIN, per the school's own reading order. */
const PRINCIPAL_NAV = [
  { group: "MAIN", items: [
    { to: "/", label: "Dashboard", Icon: Home },
    { to: "/students", label: "Students", Icon: Users },
    { to: "/teachers", label: "Teachers", Icon: GraduationCap },
    { to: "/admissions", label: "Admissions", Icon: ClipboardList },
    { to: "/fees", label: "Fees", Icon: Wallet },
    { to: "/attendance", label: "Attendance", Icon: Calendar },
    { to: "/communication", label: "Communication", Icon: Megaphone }
  ] },
  { group: "ACADEMICS", items: [
    { to: "/exams", label: "Exams", Icon: PieChart },
    { to: "/worklog", label: "Teacher Worklog", Icon: ClipboardCheck }
  ] },
  { group: "OPERATIONS", items: [
    { to: "/documents", label: "Documents", Icon: FileText },
    { to: "/transport", label: "Transport", Icon: Bus }
  ] },
  { group: "SETTINGS", items: [{ to: "/settings", label: "Settings", Icon: Cog }] }
];

const TEACHER_NAV = [
  { group: "MAIN", items: [
    { to: "/", label: "Dashboard", Icon: Home },
    { to: "/attendance", label: "Attendance", Icon: Calendar },
    { to: "/worklog", label: "My Worklog", Icon: ClipboardCheck }
  ] },
  { group: "ACADEMICS", items: [{ to: "/exams", label: "Exams", Icon: PieChart }] },
  { group: "ACCOUNT", items: [{ to: "/me", label: "My Profile", Icon: User }] }
];

export default function Layout() {
  const { state, dispatch, toast, toasts, me } = useApp();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const nav = state.role === "teacher" ? TEACHER_NAV : PRINCIPAL_NAV;
  const who = me ? me.name : "Mrs. Priya Raman";
  const roleLabel = me ? me.subject + " teacher" : "Principal";

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "252px 1fr" }}>
      <aside className="bg-white border-r-2 border-divider flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-4 py-[18px] border-b-2 border-divider">
          <span className="w-[30px] h-[30px] bg-accent text-white grid place-items-center font-extrabold text-[15px]">S</span>
          <span className="font-extrabold text-[17px]">SchoolOS</span>
        </div>
        <nav className="flex-1 overflow-auto px-2 py-3 flex flex-col gap-0.5">
          {nav.map(g => (
            <div key={g.group}>
              <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted px-2.5 pt-4 pb-1.5">{g.group}</div>
              {g.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    "flex items-center gap-3 w-full px-2.5 min-h-[44px] text-[14.5px] no-underline hover:no-underline border-l-[3px] " +
                    (isActive
                      ? "bg-accent-100 text-accent-700 font-bold border-accent"
                      : "text-ink font-medium border-transparent hover:bg-accent-100")
                  }
                >
                  <Icon size={18} className="shrink-0" /> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t-2 border-divider px-4 py-3.5 flex items-center gap-3">
          <Avatar name={who} size={34} />
          <div>
            <div className="text-[13.5px] font-semibold">{me ? me.name.split(" ")[0] : "Principal"}</div>
            <div className="text-[12px] text-muted">{me ? "Teacher · " + (me.classTeacherOf ? "Class teacher " + me.classTeacherOf : me.department) : "School Administrator"}</div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <header className="bg-white border-b-2 border-divider px-7 py-3 flex items-center gap-5 sticky top-0 z-20">
          <div className="font-extrabold text-[15px] whitespace-nowrap">{SCHOOL_NAME}</div>
          {state.role === "principal" && (
            <form
              className="flex-1 max-w-[420px] flex items-center gap-2 border border-line px-3 h-11 bg-ground"
              onSubmit={e => { e.preventDefault(); navigate("/students?q=" + encodeURIComponent(q)); }}
            >
              <Search size={16} className="text-muted" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search students, parents, admission number"
                className="flex-1 border-0 bg-transparent text-[13.5px] outline-none"
              />
            </form>
          )}
          <div className="ml-auto flex items-center gap-4">
            <button
              className="btn btn-secondary w-11 justify-center relative"
              onClick={() => toast("4 new notifications", "Fees, attendance and worklogs need review")}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 bg-bad text-white text-[10px] font-bold w-[17px] h-[17px] grid place-items-center">4</span>
            </button>
            <div className="flex items-center gap-2.5 pl-4 border-l border-line">
              <Avatar name={who} size={34} />
              <div>
                <div className="text-[13.5px] font-semibold">{who}</div>
                <div className="text-[12px] text-muted">{roleLabel}</div>
              </div>
            </div>
            <button className="text-[13px] text-muted underline bg-transparent border-0 cursor-pointer" onClick={() => dispatch({ type: "signOut" })}>
              Sign out
            </button>
          </div>
        </header>

        <main className="p-7 flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
        {toasts.map(t => (
          <div key={t.id} className="flex items-center gap-3 bg-ink text-white px-5 py-3.5 shadow-lg">
            <Check size={18} className="text-[#5ee08a]" />
            <div>
              <div className="text-[14.5px] font-semibold">{t.title}</div>
              {t.sub && <div className="text-[13px] opacity-80">{t.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
