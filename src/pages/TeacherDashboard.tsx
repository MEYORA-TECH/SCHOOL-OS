import { Link } from "react-router-dom";
import { AlertTriangle, Calendar, Check, ClipboardCheck, PieChart } from "lucide-react";
import { DAYS, TODAY } from "../data";
import { useApp } from "../store";
import { Bar, PageHeader, StatGrid } from "../ui";

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
      <div className="flex items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-[30px] mb-1.5">Good morning, {me.name.split(" ")[0]}</h1>
          <p className="m-0 text-[14.5px] text-muted">
            {me.subject} · {me.classes.join(", ")}
            {me.classTeacherOf && " · class teacher of " + me.classTeacherOf}
          </p>
        </div>
        <div className="text-right text-[13px] text-muted">Tuesday, 18 August 2026</div>
      </div>
      <div className="rule mt-4 mb-6" />

      <StatGrid
        cols={4}
        items={[
          { label: "My classes", value: me.classes.length, sub: me.periodsPerWeek + " periods a week" },
          { label: "Logged today", value: today.length + " periods", sub: today.length ? "Worklog up to date" : "Not written yet", color: today.length ? "#15803d" : "#b45309" },
          { label: "Attendance pending", value: pendingClasses.length, sub: pendingClasses.length ? pendingClasses.join(", ") : "All classes marked", color: pendingClasses.length ? "#b45309" : "#15803d" },
          { label: "Open tasks", value: openTasks.length, sub: "from the principal", color: openTasks.length ? "#b45309" : "#15803d" }
        ]}
      />

      <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <section className="panel">
          <div className="sectionhead">
            <h2 className="text-[19px] m-0">Today's periods</h2>
            <Link to="/worklog" className="text-[13px] font-semibold">Write worklog</Link>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {todayRow.slots.map((slot, i) => {
                const logged = today.find(w => w.period === i + 1);
                return (
                  <tr key={i} className="border-b border-line">
                    <td className="td w-[90px] text-muted">Period {i + 1}</td>
                    <td className="td font-semibold">{slot || <span className="text-muted font-normal">Free period</span>}</td>
                    <td className="td text-right">
                      {!slot ? null : logged
                        ? <span className="inline-flex items-center gap-1.5 text-[13px] text-ok font-semibold"><Check size={14} /> Logged</span>
                        : <Link to="/worklog" className="text-[13px] font-semibold">Add log</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="panel p-5">
          <h2 className="text-[19px] m-0 mb-4">Syllabus progress</h2>
          <div className="flex flex-col gap-3.5">
            {me.classes.map(c => {
              const last = myLog.filter(w => w.cls === c).sort((a, b) => b.syllabusPct - a.syllabusPct)[0];
              const pct = last ? last.syllabusPct : 45;
              return (
                <div key={c} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "56px 1fr 33px" }}>
                  <span className="text-[14px] font-semibold">{c}</span>
                  <Bar pct={pct} />
                  <span className="text-[13.5px] text-right text-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="h-px bg-line my-5" />
          <div className="kicker mb-3">Quick actions</div>
          <div className="grid gap-2.5">
            <Link to="/attendance" className="btn btn-secondary w-full text-ink no-underline hover:no-underline"><Calendar size={18} className="text-accent" /> Mark Attendance</Link>
            <Link to="/worklog" className="btn btn-secondary w-full text-ink no-underline hover:no-underline"><ClipboardCheck size={18} className="text-accent" /> Write Today's Worklog</Link>
            <Link to="/exams" className="btn btn-secondary w-full text-ink no-underline hover:no-underline"><PieChart size={18} className="text-accent" /> Enter Marks</Link>
          </div>
        </section>
      </div>

      <section className="panel mt-5">
        <div className="sectionhead">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-warn" />
            <h2 className="text-[19px] m-0">Tasks from the principal</h2>
          </div>
          <span className="text-[13px] text-muted">{openTasks.length} open</span>
        </div>
        {myTasks.length === 0 && <div className="p-6 text-[14px] text-muted">Nothing assigned right now.</div>}
        {myTasks.map(t => (
          <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-line">
            <button
              className={"w-6 h-6 border-2 grid place-items-center cursor-pointer " + (t.status === "Done" ? "bg-ok border-ok text-white" : "bg-white border-line")}
              onClick={() => dispatch({ type: "toggleTask", id: t.id })}
              aria-label={t.status === "Done" ? "Mark open" : "Mark done"}
            >
              {t.status === "Done" && <Check size={14} />}
            </button>
            <div className="flex-1">
              <div className={"text-[14.5px] " + (t.status === "Done" ? "line-through text-muted" : "font-semibold")}>{t.title}</div>
              <div className="text-[12.5px] text-muted">{t.assignedBy} · due {t.due}</div>
            </div>
            <span className={"text-[12.5px] font-semibold " + (t.status === "Done" ? "text-ok" : "text-warn")}>{t.status}</span>
          </div>
        ))}
      </section>
    </>
  );
}
