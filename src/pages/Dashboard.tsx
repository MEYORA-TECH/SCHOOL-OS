import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, Bus, Calendar, ChevronRight, ClipboardCheck, ClipboardList, Flag,
  GraduationCap, MessageCircle, Plus, Send, Sparkles, Users, Wallet, Beaker
} from "lucide-react";
import { STAGES, TERMS, TODAY, inr, lakh } from "../data";
import { useApp, useTotals } from "../store";
import { Bar, Badge, Donut, KpiCard, SchoolScene, SectionCard } from "../ui";

const WEEK = [
  { day: "Mon", pct: 93.2 }, { day: "Tue", pct: 94.6 }, { day: "Wed", pct: 95.1 },
  { day: "Thu", pct: 92.4 }, { day: "Fri", pct: 91.8 }, { day: "Sat", pct: 88.9 }
];

const ANNOUNCEMENTS = [
  { title: "Independence Day Celebration", body: "School will remain closed on 15th August.", date: "12 Aug", Icon: Flag, tint: "bg-warn-bg text-warn" },
  { title: "PTM Scheduled", body: "Parent-Teacher Meeting on 22nd August.", date: "10 Aug", Icon: Users, tint: "bg-accent-50 text-accent-700" },
  { title: "Science Exhibition", body: "Students are invited to participate.", date: "08 Aug", Icon: Beaker, tint: "bg-ok-bg text-ok" }
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
    { label: "Total Students", value: state.students.length, sub: "across 8 sections", Icon: Users, tone: "accent" as const, trend: { dir: "up" as const, text: "+2 this month", good: true } },
    { label: "Teachers", value: state.teachers.length + 40, sub: state.teachers.filter(x => x.status === "On leave").length + " on leave today", Icon: GraduationCap, tone: "ok" as const },
    { label: "Attendance", value: t.attendanceRate.toFixed(1) + "%", sub: `${t.present} present`, Icon: Calendar, tone: "accent" as const, trend: { dir: "up" as const, text: "0.6%", good: true } },
    { label: "Fees Collected", value: lakh(t.collected), sub: "of " + lakh(t.expected), Icon: Wallet, tone: "ok" as const, trend: { dir: "up" as const, text: t.collectionPct + "%", good: true } },
    { label: "Fees Pending", value: lakh(t.pending), sub: topPending.length + " in arrears", Icon: Wallet, tone: "warn" as const },
    { label: "Enquiries", value: state.admissions.length, sub: `${counts.new} new · ${counts.visit} visits`, Icon: ClipboardList, tone: "accent" as const }
  ];

  const attention = [
    { text: `${lowAttendance.filter(s => s.attendance < 85).length + 8} students have repeated absences`, action: "Review", to: "/attendance", tone: "bad" as const },
    { text: `${lakh(t.pending)} in school fees is pending`, action: "Open fees", to: "/fees", tone: "warn" as const },
    { text: `${counts.new} admission enquiries need follow-up`, action: "Follow up", to: "/admissions", tone: "warn" as const },
    { text: `${missingLog.length} teachers haven't written today's worklog`, action: "Remind", to: "/worklog", tone: "warn" as const },
    { text: `${busUnmarked.length} bus${busUnmarked.length === 1 ? "" : "es"} without today's attendance`, action: "Check transport", to: "/transport", tone: "warn" as const },
    { text: `${inr(transportPending)} transport fee pending`, action: "Open transport", to: "/transport", tone: "warn" as const }
  ];

  const quick = [
    { label: "Add Student", Icon: Plus, to: "/students/new" },
    { label: "Mark Attendance", Icon: Calendar, to: "/attendance" },
    { label: "Collect Fee", Icon: Wallet, to: "/fees" },
    { label: "New Admission", Icon: ClipboardList, to: "/admissions" },
    { label: "Send Message", Icon: Send, to: "/communication" },
    { label: "Review Worklog", Icon: ClipboardCheck, to: "/worklog" }
  ];

  const dotTone: Record<string, string> = { bad: "bg-bad-strong", warn: "bg-warn-strong" };

  return (
    <>
      {/* Hero banner with illustration */}
      <div className="hero-gradient relative overflow-hidden rounded-2xl border border-line/70 mb-6">
        <div className="flex items-center justify-between gap-4 p-6 sm:p-8">
          <div className="relative z-10 max-w-md">
            <h1 className="text-display font-display font-bold text-ink flex items-center gap-2">
              Good morning, Mrs. Priya <span className="inline-block origin-[70%_70%] animate-[wave_1.8s_ease-in-out_1]">👋</span>
            </h1>
            <p className="mt-2 text-[14.5px] text-body">Here's what's happening at your school today.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link to="/attendance" className="btn btn-primary"><Calendar size={16} /> Mark Attendance</Link>
              <Link to="/communication" className="btn btn-secondary"><Send size={15} /> Send Notice</Link>
            </div>
          </div>

          {/* Illustration — hidden on small screens to keep text readable */}
          <div className="hidden md:block relative z-0 shrink-0">
            <SchoolScene height={186} />
          </div>

          {/* Date card */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 bg-surface/90 backdrop-blur-sm rounded-xl border border-line shadow-sm px-6 py-4 text-center">
            <div className="text-[12px] text-muted">Tuesday</div>
            <div className="font-display font-bold text-[34px] leading-none text-ink my-0.5">18</div>
            <div className="text-[12px] text-muted">August 2026</div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(k => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} Icon={k.Icon} tone={k.tone} trend={k.trend} />
        ))}
      </div>

      {/* Attendance chart · Fee donut · Quick actions */}
      <div className="grid gap-6 mb-6 items-start xl:grid-cols-[1.3fr_1fr_0.9fr]">
        <SectionCard title="Attendance Overview" action={<Link to="/attendance" className="link">This week</Link>}>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-display font-bold text-[30px] leading-none text-ink">{t.attendanceRate.toFixed(1)}%</span>
            <span className="text-[13px] text-muted">Overall attendance</span>
          </div>
          <div className="flex items-end gap-2.5 h-[130px] mb-2">
            {WEEK.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full group">
                <span className="text-[11px] font-semibold text-muted">{d.pct.toFixed(0)}%</span>
                <span
                  className={"w-full rounded-md transition-all group-hover:opacity-90 " + (i % 2 ? "bar-gradient-alt" : "bar-gradient")}
                  style={{ height: ((d.pct - 82) / 16) * 100 + "%" }}
                />
                <span className="text-[11.5px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="rule my-4" />
          <div className="kicker mb-3">Class-wise today</div>
          <div className="flex flex-col gap-2.5">
            {Object.entries(state.classRates).map(([cls, pct]) => (
              <div key={cls} className="grid items-center gap-3" style={{ gridTemplateColumns: "44px 1fr 36px" }}>
                <span className="text-[13px] font-semibold text-ink">{cls}</span>
                <Bar pct={pct} color={pct >= 95 ? "#16a34a" : pct >= 92 ? "#2563eb" : "#d97706"} />
                <span className="text-[13px] text-right text-muted tabular-nums">{pct}%</span>
              </div>
            ))}
          </div>
          <Link to="/attendance" className="link inline-flex items-center gap-1 mt-4">View all classes <ChevronRight size={13} /></Link>
        </SectionCard>

        <SectionCard title="Fee Collection" action={<Link to="/fees" className="link">This month</Link>}>
          <div className="font-display font-bold text-[26px] text-ink">{lakh(t.collected)}</div>
          <div className="text-[13px] text-muted mb-4">collected of {lakh(t.expected)} expected</div>
          <div className="flex items-center gap-5">
            <Donut
              size={140}
              thickness={16}
              centerLabel={t.collectionPct + "%"}
              centerSub="Collected"
              segments={[
                { value: t.collected, color: "#2563eb" },
                { value: t.pending, color: "#f6dcaf" }
              ]}
            />
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-2 text-[13px] text-body"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> Collected</div>
                <div className="font-display font-bold text-[16px] text-ink ml-4.5">{lakh(t.collected)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[13px] text-body"><span className="h-2.5 w-2.5 rounded-full bg-warn-strong" /> Pending</div>
                <div className="font-display font-bold text-[16px] text-warn ml-4.5">{lakh(t.pending)}</div>
              </div>
            </div>
          </div>
          <Link to="/fees" className="btn btn-secondary w-full mt-5">View fee report <ChevronRight size={14} /></Link>
        </SectionCard>

        <div className="flex flex-col gap-6">
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2.5">
              {quick.map(({ label, Icon, to }) => (
                <Link key={label} to={to}
                  className="flex flex-col items-start gap-2 rounded-lg border border-line bg-surface px-3 py-3 hover:border-accent-200 hover:bg-accent-50 transition-colors">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent-50 text-accent-700"><Icon size={16} /></span>
                  <span className="text-[12.5px] font-medium text-body leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Announcements" action={<Link to="/communication" className="link">View all</Link>}>
            <div className="flex flex-col gap-3.5">
              {ANNOUNCEMENTS.map(a => (
                <div key={a.title} className="flex items-start gap-3">
                  <span className={"grid place-items-center h-9 w-9 rounded-lg shrink-0 " + a.tint}><a.Icon size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-ink truncate">{a.title}</div>
                    <div className="text-[12px] text-muted truncate">{a.body}</div>
                  </div>
                  <span className="text-[11.5px] text-muted shrink-0 flex items-center gap-1.5">{a.date}<span className="h-1.5 w-1.5 rounded-full bg-accent" /></span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Needs attention */}
      <SectionCard
        title="Needs your attention"
        icon={AlertTriangle}
        pad={false}
        className="mb-6 border-warn-border/70"
        action={<Badge tone="warn">{attention.length} items</Badge>}
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 divide-line">
          {attention.map(a => (
            <button
              key={a.text}
              onClick={() => navigate(a.to)}
              className="group flex items-center gap-3 w-full px-5 py-4 text-left transition-colors hover:bg-subtle/70
                         border-line sm:border-b sm:odd:border-r xl:[&:not(:nth-child(3n))]:border-r xl:odd:border-r"
            >
              <span className={"h-2 w-2 rounded-full shrink-0 " + dotTone[a.tone]} />
              <span className="flex-1 text-[13.5px] text-body leading-snug">{a.text}</span>
              <span className="inline-flex items-center gap-0.5 text-[12.5px] text-accent font-semibold shrink-0 group-hover:gap-1 transition-all">
                {a.action} <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Operational trio */}
      <div className="grid gap-6 mb-6 items-start md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Admissions pipeline" action={<Link to="/admissions" className="link">Open</Link>}>
          <div className="flex flex-col gap-2.5">
            {STAGES.map(s => {
              const n = counts[s.key];
              const pct = Math.round((n / Math.max(1, state.admissions.length)) * 100);
              return (
                <div key={s.key} className="grid items-center gap-3" style={{ gridTemplateColumns: "92px 1fr 26px" }}>
                  <span className="text-[13px] text-body">{s.label}</span>
                  <Bar pct={pct} color={s.key === "admitted" ? "#16a34a" : "#2563eb"} />
                  <span className="text-[13px] text-right font-semibold text-ink tabular-nums">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="rule my-4" />
          <div className="text-[12.5px] text-muted">
            {counts.new + counts.contacted} enquiries still to convert · {counts.admitted} admitted this month
          </div>
        </SectionCard>

        <SectionCard title="Teacher worklog" action={<Link to="/worklog" className="link">Review</Link>}>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-[32px] text-ink tabular-nums">{loggedToday.size}</span>
            <span className="text-[13.5px] text-muted">of {state.teachers.length} teachers wrote today</span>
          </div>
          <div className="mt-3"><Bar pct={(loggedToday.size / state.teachers.length) * 100} color="#16a34a" /></div>
          <div className="rule my-4" />
          <div className="kicker mb-2.5">Still pending</div>
          {missingLog.length === 0
            ? <div className="text-[13.5px] text-ok font-semibold">All worklogs in.</div>
            : (
              <div className="flex flex-col gap-2">
                {missingLog.slice(0, 4).map(x => (
                  <div key={x.id} className="flex items-center gap-2">
                    <span className="text-[13.5px] text-body flex-1 truncate">{x.name}</span>
                    <span className="text-[12px] text-muted">{x.subject}</span>
                  </div>
                ))}
              </div>
            )}
          <div className="rule my-4" />
          <div className="flex justify-between items-center text-[13.5px]">
            <span className="text-body">Open tasks assigned</span><strong className="text-ink">{openTasks}</strong>
          </div>
        </SectionCard>

        <SectionCard title="Transport today" action={<Link to="/transport" className="link">Open</Link>} className="md:col-span-2 xl:col-span-1">
          <div className="flex flex-col gap-2.5">
            {state.buses.slice(0, 4).map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <Bus size={16} className="text-faint shrink-0" />
                <span className="text-[13.5px] font-medium text-body flex-1 truncate">{b.route}</span>
                {b.attendanceToday
                  ? <Badge tone="ok" dot>{b.attendanceToday.present}</Badge>
                  : <Badge tone="warn" dot>Not marked</Badge>}
              </div>
            ))}
          </div>
          <div className="rule my-4" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="kicker mb-1">Buses running</div>
              <strong className="text-ink text-[15px]">{state.buses.filter(b => b.status === "Active").length} of {state.buses.length}</strong>
            </div>
            <div>
              <div className="kicker mb-1">Fee pending</div>
              <strong className="text-warn text-[15px]">{inr(transportPending)}</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recently sent + lowest attendance */}
      <div className="grid gap-6 items-start lg:grid-cols-2">
        <SectionCard title="Lowest attendance" icon={Sparkles} action={<Link to="/attendance" className="link">Open attendance</Link>}>
          <div className="flex flex-col gap-0.5">
            {lowAttendance.map(s => (
              <Link key={s.id} to={`/students/${s.id}`}
                className="flex items-center gap-3 rounded-md px-2.5 py-2 -mx-2.5 hover:bg-subtle transition-colors">
                <span className="text-[13.5px] font-semibold text-ink flex-1 truncate">{s.name}</span>
                <span className="text-[12.5px] text-muted">{s.cls}</span>
                <span className="text-[13.5px] font-bold tabular-nums" style={{ color: s.attendance < 80 ? "#be123c" : "#b45309" }}>{s.attendance}%</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recently sent to parents" action={<Link to="/communication" className="link">Send a message</Link>}>
          {state.messages.length === 0
            ? <p className="text-[13.5px] text-muted m-0">Nothing sent today. Use <Link to="/communication" className="link">Communication</Link> to notify parents.</p>
            : (
              <div className="flex flex-col gap-3">
                {state.messages.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent-50 text-accent-700 shrink-0">
                      <MessageCircle size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium text-ink truncate">{m.title}</div>
                      <div className="text-[12px] text-muted">{m.audience} · {m.count} parents</div>
                    </div>
                    <span className="text-[12px] text-ok font-semibold shrink-0">{m.when}</span>
                  </div>
                ))}
              </div>
            )}
        </SectionCard>
      </div>
    </>
  );
}
