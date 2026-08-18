import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, Bus, Calendar, ChevronRight, ClipboardCheck, ClipboardList,
  GraduationCap, MessageCircle, Plus, Send, Users, Wallet
} from "lucide-react";
import { STAGES, TERMS, TODAY, inr, lakh } from "../data";
import { useApp, useTotals } from "../store";
import { Bar, Badge } from "../ui";

const WEEK = [
  { day: "Mon", pct: 93.2 }, { day: "Tue", pct: 94.6 }, { day: "Wed", pct: 95.1 },
  { day: "Thu", pct: 92.4 }, { day: "Fri", pct: 91.8 }, { day: "Sat", pct: 88.9 }
];

export default function Dashboard() {
  const { state } = useApp();
  const t = useTotals();
  const navigate = useNavigate();

  const counts = Object.fromEntries(
    STAGES.map(s => [s.key, state.admissions.filter(a => a.stage === s.key).length])
  ) as Record<string, number>;

  const termRows = TERMS.map(term => {
    const expected = state.students.reduce((a, s) => a + (s.feeTerms.find(x => x.term === term)?.amount ?? 0), 0);
    const paid = state.students.reduce((a, s) => a + (s.feeTerms.find(x => x.term === term)?.paid ?? 0), 0);
    return { term, expected, paid, pct: expected ? Math.round((paid / expected) * 100) : 0 };
  });

  const topPending = [...state.students]
    .map(s => ({ ...s, pending: s.feeTotal - s.feePaid }))
    .filter(s => s.pending > 0)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 5);

  const lowAttendance = [...state.students].sort((a, b) => a.attendance - b.attendance).slice(0, 4);
  const loggedToday = new Set(state.worklog.filter(w => w.date === TODAY).map(w => w.teacherId));
  const missingLog = state.teachers.filter(x => !loggedToday.has(x.id));
  const busUnmarked = state.buses.filter(b => b.status === "Active" && !b.attendanceToday);
  const transportPending = state.buses.reduce((a, b) => a + b.students.reduce((x, s) => x + s.feePending, 0), 0);
  const openTasks = state.tasks.filter(x => x.status === "Open").length;

  const kpis = [
    { label: "Students", value: 800 + state.students.length + 28, sub: `+${counts.admitted} admitted this month`, Icon: Users, tone: "text-ok" },
    { label: "Teachers", value: state.teachers.length + 40, sub: state.teachers.filter(x => x.status === "On leave").length + " on leave today", Icon: GraduationCap, tone: "text-muted" },
    { label: "Attendance", value: t.attendanceRate.toFixed(1) + "%", sub: `${t.present} present · ${t.absent} absent`, Icon: Calendar, tone: "text-muted" },
    { label: "Fees collected", value: lakh(t.collected), sub: t.collectionPct + "% of expected", Icon: Wallet, tone: "text-ok" },
    { label: "Fees pending", value: lakh(t.pending), sub: topPending.length + " students in arrears", Icon: Wallet, tone: "text-warn" },
    { label: "Admission enquiries", value: state.admissions.length, sub: `${counts.new} new · ${counts.visit} visits`, Icon: ClipboardList, tone: "text-accent-700" }
  ];

  const attention = [
    { text: `${lowAttendance.filter(s => s.attendance < 85).length + 8} students have repeated absences`, action: "Review", to: "/attendance", dot: "#b91c1c" },
    { text: `${lakh(t.pending)} in school fees is pending`, action: "Open fees", to: "/fees", dot: "#b45309" },
    { text: `${counts.new} admission enquiries need follow-up`, action: "Follow up", to: "/admissions", dot: "#b45309" },
    { text: `${missingLog.length} teachers haven't written today's worklog`, action: "Remind", to: "/worklog", dot: "#b45309" },
    { text: `${busUnmarked.length} bus${busUnmarked.length === 1 ? "" : "es"} without today's attendance`, action: "Check transport", to: "/transport", dot: "#b45309" },
    { text: `${inr(transportPending)} transport fee pending`, action: "Open transport", to: "/transport", dot: "#b45309" }
  ];

  const quick = [
    { label: "Add Student", Icon: Plus, to: "/students/new" },
    { label: "Mark Attendance", Icon: Calendar, to: "/attendance" },
    { label: "Collect Fee", Icon: Wallet, to: "/fees" },
    { label: "New Admission", Icon: ClipboardList, to: "/admissions" },
    { label: "Send Message", Icon: Send, to: "/communication" },
    { label: "Review Worklog", Icon: ClipboardCheck, to: "/worklog" }
  ];

  return (
    <>
      <div className="flex items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-[30px] mb-1.5">Good morning, Mrs. Priya</h1>
          <p className="m-0 text-[14.5px] text-muted">Here's what's happening at your school today.</p>
        </div>
        <div className="text-right text-[13px] text-muted">Tuesday, 18 August 2026 · Term 2, week 6</div>
      </div>
      <div className="rule mt-4 mb-6" />

      <div className="panel grid grid-cols-6">
        {kpis.map(({ label, value, sub, Icon, tone }, i) => (
          <div key={label} className={"px-4 py-[18px] flex flex-col gap-1.5" + (i < 5 ? " border-r border-line" : "")}>
            <div className="flex items-center gap-2 text-muted">
              <Icon size={15} />
              <span className="text-[11.5px] uppercase tracking-[0.06em]">{label}</span>
            </div>
            <div className="font-extrabold text-[28px] tracking-[-0.02em]">{value}</div>
            <div className={"text-[12.5px] " + tone}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] m-0">Attendance</h2>
            <Link to="/attendance" className="text-[13px] font-semibold">Mark attendance</Link>
          </div>
          <div className="flex gap-7 items-center">
            <div>
              <div className="font-extrabold text-[40px] tracking-[-0.02em]">{t.attendanceRate.toFixed(1)}%</div>
              <div className="text-[13px] text-muted">today · {t.present} of {state.attTotals.total}</div>
            </div>
            <div className="flex-1 flex items-end gap-2 h-[92px]">
              {WEEK.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full">
                  <span className="text-[11px] text-muted">{d.pct.toFixed(0)}%</span>
                  <span className="w-full block bg-accent" style={{ height: ((d.pct - 85) / 12) * 100 + "%" }} />
                  <span className="text-[11.5px] text-muted">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-line my-[18px]" />
          <div className="kicker mb-3">Class-wise today</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(state.classRates).map(([cls, pct]) => (
              <div key={cls} className="grid items-center gap-3" style={{ gridTemplateColumns: "50px 1fr 44px" }}>
                <span className="text-[14px] font-semibold">{cls}</span>
                <Bar pct={pct} color={pct >= 95 ? "#15803d" : pct >= 90 ? "#1d4ed8" : "#b45309"} />
                <span className="text-[13.5px] text-right text-muted">{pct}%</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-line my-[18px]" />
          <div className="kicker mb-3">Lowest attendance — needs a parent call</div>
          <div className="flex flex-col gap-2">
            {lowAttendance.map(s => (
              <Link key={s.id} to={`/students/${s.id}`}
                className="flex items-center gap-3 text-ink no-underline hover:no-underline hover:bg-accent-100 px-2 py-1.5 -mx-2">
                <span className="text-[14px] font-semibold flex-1">{s.name}</span>
                <span className="text-[13px] text-muted">{s.cls}</span>
                <span className="text-[14px] font-bold" style={{ color: s.attendance < 80 ? "#b91c1c" : "#b45309" }}>{s.attendance}%</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] m-0">Fee collection</h2>
            <Link to="/fees" className="text-[13px] font-semibold">Open fees</Link>
          </div>
          <div className="font-extrabold text-[40px] tracking-[-0.02em]">{lakh(t.collected)}</div>
          <div className="text-[13px] text-muted">collected of {lakh(t.expected)} expected</div>
          <div className="flex h-3.5 border border-line mt-4 mb-2.5">
            <div style={{ width: t.collectionPct + "%", background: "#1d4ed8" }} />
            <div className="flex-1" style={{ background: "#fdf3e2" }} />
          </div>
          <div className="flex justify-between text-[13.5px]">
            <span>Collection rate <strong>{t.collectionPct}%</strong></span>
            <span className="text-warn">Pending {lakh(t.pending)}</span>
          </div>

          <div className="h-px bg-line my-[18px]" />
          <div className="kicker mb-3">Term-wise (sample roll)</div>
          <div className="flex flex-col gap-3">
            {termRows.map(r => (
              <div key={r.term} className="grid items-center gap-3" style={{ gridTemplateColumns: "62px 1fr 44px" }}>
                <span className="text-[14px] font-semibold">{r.term}</span>
                <Bar pct={r.pct} color={r.pct >= 80 ? "#15803d" : r.pct >= 50 ? "#1d4ed8" : "#b45309"} />
                <span className="text-[13.5px] text-right text-muted">{r.pct}%</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-line my-[18px]" />
          <div className="kicker mb-3">Largest pending amounts</div>
          <div className="flex flex-col gap-2">
            {topPending.map(s => (
              <Link key={s.id} to={`/fees/${s.id}`}
                className="flex items-center gap-3 text-ink no-underline hover:no-underline hover:bg-accent-100 px-2 py-1.5 -mx-2">
                <span className="text-[14px] font-semibold flex-1">{s.name}</span>
                <span className="text-[13px] text-muted">{s.cls}</span>
                <span className="text-[14px] font-bold text-warn">{inr(s.pending)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] m-0">Admissions pipeline</h2>
            <Link to="/admissions" className="text-[13px] font-semibold">Open</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {STAGES.map(s => {
              const n = counts[s.key];
              const pct = Math.round((n / Math.max(1, state.admissions.length)) * 100);
              return (
                <div key={s.key} className="grid items-center gap-3" style={{ gridTemplateColumns: "96px 1fr 28px" }}>
                  <span className="text-[13.5px]">{s.label}</span>
                  <Bar pct={pct} color={s.key === "admitted" ? "#15803d" : "#1d4ed8"} />
                  <span className="text-[13.5px] text-right font-semibold">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="h-px bg-line my-4" />
          <div className="text-[13px] text-muted">
            {counts.new + counts.contacted} enquiries still to convert · {counts.admitted} admitted this month
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] m-0">Teacher worklog</h2>
            <Link to="/worklog" className="text-[13px] font-semibold">Review</Link>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-[34px]">{loggedToday.size}</span>
            <span className="text-[14px] text-muted">of {state.teachers.length} teachers wrote today</span>
          </div>
          <div className="mt-3"><Bar pct={(loggedToday.size / state.teachers.length) * 100} color="#15803d" /></div>
          <div className="h-px bg-line my-4" />
          <div className="kicker mb-2.5">Still pending</div>
          {missingLog.length === 0
            ? <div className="text-[14px] text-ok font-semibold">All worklogs in.</div>
            : (
              <div className="flex flex-col gap-2">
                {missingLog.slice(0, 4).map(x => (
                  <div key={x.id} className="flex items-center gap-2">
                    <span className="text-[14px] flex-1">{x.name}</span>
                    <span className="text-[12.5px] text-muted">{x.subject}</span>
                  </div>
                ))}
              </div>
            )}
          <div className="h-px bg-line my-4" />
          <div className="flex justify-between text-[13.5px]">
            <span>Open tasks assigned</span><strong>{openTasks}</strong>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] m-0">Transport today</h2>
            <Link to="/transport" className="text-[13px] font-semibold">Open</Link>
          </div>
          <div className="flex flex-col gap-3">
            {state.buses.slice(0, 4).map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <Bus size={16} className="text-muted shrink-0" />
                <span className="text-[13.5px] font-semibold flex-1">{b.route}</span>
                {b.attendanceToday
                  ? <Badge tone="ok">{b.attendanceToday.present}</Badge>
                  : <Badge tone="warn">Not marked</Badge>}
              </div>
            ))}
          </div>
          <div className="h-px bg-line my-4" />
          <div className="grid grid-cols-2 gap-3 text-[13.5px]">
            <div><div className="kicker">Buses running</div><strong>{state.buses.filter(b => b.status === "Active").length} of {state.buses.length}</strong></div>
            <div><div className="kicker">Fee pending</div><strong className="text-warn">{inr(transportPending)}</strong></div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <section className="panel">
          <div className="sectionhead">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-warn" />
              <h2 className="text-[19px] m-0">Needs attention</h2>
            </div>
            <span className="text-[13px] text-muted">{attention.length} items</span>
          </div>
          {attention.map(a => (
            <button key={a.text} onClick={() => navigate(a.to)}
              className="flex items-center gap-3.5 w-full px-5 min-h-[56px] py-3.5 border-0 border-b border-line bg-white cursor-pointer text-left hover:bg-accent-100">
              <span className="w-2 h-2 block shrink-0" style={{ background: a.dot }} />
              <span className="flex-1 text-[14.5px]">{a.text}</span>
              <span className="text-[13px] text-accent font-semibold">{a.action}</span>
              <ChevronRight size={14} className="text-accent" />
            </button>
          ))}
        </section>

        <section className="panel p-5">
          <h2 className="text-[19px] m-0 mb-4">Quick actions</h2>
          <div className="grid gap-2.5">
            {quick.map(({ label, Icon, to }) => (
              <Link key={label} to={to} className="btn btn-secondary w-full text-ink no-underline hover:no-underline">
                <Icon size={18} className="text-accent" /> {label}
              </Link>
            ))}
          </div>
          <div className="h-px bg-line my-5" />
          <div className="kicker mb-3">Recently sent to parents</div>
          {state.messages.length === 0
            ? <p className="text-[13.5px] text-muted m-0">Nothing sent today. <Link to="/communication">Send a message</Link></p>
            : (
              <div className="flex flex-col gap-2">
                {state.messages.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <MessageCircle size={15} className="text-muted shrink-0" />
                    <span className="text-[13.5px] flex-1">{m.title}</span>
                    <span className="text-[12.5px] text-muted">{m.count}</span>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </>
  );
}
