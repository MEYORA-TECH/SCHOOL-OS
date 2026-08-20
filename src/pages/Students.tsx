import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Phone, Plus, Users, Check, Pencil } from "lucide-react";
import { CLASS_LIST, Student, inr, initials, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import {
  Avatar, BackLink, Badge, Bar, DataTable, EmptyState, Field, PageHeader, Row, SearchInput, StatGrid, Tabs
} from "../ui";

function attColor(a: number) {
  return a >= 90 ? "#15803d" : a >= 80 ? "#b45309" : "#be123c";
}

export function Students() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [cls, setCls] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => state.students.filter(s => {
    if (cls !== "All" && s.cls !== cls) return false;
    if (status !== "All" && s.status !== status) return false;
    const hay = (s.name + " " + s.adm + " " + s.father + " " + s.phone).toLowerCase();
    return !q.trim() || hay.includes(q.trim().toLowerCase());
  }), [state.students, q, cls, status]);

  return (
    <>
      <PageHeader
        title="Students"
        sub="Manage student records, attendance and fees in one place."
        action={<Link to="/students/new" className="btn btn-primary"><Plus size={16} /> Add Student</Link>}
      />

      <div className="panel p-3 mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, admission number or parent" className="flex-1 min-w-[240px]" />
        <select value={cls} onChange={e => setCls(e.target.value)} className="select w-auto min-w-[130px]" aria-label="Filter by class">
          {["All", ...CLASS_LIST].map(c => <option key={c}>{c === "All" ? "All classes" : c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="select w-auto min-w-[120px]" aria-label="Filter by status">
          {["All", "Active", "Inactive"].map(c => <option key={c}>{c === "All" ? "All status" : c}</option>)}
        </select>
        <span className="text-[13px] text-muted ml-auto pr-1">
          <strong className="text-ink">{rows.length}</strong> of {state.students.length} students
        </span>
      </div>

      <div className="panel overflow-hidden">
        <DataTable head={["Student", "Class", "Parent", "Phone", { label: "Attendance", align: "center" }, { label: "Fees", align: "center" }, { label: "", align: "right" }]} minWidth={840}>
          {rows.map(s => {
            const pending = s.feeTotal - s.feePaid;
            return (
              <Row key={s.id} onClick={undefined}>
                <td className="td">
                  <Link to={`/students/${s.id}`} className="flex items-center gap-3 group">
                    <Avatar name={s.name} />
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-ink group-hover:text-accent-700 transition-colors truncate">{s.name}</div>
                      <div className="text-[12px] text-muted">{s.adm}</div>
                    </div>
                  </Link>
                </td>
                <td className="td">{s.cls}</td>
                <td className="td">{s.father}</td>
                <td className="td text-muted tabular-nums">{s.phone}</td>
                <td className="td text-center font-semibold tabular-nums" style={{ color: attColor(s.attendance) }}>{s.attendance}%</td>
                <td className="td text-center">{pending > 0 ? <Badge tone="warn" dot>Pending</Badge> : <Badge tone="ok" dot>Paid</Badge>}</td>
                <td className="td text-right">
                  <Link to={`/students/${s.id}`} className="link">View profile</Link>
                </td>
              </Row>
            );
          })}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState
            icon={Users}
            title="No students found"
            body="No student matches your search or filters. Try broadening them, or add a new student."
            action={<button className="btn btn-secondary" onClick={() => { setQ(""); setCls("All"); setStatus("All"); }}>Clear filters</button>}
          />
        )}
      </div>
    </>
  );
}

const STUDENT_FIELDS: [string, string, string?][] = [
  ["name", "Student name"], ["dob", "Date of birth", "date"], ["gender", "Gender"], ["blood", "Blood group"],
  ["adm", "Admission number"], ["admDate", "Admission date", "date"], ["cls", "Class (e.g. 9-A)"], ["sec", "Section"]
];
const PARENT_FIELDS: [string, string][] = [
  ["father", "Father's name"], ["mother", "Mother's name"], ["phone", "Phone"], ["whatsapp", "WhatsApp number"], ["email", "Email"]
];
const ADDRESS_FIELDS: [string, string][] = [["address", "Address"], ["city", "City"], ["pin", "Pincode"]];

const SECTIONS = [
  { n: 1, title: "Student information", note: "Name and class are required.", fields: STUDENT_FIELDS },
  { n: 2, title: "Parent information", note: null, fields: PARENT_FIELDS as [string, string, string?][] },
  { n: 3, title: "Address", note: null, fields: ADDRESS_FIELDS as [string, string, string?][] }
];

export function AddStudent() {
  const { state, dispatch, toast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function save() {
    if (!form.name || !form.cls) { toast("Please enter name and class", "Both fields are required"); return; }
    const student: Student = {
      id: "s" + Date.now(), adm: form.adm || "STU" + (1038 + state.students.length),
      name: form.name, cls: form.cls, sec: form.cls.split("-")[1] || "A",
      father: form.father || "—", mother: form.mother || "—",
      phone: form.phone || "98410 00000", whatsapp: form.whatsapp || form.phone || "98410 00000",
      email: form.email || "parent@example.com", attendance: 100, feeTotal: 54000, feePaid: 0,
      dob: form.dob || "2012-01-01", gender: form.gender || "Male", blood: form.blood || "O+",
      status: "Active", marks: { Maths: 0, Science: 0, English: 0, Social: 0, Tamil: 0 },
      feeTerms: [
        { term: "Term 1", amount: 18000, paid: 0, due: "15 Jun 2026" },
        { term: "Term 2", amount: 18000, paid: 0, due: "15 Sep 2026" },
        { term: "Term 3", amount: 18000, paid: 0, due: "15 Dec 2026" }
      ],
      admDate: form.admDate || "2026-08-18", address: form.address || "—",
      city: form.city || "Chennai", pin: form.pin || "600001", payments: []
    };
    dispatch({ type: "addStudent", student });
    toast("Student added successfully", `${student.name} · Class ${student.cls}`);
    navigate("/students");
  }

  return (
    <>
      <BackLink to="/students">Back to Students</BackLink>
      <PageHeader title="Add Student" sub="Only the basics — you can add more details later from the student profile." />

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start max-w-[1000px]">
        {/* Section rail — reads as steps without a rigid wizard */}
        <nav className="hidden lg:block sticky top-24">
          <div className="flex flex-col gap-1">
            {SECTIONS.map(s => (
              <a key={s.n} href={"#section-" + s.n}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] text-body hover:bg-subtle transition-colors">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-accent-50 text-accent-700 text-[12px] font-bold shrink-0">{s.n}</span>
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-5">
          {SECTIONS.map(s => (
            <section key={s.n} id={"section-" + s.n} className="card p-6 scroll-mt-24">
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-accent-50 text-accent-700 text-[12px] font-bold shrink-0 lg:hidden">{s.n}</span>
                <h2 className="text-h3 font-display font-bold text-ink">{s.title}</h2>
              </div>
              {s.note && <p className="text-[13px] text-muted m-0 mb-4">{s.note}</p>}
              <div className={"grid sm:grid-cols-2 gap-4 " + (s.note ? "" : "mt-4")}>
                {s.fields.map(([k, label, type]) => (
                  <Field key={k} label={label} required={k === "name" || k === "cls"}>
                    <input className="input" type={type || "text"} value={form[k] || ""} onChange={e => set(k, e.target.value)} />
                  </Field>
                ))}
              </div>
            </section>
          ))}

          <div className="sticky bottom-0 -mx-1 px-1 py-3 bg-canvas/80 backdrop-blur-sm flex gap-3 border-t border-line">
            <button className="btn btn-primary" onClick={save}>Save Student</button>
            <button className="btn btn-secondary" onClick={() => navigate("/students")}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

const TABS = ["Overview", "Attendance", "Fees", "Exams"] as const;

export function StudentProfile() {
  const { id } = useParams();
  const { state, toast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const s = state.students.find(x => x.id === id);
  if (!s) return <EmptyState title="Student not found" body="This student may have been removed." />;

  const pending = s.feeTotal - s.feePaid;
  const avg = Math.round(Object.values(s.marks).reduce((a, b) => a + b, 0) / Object.keys(s.marks).length);

  return (
    <>
      <BackLink to="/students">Back to Students</BackLink>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <span className="h-16 w-16 rounded-full bg-accent-100 text-accent-700 grid place-items-center font-display font-bold text-[22px] shrink-0">{initials(s.name)}</span>
            <div className="min-w-0">
              <h1 className="text-h1 font-display font-bold text-ink truncate">{s.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                <span>Class {s.cls}</span><span className="text-line-strong">·</span>
                <span>Adm. {s.adm}</span><span className="text-line-strong">·</span>
                <Badge tone={s.status === "Active" ? "ok" : "neutral"} dot>{s.status}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <a className="btn btn-secondary" href={phoneHref(s.phone)}><Phone size={16} /> Call</a>
            <a className="btn btn-wa" target="_blank" rel="noreferrer"
              href={waHref(s.whatsapp, "Dear " + s.father + ", a message from ABC Matriculation Higher Secondary School regarding " + s.name + " (" + s.cls + ").")}
              onClick={() => toast("WhatsApp opened", "Message to " + s.father)}>
              <MessageCircle size={16} /> WhatsApp
            </a>
            <button className="btn btn-primary" onClick={() => toast("Edit mode", "Prototype — fields are editable in Add Student")}>
              <Pencil size={15} /> Edit
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <StatGrid
          cols={3}
          items={[
            { label: "Attendance", value: s.attendance + "%" },
            { label: "Fees pending", value: pending > 0 ? inr(pending) : "—", color: pending > 0 ? "#b45309" : "#15803d" },
            { label: "Average marks", value: avg + "%" }
          ]}
        />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid md:grid-cols-2 gap-5">
          <InfoCard title="Personal information" rows={[["Date of birth", s.dob], ["Gender", s.gender], ["Blood group", s.blood], ["Admission date", s.admDate], ["Class", s.cls]]} />
          <InfoCard title="Parent information" rows={[["Father", s.father], ["Mother", s.mother], ["Phone", s.phone], ["WhatsApp", s.whatsapp], ["Email", s.email]]} />
          <InfoCard title="Contact information" rows={[["Address", s.address], ["City", s.city], ["Pincode", s.pin]]} />
          <section className="panel p-5">
            <h2 className="text-h3 font-display font-bold text-ink mb-4">Recent activity</h2>
            <div className="flex flex-col gap-3.5">
              {[
                ["Fee payment received", s.payments.length ? s.payments[s.payments.length - 1].date : "—"],
                ["Attendance marked present", "Today, 9:05 AM"],
                ["Mathematics homework submitted", "Yesterday"],
                ["Term 1 report card generated", "12 Aug 2026"]
              ].map(([text, meta]) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="grid place-items-center h-6 w-6 rounded-full bg-ok-bg text-ok mt-0.5 shrink-0"><Check size={13} /></span>
                  <div>
                    <div className="text-[13.5px] text-ink">{text}</div>
                    <div className="text-[12px] text-muted">{meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "Attendance" && (
        <section className="panel p-5 max-w-[640px]">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Month-wise attendance</h2>
          <div className="flex flex-col gap-3.5">
            {[["April", 96], ["May", 92], ["June", 95], ["July", 93], ["August", s.attendance]].map(([m, p]) => (
              <div key={m as string} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "80px 1fr 50px" }}>
                <span className="text-[13.5px] text-body">{m}</span>
                <Bar pct={p as number} color="#16a34a" />
                <span className="text-[13px] text-right text-muted tabular-nums">{p}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Fees" && (
        <section className="panel p-5 max-w-[760px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h3 font-display font-bold text-ink">Fee summary</h2>
            <Link to={`/fees/${s.id}`} className="link">Open in Fees</Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {([["Total fee", inr(s.feeTotal), ""], ["Paid", inr(s.feePaid), "#15803d"], ["Pending", pending > 0 ? inr(pending) : "—", "#b45309"]] as [string, string, string][]).map(([l, v, c]) => (
              <div key={l}>
                <div className="kicker mb-1.5">{l}</div>
                <div className="font-display font-bold text-[22px] text-ink" style={c ? { color: c } : undefined}>{v}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Exams" && (
        <section className="panel p-5 max-w-[640px]">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Term 1 marks</h2>
          <div className="flex flex-col gap-3.5">
            {Object.entries(s.marks).map(([sub, score]) => (
              <div key={sub} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "120px 1fr 80px" }}>
                <span className="text-[13.5px] text-body">{sub}</span>
                <Bar pct={score} color={score >= 80 ? "#16a34a" : score >= 60 ? "#2563eb" : "#d97706"} />
                <span className="text-[13px] text-right text-muted tabular-nums">{score} / 100</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, string][] }) {
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
