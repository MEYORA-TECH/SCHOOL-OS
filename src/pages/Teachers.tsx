import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, MessageCircle, Phone, Plus, Search } from "lucide-react";
import { DAYS, TODAY, Teacher, inr, initials, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import { Avatar, BackLink, Badge, Bar, DataTable, EmptyState, PageHeader, StatGrid } from "../ui";

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

      <div className="mb-5">
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

      <div className="flex gap-3 items-center flex-wrap mb-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-2 border border-line px-3 h-11 bg-white">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, subject, employee ID or class"
            className="flex-1 border-0 bg-transparent text-[14px] outline-none" />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Department
          <select className="select w-[200px]" value={dept} onChange={e => setDept(e.target.value)}>
            {["All", ...depts].map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <span className="text-[13px] text-muted">{rows.length} of {state.teachers.length} shown</span>
      </div>

      <div className="panel">
        <DataTable head={["Teacher", "Emp ID", "Subject", "Classes", "Class teacher", "Phone", "Worklog today", "Status", "Action"]}>
          {rows.map(t => (
            <tr key={t.id} className="border-b border-line hover:bg-accent-100">
              <td className="td">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} />
                  <span className="text-[14.5px] font-semibold">{t.name}</span>
                </div>
              </td>
              <td className="td text-muted">{t.empId}</td>
              <td className="td">{t.subject}</td>
              <td className="td text-muted">{t.classes.join(", ")}</td>
              <td className="td">{t.classTeacherOf ?? "—"}</td>
              <td className="td text-muted whitespace-nowrap">{t.phone}</td>
              <td className="td">{loggedToday.has(t.id) ? <Badge tone="ok">Written</Badge> : <Badge tone="warn">Pending</Badge>}</td>
              <td className="td"><Badge tone={t.status === "Active" ? "ok" : "warn"}>{t.status}</Badge></td>
              <td className="td"><Link to={`/teachers/${t.id}`} className="text-[13.5px] font-semibold underline">View profile</Link></td>
            </tr>
          ))}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState title="No teachers found" body="Try a different name or department."
            action={<button className="btn btn-secondary" onClick={() => { setQ(""); setDept("All"); }}>Clear Filters</button>} />
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

      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-[18px]">
          <span className="w-[66px] h-[66px] bg-accent-200 text-accent-700 grid place-items-center font-extrabold text-[24px]">{initials(t.name)}</span>
          <div>
            <h1 className="text-[30px] mb-1.5">{t.name}</h1>
            <div className="text-[14px] text-muted">
              {t.empId} · {t.subject} · {t.department}
              {t.classTeacherOf && " · class teacher of " + t.classTeacherOf}
            </div>
          </div>
        </div>
        {!own && (
          <div className="flex gap-2.5">
            <a className="btn btn-secondary text-ink no-underline hover:no-underline" href={phoneHref(t.phone)}><Phone size={16} /> Call</a>
            <a className="btn btn-wa text-white no-underline hover:no-underline" target="_blank" rel="noreferrer"
              href={waHref(t.phone, "Dear " + t.name + ", please submit today's worklog and class attendance. — Principal, ABC School")}
              onClick={() => toast("WhatsApp opened", "Message to " + t.name)}>
              <MessageCircle size={16} /> WhatsApp
            </a>
            <button className="btn btn-primary" onClick={() => toast("Task assigned", "Prototype — task form not built")}>Assign Task</button>
          </div>
        )}
      </div>
      <div className="rule my-5" />

      <div className="mb-5">
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

      <div className="flex gap-0.5 border-b-2 border-divider mb-[22px] flex-wrap">
        {TABS.map(x => (
          <button key={x} onClick={() => setTab(x)}
            className={"px-[18px] h-11 border-0 border-b-[3px] bg-transparent text-[14.5px] cursor-pointer " +
              (tab === x ? "border-accent text-accent-700 font-bold" : "border-transparent text-muted font-medium hover:text-accent-700")}>
            {x}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-5">
          <Info title="Employment" rows={[
            ["Employee ID", t.empId],
            ["Department", t.department],
            ["Joined on", t.joinedOn],
            ["Experience", t.experienceYears + " years"],
            ["Status", t.status],
            ["Class teacher of", t.classTeacherOf ?? "—"]
          ]} />
          <Info title="Qualification & contact" rows={[
            ["Qualification", t.qualification],
            ["Subject", t.subject],
            ["Classes handled", t.classes.join(", ")],
            ["Phone", t.phone],
            ["Email", t.email]
          ]} />
          <section className="panel p-5">
            <h2 className="text-[17px] m-0 mb-4">Class performance</h2>
            <div className="flex flex-col gap-3.5">
              {t.classes.map(c => {
                const last = log.filter(w => w.cls === c)[0];
                return (
                  <div key={c} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "56px 1fr 33px" }}>
                    <span className="text-[14px] font-semibold">{c}</span>
                    <Bar pct={last ? last.syllabusPct : 45} />
                    <span className="text-[13.5px] text-right text-muted">{last ? last.syllabusPct : 45}%</span>
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-line my-4" />
            <div className="grid grid-cols-2 gap-4 text-[14px]">
              <div><div className="kicker">Exams graded</div><div className="font-extrabold text-[22px]">{t.examsGraded}</div></div>
              <div><div className="kicker">Worklog entries</div><div className="font-extrabold text-[22px]">{log.length}</div></div>
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="text-[17px] m-0 mb-4">Tasks</h2>
            {state.tasks.filter(k => k.teacherId === t.id).length === 0
              ? <p className="text-[14px] text-muted m-0">No tasks assigned.</p>
              : (
                <div className="flex flex-col gap-2.5">
                  {state.tasks.filter(k => k.teacherId === t.id).map(k => (
                    <div key={k.id} className="flex items-center gap-3 border border-line px-3.5 py-3">
                      <span className="flex-1 text-[14px]">{k.title}</span>
                      <span className="text-[12.5px] text-muted">due {k.due}</span>
                      <Badge tone={k.status === "Done" ? "ok" : "warn"}>{k.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {tab === "Timetable" && (
        <div className="panel overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b-2 border-divider">
                <th className="th w-[70px]">Day</th>
                {[1, 2, 3, 4, 5, 6, 7].map(p => <th key={p} className="th">Period {p}</th>)}
              </tr>
            </thead>
            <tbody>
              {t.timetable.map(row => (
                <tr key={row.day} className="border-b border-line">
                  <td className="td font-bold">{row.day}</td>
                  {row.slots.map((s, i) => (
                    <td key={i} className={"td text-[13px] " + (s ? "font-semibold" : "text-muted")}>
                      {s ?? "Free"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-[13px] text-muted border-t border-line">
            {t.periodsPerWeek} teaching periods a week · {DAYS.length}-day week
          </div>
        </div>
      )}

      {tab === "Worklog" && (
        <div className="panel">
          <DataTable head={["Date", "Period", "Class", "Subject", "Topic covered", "Attendance", "Syllabus"]}>
            {log.map(w => (
              <tr key={w.id} className="border-b border-line align-top">
                <td className="td text-muted whitespace-nowrap">{w.date}</td>
                <td className="td">P{w.period}</td>
                <td className="td font-semibold">{w.cls}</td>
                <td className="td">{w.subject}</td>
                <td className="td">
                  <div className="font-semibold text-[14px]">{w.topic}</div>
                  {w.remarks && <div className="text-[12.5px] text-muted">{w.remarks}</div>}
                </td>
                <td className="td">{w.attendanceMarked ? <Badge tone="ok">Marked</Badge> : <Badge tone="warn">Not marked</Badge>}</td>
                <td className="td w-[120px]"><Bar pct={w.syllabusPct} /><div className="text-[12.5px] text-muted mt-1">{w.syllabusPct}%</div></td>
              </tr>
            ))}
          </DataTable>
          {log.length === 0 && <EmptyState title="No worklog entries yet" body="Entries appear here as periods are logged." />}
        </div>
      )}

      {tab === "Leave" && (
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <StatGrid cols={2} items={[
              { label: "Casual leave", value: t.leave.casualBalance + " left", sub: t.leave.casualTaken + " of 12 taken" },
              { label: "Sick leave", value: t.leave.sickBalance + " left", sub: t.leave.sickTaken + " of 8 taken" }
            ]} />
            <section className="panel p-5 mt-5">
              <h2 className="text-[17px] m-0 mb-3.5">Recent leave</h2>
              <DataTable head={["From", "Days", "Type", "Reason", "Status"]}>
                {[
                  ["02 Aug 2026", "1", "Casual", "Family function", "Approved"],
                  ["18 Jul 2026", "2", "Sick", "Fever", "Approved"],
                  ["06 Jun 2026", "1", "Casual", "Personal", "Approved"]
                ].map(r => (
                  <tr key={r[0]} className="border-b border-line">
                    <td className="td">{r[0]}</td>
                    <td className="td">{r[1]}</td>
                    <td className="td">{r[2]}</td>
                    <td className="td text-muted">{r[3]}</td>
                    <td className="td"><Badge tone="ok">{r[4]}</Badge></td>
                  </tr>
                ))}
              </DataTable>
            </section>
          </div>
          <section className="panel p-5">
            <h2 className="text-[17px] m-0 mb-3.5">Attendance this term</h2>
            <div className="flex flex-col gap-3.5">
              {[["June", 98], ["July", 94], ["August", t.attendance]].map(([m, p]) => (
                <div key={m as string} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "80px 1fr 33px" }}>
                  <span className="text-[14px]">{m}</span>
                  <Bar pct={p as number} color="#15803d" />
                  <span className="text-[13.5px] text-right text-muted">{p}%</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-muted mt-5 mb-0">Last leave taken {t.leave.lastLeave}.</p>
          </section>
        </div>
      )}

      {tab === "Salary" && (
        <div className="max-w-[720px]">
          <StatGrid cols={2} items={[
            { label: "Monthly gross", value: inr(t.salary.basic + t.salary.hra + t.salary.allowances) },
            { label: "Monthly net", value: inr(net), color: "#15803d" }
          ]} />
          <section className="panel mt-5">
            <div className="sectionhead"><h2 className="text-[18px] m-0">Break-up</h2></div>
            <DataTable head={["Component", "Amount"]}>
              {[
                ["Basic pay", inr(t.salary.basic)],
                ["House rent allowance", inr(t.salary.hra)],
                ["Other allowances", inr(t.salary.allowances)],
                ["Deductions (PF, professional tax)", "− " + inr(t.salary.deductions)],
                ["Net payable", inr(net)]
              ].map(([k, v], i) => (
                <tr key={k} className="border-b border-line">
                  <td className={"td " + (i === 4 ? "font-bold" : "")}>{k}</td>
                  <td className={"td text-right " + (i === 4 ? "font-bold" : "")}>{v}</td>
                </tr>
              ))}
            </DataTable>
            <div className="px-4 py-3 text-[13px] text-muted border-t border-line">
              Visible to the principal and to {own ? "you" : "this teacher"} only.
            </div>
          </section>
        </div>
      )}

      {tab === "Documents" && (
        <section className="panel p-5 max-w-[720px]">
          <h2 className="text-[17px] m-0 mb-4">Staff documents</h2>
          <div className="flex flex-col gap-2.5">
            {t.documents.map(d => (
              <div key={d.name} className="flex items-center gap-3 border border-line px-3.5 py-3">
                <FileText size={18} className="text-muted shrink-0" />
                <div className="flex-1">
                  <div className="text-[14.5px] font-semibold">{d.name}</div>
                  <div className="text-[12.5px] text-muted">{d.meta}</div>
                </div>
                <span className="text-[12.5px] text-ok font-semibold">Verified</span>
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
      <h2 className="text-[17px] m-0 mb-3.5">{title}</h2>
      <div className="grid gap-x-5 gap-y-2.5 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <span className="text-muted">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
