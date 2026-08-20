import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, GraduationCap, MessageCircle, Phone, Plus } from "lucide-react";
import { DAYS, TODAY, Teacher, inr, initials, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import {
  Avatar, BackLink, Badge, Bar, DataTable, EmptyState, PageHeader, Row, SearchInput, SectionCard, StatGrid, Tabs
} from "../ui";

export function Teachers() {
  const { state, toast } = useApp();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");

  const depts = Array.from(new Set(state.teachers.map(t => t.department)));
  const rows = useMemo(() => state.teachers.filter(t => {
    if (dept !== "All" && t.department !== dept) return false;
    const hay = (t.name + " " + t.subject + " " + t.empId + " " + t.classes.join(" ")).toLowerCase();
    return !q.trim() || hay.includes(q.trim().toLowerCase());
  }), [state.teachers, q, dept]);

  const loggedToday = new Set(state.worklog.filter(w => w.date === TODAY).map(w => w.teacherId));

  return (
    <>
      <PageHeader
        title="Teachers"
        sub="Staff records, classes handled and today's worklog status."
        action={<button className="btn btn-primary" onClick={() => toast("Add Teacher", "Prototype — staff onboarding form not built")}><Plus size={16} /> Add Teacher</button>}
      />

      <div className="mb-6">
        <StatGrid
          cols={4}
          items={[
            { label: "Teaching staff", value: state.teachers.length + 40 },
            { label: "On leave today", value: state.teachers.filter(t => t.status === "On leave").length, color: "#b45309" },
            { label: "Class teachers", value: state.teachers.filter(t => t.classTeacherOf).length },
            { label: "Worklog written today", value: loggedToday.size + " of " + state.teachers.length, color: loggedToday.size === state.teachers.length ? "#15803d" : "#b45309" }
          ]}
        />
      </div>

      <div className="panel p-3 mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, subject, employee ID or class" className="flex-1 min-w-[240px]" />
        <select className="select w-auto min-w-[190px]" value={dept} onChange={e => setDept(e.target.value)} aria-label="Filter by department">
          {["All", ...depts].map(d => <option key={d}>{d === "All" ? "All departments" : d}</option>)}
        </select>
        <span className="text-[13px] text-muted ml-auto pr-1"><strong className="text-ink">{rows.length}</strong> of {state.teachers.length} shown</span>
      </div>

      <div className="panel overflow-hidden">
        <DataTable
          head={["Teacher", "Emp ID", "Subject", "Classes", "Class teacher", "Phone", { label: "Worklog", align: "center" }, { label: "Status", align: "center" }, { label: "", align: "right" }]}
          minWidth={980}
        >
          {rows.map(t => (
            <Row key={t.id}>
              <td className="td">
                <Link to={`/teachers/${t.id}`} className="flex items-center gap-3 group">
                  <Avatar name={t.name} />
                  <span className="text-[14px] font-semibold text-ink group-hover:text-accent-700 transition-colors">{t.name}</span>
                </Link>
              </td>
              <td className="td text-muted">{t.empId}</td>
              <td className="td">{t.subject}</td>
              <td className="td text-muted">{t.classes.join(", ")}</td>
              <td className="td">{t.classTeacherOf ?? "—"}</td>
              <td className="td text-muted tabular-nums whitespace-nowrap">{t.phone}</td>
              <td className="td text-center">{loggedToday.has(t.id) ? <Badge tone="ok" dot>Written</Badge> : <Badge tone="warn" dot>Pending</Badge>}</td>
              <td className="td text-center"><Badge tone={t.status === "Active" ? "ok" : "warn"}>{t.status}</Badge></td>
              <td className="td text-right"><Link to={`/teachers/${t.id}`} className="link">View</Link></td>
            </Row>
          ))}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState icon={GraduationCap} title="No teachers found" body="Try a different name or department."
            action={<button className="btn btn-secondary" onClick={() => { setQ(""); setDept("All"); }}>Clear filters</button>} />
        )}
      </div>
    </>
  );
}

export function TeacherProfile() {
  const { id } = useParams();
  const { state } = useApp();
  const t = state.teachers.find(x => x.id === id);
  if (!t) return <EmptyState title="Teacher not found" body="This record may have been removed." />;
  return <TeacherDetail teacher={t} back="/teachers" own={false} />;
}

export function MyProfile() {
  const { me } = useApp();
  if (!me) return null;
  return <TeacherDetail teacher={me} back="/" own />;
}

const TABS = ["Overview", "Timetable", "Worklog", "Leave", "Salary", "Documents"] as const;

function TeacherDetail({ teacher: t, back, own }: { teacher: Teacher; back: string; own: boolean }) {
  const { state, toast } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const log = state.worklog.filter(w => w.teacherId === t.id);
  const net = t.salary.basic + t.salary.hra + t.salary.allowances - t.salary.deductions;

  return (
    <>
      <BackLink to={back}>{own ? "Back to Dashboard" : "Back to Teachers"}</BackLink>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <span className="h-16 w-16 rounded-full bg-accent-100 text-accent-700 grid place-items-center font-display font-bold text-[22px] shrink-0">{initials(t.name)}</span>
            <div className="min-w-0">
              <h1 className="text-h1 font-display font-bold text-ink truncate">{t.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                <span>{t.empId}</span><span className="text-line-strong">·</span>
                <span>{t.subject}</span><span className="text-line-strong">·</span>
                <span>{t.department}</span>
                {t.classTeacherOf && <><span className="text-line-strong">·</span><Badge tone="accent">Class teacher {t.classTeacherOf}</Badge></>}
              </div>
            </div>
          </div>
          {!own && (
            <div className="flex gap-2.5 flex-wrap">
              <a className="btn btn-secondary" href={phoneHref(t.phone)}><Phone size={16} /> Call</a>
              <a className="btn btn-wa" target="_blank" rel="noreferrer"
                href={waHref(t.phone, "Dear " + t.name + ", please submit today's worklog and class attendance. — Principal, ABC School")}
                onClick={() => toast("WhatsApp opened", "Message to " + t.name)}>
                <MessageCircle size={16} /> WhatsApp
              </a>
              <button className="btn btn-primary" onClick={() => toast("Task assigned", "Prototype — task form not built")}>Assign Task</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <StatGrid
          cols={5}
          items={[
            { label: "Own attendance", value: t.attendance + "%" },
            { label: "Experience", value: t.experienceYears + " yrs", sub: "joined " + t.joinedOn },
            { label: "Periods a week", value: t.periodsPerWeek },
            { label: "Class average", value: t.avgClassScore + "%", sub: "across " + t.classes.length + " classes" },
            { label: "Leave balance", value: t.leave.casualBalance + t.leave.sickBalance + " days" }
          ]}
        />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid md:grid-cols-2 gap-5">
          <Info title="Employment" rows={[
            ["Employee ID", t.empId], ["Department", t.department], ["Joined on", t.joinedOn],
            ["Experience", t.experienceYears + " years"], ["Status", t.status], ["Class teacher of", t.classTeacherOf ?? "—"]
          ]} />
          <Info title="Qualification & contact" rows={[
            ["Qualification", t.qualification], ["Subject", t.subject], ["Classes handled", t.classes.join(", ")],
            ["Phone", t.phone], ["Email", t.email]
          ]} />
          <section className="panel p-5">
            <h2 className="text-h3 font-display font-bold text-ink mb-4">Class performance</h2>
            <div className="flex flex-col gap-3.5">
              {t.classes.map(c => {
                const last = log.filter(w => w.cls === c)[0];
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
            <div className="rule my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div><div className="kicker mb-1">Exams graded</div><div className="font-display font-bold text-[22px] text-ink">{t.examsGraded}</div></div>
              <div><div className="kicker mb-1">Worklog entries</div><div className="font-display font-bold text-[22px] text-ink">{log.length}</div></div>
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="text-h3 font-display font-bold text-ink mb-4">Tasks</h2>
            {state.tasks.filter(k => k.teacherId === t.id).length === 0
              ? <p className="text-[13.5px] text-muted m-0">No tasks assigned.</p>
              : (
                <div className="flex flex-col gap-2.5">
                  {state.tasks.filter(k => k.teacherId === t.id).map(k => (
                    <div key={k.id} className="flex items-center gap-3 rounded-md border border-line px-3.5 py-2.5">
                      <span className="flex-1 text-[13.5px] text-body">{k.title}</span>
                      <span className="text-[12px] text-muted">due {k.due}</span>
                      <Badge tone={k.status === "Done" ? "ok" : "warn"}>{k.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {tab === "Timetable" && (
        <section className="panel overflow-hidden">
          <DataTable head={["Day", ...[1, 2, 3, 4, 5, 6, 7].map(p => "P" + p)]} minWidth={820}>
            {t.timetable.map(row => (
              <Row key={row.day}>
                <td className="td font-bold text-ink">{row.day}</td>
                {row.slots.map((s, i) => (
                  <td key={i} className={"td text-[13px] " + (s ? "font-medium text-ink" : "text-faint")}>{s ?? "Free"}</td>
                ))}
              </Row>
            ))}
          </DataTable>
          <div className="px-4 py-3 text-[12.5px] text-muted border-t border-line">
            {t.periodsPerWeek} teaching periods a week · {DAYS.length}-day week
          </div>
        </section>
      )}

      {tab === "Worklog" && (
        <section className="panel overflow-hidden">
          <DataTable head={["Date", "Period", "Class", "Subject", "Topic covered", { label: "Attendance", align: "center" }, "Syllabus"]} minWidth={860}>
            {log.map(w => (
              <Row key={w.id} className="align-top">
                <td className="td text-muted whitespace-nowrap">{w.date}</td>
                <td className="td">P{w.period}</td>
                <td className="td font-semibold text-ink">{w.cls}</td>
                <td className="td">{w.subject}</td>
                <td className="td">
                  <div className="font-medium text-ink">{w.topic}</div>
                  {w.remarks && <div className="text-[12px] text-muted mt-0.5">{w.remarks}</div>}
                </td>
                <td className="td text-center">{w.attendanceMarked ? <Badge tone="ok">Marked</Badge> : <Badge tone="warn">Not marked</Badge>}</td>
                <td className="td w-[130px]"><Bar pct={w.syllabusPct} /><div className="text-[12px] text-muted mt-1 tabular-nums">{w.syllabusPct}%</div></td>
              </Row>
            ))}
          </DataTable>
          {log.length === 0 && <EmptyState title="No worklog entries yet" body="Entries appear here as periods are logged." />}
        </section>
      )}

      {tab === "Leave" && (
        <div className="grid gap-5 lg:grid-cols-2 items-start">
          <div className="flex flex-col gap-5">
            <StatGrid cols={2} items={[
              { label: "Casual leave", value: t.leave.casualBalance + " left", sub: t.leave.casualTaken + " of 12 taken" },
              { label: "Sick leave", value: t.leave.sickBalance + " left", sub: t.leave.sickTaken + " of 8 taken" }
            ]} />
            <SectionCard title="Recent leave" pad={false}>
              <DataTable head={["From", "Days", "Type", "Reason", { label: "Status", align: "center" }]}>
                {[
                  ["02 Aug 2026", "1", "Casual", "Family function", "Approved"],
                  ["18 Jul 2026", "2", "Sick", "Fever", "Approved"],
                  ["06 Jun 2026", "1", "Casual", "Personal", "Approved"]
                ].map(r => (
                  <Row key={r[0]}>
                    <td className="td">{r[0]}</td>
                    <td className="td">{r[1]}</td>
                    <td className="td">{r[2]}</td>
                    <td className="td text-muted">{r[3]}</td>
                    <td className="td text-center"><Badge tone="ok">{r[4]}</Badge></td>
                  </Row>
                ))}
              </DataTable>
            </SectionCard>
          </div>
          <section className="panel p-5">
            <h2 className="text-h3 font-display font-bold text-ink mb-4">Attendance this term</h2>
            <div className="flex flex-col gap-3.5">
              {[["June", 98], ["July", 94], ["August", t.attendance]].map(([m, p]) => (
                <div key={m as string} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "80px 1fr 36px" }}>
                  <span className="text-[13.5px] text-body">{m}</span>
                  <Bar pct={p as number} color="#16a34a" />
                  <span className="text-[13px] text-right text-muted tabular-nums">{p}%</span>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-muted mt-5 mb-0">Last leave taken {t.leave.lastLeave}.</p>
          </section>
        </div>
      )}

      {tab === "Salary" && (
        <div className="max-w-[720px]">
          <StatGrid cols={2} items={[
            { label: "Monthly gross", value: inr(t.salary.basic + t.salary.hra + t.salary.allowances) },
            { label: "Monthly net", value: inr(net), color: "#15803d" }
          ]} />
          <SectionCard title="Break-up" pad={false} className="mt-5">
            <DataTable head={["Component", { label: "Amount", align: "right" }]}>
              {([
                ["Basic pay", inr(t.salary.basic)],
                ["House rent allowance", inr(t.salary.hra)],
                ["Other allowances", inr(t.salary.allowances)],
                ["Deductions (PF, professional tax)", "− " + inr(t.salary.deductions)],
                ["Net payable", inr(net)]
              ] as [string, string][]).map(([k, v], i) => (
                <Row key={k} className={i === 4 ? "bg-subtle/50" : ""}>
                  <td className={"td " + (i === 4 ? "font-bold text-ink" : "")}>{k}</td>
                  <td className={"td text-right tabular-nums " + (i === 4 ? "font-bold text-ink" : "")}>{v}</td>
                </Row>
              ))}
            </DataTable>
            <div className="px-4 py-3 text-[12.5px] text-muted border-t border-line">
              Visible to the principal and to {own ? "you" : "this teacher"} only.
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "Documents" && (
        <section className="panel p-5 max-w-[720px]">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Staff documents</h2>
          <div className="flex flex-col gap-2.5">
            {t.documents.map(d => (
              <div key={d.name} className="flex items-center gap-3 rounded-md border border-line px-3.5 py-3 hover:border-line-strong transition-colors">
                <span className="grid place-items-center h-9 w-9 rounded-lg bg-subtle text-muted shrink-0"><FileText size={17} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink truncate">{d.name}</div>
                  <div className="text-[12px] text-muted">{d.meta}</div>
                </div>
                <Badge tone="ok" dot>Verified</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Info({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="panel p-5">
      <h2 className="text-h3 font-display font-bold text-ink mb-4">{title}</h2>
      <div className="grid gap-x-5 gap-y-3 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <span className="text-muted">{k}</span>
            <span className="text-ink font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
