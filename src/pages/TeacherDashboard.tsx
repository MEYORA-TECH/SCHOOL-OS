import { Link } from "react-router-dom";
import { AlertTriangle, Calendar, Check, ClipboardCheck, PieChart } from "lucide-react";
import { DAYS, TODAY } from "../data";
import { useApp } from "../store";
import { Badge, Bar, SectionCard, StatGrid } from "../ui";

export default function TeacherDashboard() {
  const { state, dispatch, me } = useApp();
  if (!me) return null;

  const myLog = state.worklog.filter(w => w.teacherId === me.id);
  const today = myLog.filter(w => w.date === TODAY);
  const myTasks = state.tasks.filter(t => t.teacherId === me.id);
  const openTasks = myTasks.filter(t => t.status === "Open");
  const markedClasses = new Set(today.filter(w => w.attendanceMarked).map(w => w.cls));
  const pendingClasses = me.classes.filter(c => !markedClasses.has(c));
  const todayRow = me.timetable.find(t => t.day === DAYS[1]) || me.timetable[0];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display font-display font-bold text-ink">Good morning, {me.name.split(" ")[0]}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {me.subject} · {me.classes.join(", ")}
            {me.classTeacherOf && " · class teacher of " + me.classTeacherOf}
          </p>
        </div>
        <div className="text-[13px] text-muted bg-surface border border-line rounded-md px-3.5 py-2 shadow-xs">Tuesday, 18 August 2026</div>
      </div>

      <div className="mb-6">
        <StatGrid
          cols={4}
          items={[
            { label: "My classes", value: me.classes.length, sub: me.periodsPerWeek + " periods a week" },
            { label: "Logged today", value: today.length + " periods", sub: today.length ? "Worklog up to date" : "Not written yet", color: today.length ? "#15803d" : "#b45309" },
            { label: "Attendance pending", value: pendingClasses.length, sub: pendingClasses.length ? pendingClasses.join(", ") : "All classes marked", color: pendingClasses.length ? "#b45309" : "#15803d" },
            { label: "Open tasks", value: openTasks.length, sub: "from the principal", color: openTasks.length ? "#b45309" : "#15803d" }
          ]}
        />
      </div>

      <div className="grid gap-6 mb-6 items-start lg:grid-cols-[1.35fr_1fr]">
        <SectionCard title="Today's periods" pad={false} action={<Link to="/worklog" className="link">Write worklog</Link>}>
          <table className="w-full border-collapse">
            <tbody>
              {todayRow.slots.map((slot, i) => {
                const logged = today.find(w => w.period === i + 1);
                return (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="td w-[90px] text-muted">Period {i + 1}</td>
                    <td className="td font-semibold text-ink">{slot || <span className="text-faint font-normal">Free period</span>}</td>
                    <td className="td text-right">
                      {!slot ? null : logged
                        ? <span className="inline-flex items-center gap-1.5 text-[13px] text-ok font-semibold"><Check size={14} /> Logged</span>
                        : <Link to="/worklog" className="link">Add log</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Syllabus progress">
          <div className="flex flex-col gap-3.5">
            {me.classes.map(c => {
              const last = myLog.filter(w => w.cls === c).sort((a, b) => b.syllabusPct - a.syllabusPct)[0];
              const pct = last ? last.syllabusPct : 45;
              return (
                <div key={c} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "56px 1fr 36px" }}>
                  <span className="text-[13.5px] font-semibold text-ink">{c}</span>
                  <Bar pct={pct} color={pct >= 70 ? "#16a34a" : "#2563eb"} />
                  <span className="text-[13px] text-right text-muted tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="rule my-5" />
          <div className="kicker mb-3">Quick actions</div>
          <div className="grid gap-2.5">
            {[
              { to: "/attendance", label: "Mark Attendance", Icon: Calendar },
              { to: "/worklog", label: "Write Today's Worklog", Icon: ClipboardCheck },
              { to: "/exams", label: "Enter Marks", Icon: PieChart }
            ].map(({ to, label, Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3 h-[42px] text-[13.5px] font-medium text-body hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 transition-colors">
                <Icon size={17} className="text-accent shrink-0" /> {label}
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Tasks from the principal"
        icon={AlertTriangle}
        pad={false}
        action={<Badge tone={openTasks.length ? "warn" : "ok"}>{openTasks.length} open</Badge>}
      >
        {myTasks.length === 0 && <div className="px-5 py-8 text-[13.5px] text-muted">Nothing assigned right now.</div>}
        {myTasks.map((t, i) => (
          <div key={t.id} className={"flex items-center gap-4 px-5 py-3.5 " + (i < myTasks.length - 1 ? "border-b border-line" : "")}>
            <button
              className={"h-6 w-6 rounded-md border-2 grid place-items-center cursor-pointer transition-colors shrink-0 "
                + (t.status === "Done" ? "bg-ok-strong border-ok-strong text-white" : "bg-surface border-line-strong hover:border-accent")}
              onClick={() => dispatch({ type: "toggleTask", id: t.id })}
              aria-label={t.status === "Done" ? "Mark open" : "Mark done"}
            >
              {t.status === "Done" && <Check size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={"text-[14px] " + (t.status === "Done" ? "line-through text-muted" : "font-semibold text-ink")}>{t.title}</div>
              <div className="text-[12px] text-muted">{t.assignedBy} · due {t.due}</div>
            </div>
            <Badge tone={t.status === "Done" ? "ok" : "warn"} dot>{t.status}</Badge>
          </div>
        ))}
      </SectionCard>
    </>
  );
}
