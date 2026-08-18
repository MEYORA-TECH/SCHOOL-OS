import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Phone, Plus, Search, Check } from "lucide-react";
import { CLASS_LIST, Student, inr, initials, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import { Avatar, BackLink, Badge, Bar, DataTable, EmptyState, Field, PageHeader, StatGrid } from "../ui";

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
        sub="Manage student information in one place."
        action={<Link to="/students/new" className="btn btn-primary no-underline hover:no-underline text-white"><Plus size={16} /> Add Student</Link>}
      />

      <div className="flex gap-3 items-center flex-wrap mb-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-2 border border-line px-3 h-[42px] bg-white">
          <Search size={16} className="text-muted" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by student name, admission number or parent"
            className="flex-1 border-0 bg-transparent text-[14px] outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Class
          <select value={cls} onChange={e => setCls(e.target.value)} className="h-[42px] border border-line bg-white text-[14px] px-2.5">
            {["All", ...CLASS_LIST].map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Status
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-[42px] border border-line bg-white text-[14px] px-2.5">
            {["All", "Active", "Inactive"].map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <span className="text-[13px] text-muted">{rows.length} of {state.students.length} students</span>
      </div>

      <div className="panel">
        <DataTable head={["Admission No.", "Student", "Class", "Parent", "Phone", "Attendance", "Fees", "Action"]}>
          {rows.map(s => {
            const pending = s.feeTotal - s.feePaid;
            return (
              <tr key={s.id} className="border-b border-line hover:bg-accent-100">
                <td className="td text-muted text-[13.5px]">{s.adm}</td>
                <td className="td">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} />
                    <span className="text-[14.5px] font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="td">{s.cls}</td>
                <td className="td">{s.father}</td>
                <td className="td text-muted">{s.phone}</td>
                <td className="td font-semibold" style={{ color: s.attendance >= 90 ? "#15803d" : s.attendance >= 80 ? "#b45309" : "#b91c1c" }}>
                  {s.attendance}%
                </td>
                <td className="td">{pending > 0 ? <Badge tone="warn">Pending</Badge> : <Badge tone="ok">Paid</Badge>}</td>
                <td className="td"><Link to={`/students/${s.id}`} className="text-[13.5px] font-semibold underline">View profile</Link></td>
              </tr>
            );
          })}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState
            title="No students found"
            body="Try changing your search or filters."
            action={<button className="btn btn-secondary" onClick={() => { setQ(""); setCls("All"); setStatus("All"); }}>Clear Filters</button>}
          />
        )}
      </div>
    </>
  );
}

const STUDENT_FIELDS: [keyof Student | string, string, string?][] = [
  ["name", "Student name"], ["dob", "Date of birth", "date"], ["gender", "Gender"], ["blood", "Blood group"],
  ["adm", "Admission number"], ["admDate", "Admission date", "date"], ["cls", "Class (e.g. 9-A)"], ["sec", "Section"]
];
const PARENT_FIELDS: [string, string][] = [
  ["father", "Father's name"], ["mother", "Mother's name"], ["phone", "Phone"], ["whatsapp", "WhatsApp number"], ["email", "Email"]
];
const ADDRESS_FIELDS: [string, string][] = [["address", "Address"], ["city", "City"], ["pin", "Pincode"]];

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

  const section = (title: string, note: string | null, fields: [string, string, string?][]) => (
    <section className="panel p-[22px]">
      <h2 className="text-[18px] m-0 mb-1">{title}</h2>
      {note && <p className="text-[13.5px] text-muted m-0 mb-[18px]">{note}</p>}
      <div className={"grid grid-cols-2 gap-4" + (note ? "" : " mt-[18px]")}>
        {fields.map(([k, label, type]) => (
          <Field key={k} label={label}>
            <input className="input" type={type || "text"} value={form[k] || ""} onChange={e => set(k, e.target.value)} />
          </Field>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <BackLink to="/students">Back to Students</BackLink>
      <PageHeader title="Add Student" sub="Only the basics — you can add more details later." />
      <div className="max-w-[920px] flex flex-col gap-5">
        {section("Student information", "Name and class are required.", STUDENT_FIELDS as [string, string, string?][])}
        {section("Parent information", null, PARENT_FIELDS)}
        {section("Address", null, ADDRESS_FIELDS)}
        <div className="flex gap-3 pb-5">
          <button className="btn btn-primary h-[46px] px-[22px] text-[14.5px]" onClick={save}>Save Student</button>
          <button className="btn btn-secondary h-[46px] px-[22px] text-[14.5px]" onClick={() => navigate("/students")}>Cancel</button>
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
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-[18px]">
          <span className="w-[66px] h-[66px] bg-accent-200 text-accent-700 grid place-items-center font-extrabold text-[24px]">{initials(s.name)}</span>
          <div>
            <h1 className="text-[30px] mb-1.5">{s.name}</h1>
            <div className="text-[14px] text-muted">Class {s.cls} &nbsp;·&nbsp; Admission No. {s.adm} &nbsp;·&nbsp; {s.status}</div>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <a className="btn btn-secondary text-ink no-underline hover:no-underline" href={phoneHref(s.phone)}><Phone size={16} /> Call Parent</a>
          <a
            className="btn btn-wa text-white no-underline hover:no-underline"
            target="_blank"
            rel="noreferrer"
            href={waHref(s.whatsapp, "Dear " + s.father + ", a message from ABC Matriculation Higher Secondary School regarding " + s.name + " (" + s.cls + ").")}
            onClick={() => toast("WhatsApp opened", "Message to " + s.father)}
          >
            <MessageCircle size={16} /> WhatsApp Parent
          </a>
          <button className="btn btn-secondary" onClick={() => navigate("/communication")}>Send Message</button>
          <button className="btn btn-primary" onClick={() => toast("Edit mode", "Prototype — fields are editable in Add Student")}>Edit Student</button>
        </div>
      </div>
      <div className="rule my-5" />

      <div className="mb-5">
        <StatGrid
          cols={3}
          items={[
            { label: "Attendance", value: s.attendance + "%" },
            { label: "Fees pending", value: pending > 0 ? inr(pending) : "—", color: pending > 0 ? "#b45309" : "#15803d" },
            { label: "Average marks", value: avg + "%" }
          ]}
        />
      </div>

      <div className="flex gap-0.5 border-b-2 border-divider mb-[22px]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={"px-[18px] py-2.5 border-0 border-b-[3px] bg-transparent text-[14.5px] cursor-pointer " +
              (tab === t ? "border-accent text-accent-700 font-bold" : "border-transparent text-muted font-medium hover:text-accent-700")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-5">
          <InfoCard title="Personal information" rows={[["Date of birth", s.dob], ["Gender", s.gender], ["Blood group", s.blood], ["Admission date", s.admDate], ["Class", s.cls]]} />
          <InfoCard title="Parent information" rows={[["Father", s.father], ["Mother", s.mother], ["Phone", s.phone], ["WhatsApp", s.whatsapp], ["Email", s.email]]} />
          <InfoCard title="Contact information" rows={[["Address", s.address], ["City", s.city], ["Pincode", s.pin]]} />
          <section className="panel p-5">
            <h2 className="text-[17px] m-0 mb-3.5">Recent activity</h2>
            <div className="flex flex-col gap-3">
              {[
                ["Fee payment received", s.payments.length ? s.payments[s.payments.length - 1].date : "—"],
                ["Attendance marked present", "Today, 9:05 AM"],
                ["Mathematics homework submitted", "Yesterday"],
                ["Term 1 report card generated", "12 Aug 2026"]
              ].map(([text, meta]) => (
                <div key={text} className="flex items-start gap-3">
                  <Check size={15} className="text-ok mt-1 shrink-0" />
                  <div>
                    <div className="text-[14px]">{text}</div>
                    <div className="text-[12.5px] text-muted">{meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "Attendance" && (
        <section className="panel p-5 max-w-[640px]">
          <h2 className="text-[17px] m-0 mb-4">Month-wise attendance</h2>
          <div className="flex flex-col gap-3">
            {[["April", 96], ["May", 92], ["June", 95], ["July", 93], ["August", s.attendance]].map(([m, p]) => (
              <div key={m as string} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "80px 1fr 50px" }}>
                <span className="text-[14px]">{m}</span>
                <Bar pct={p as number} color="#15803d" />
                <span className="text-[13.5px] text-right text-muted">{p}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Fees" && (
        <section className="panel p-5 max-w-[760px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[17px] m-0">Fee summary</h2>
            <Link to={`/fees/${s.id}`} className="text-[13.5px] font-semibold underline">Open in Fees</Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[["Total fee", inr(s.feeTotal), ""], ["Paid", inr(s.feePaid), "#15803d"], ["Pending", pending > 0 ? inr(pending) : "—", "#b45309"]].map(([l, v, c]) => (
              <div key={l}>
                <div className="text-muted text-[12.5px]">{l}</div>
                <div className="font-extrabold text-[22px]" style={c ? { color: c } : undefined}>{v}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Exams" && (
        <section className="panel p-5 max-w-[640px]">
          <h2 className="text-[17px] m-0 mb-4">Term 1 marks</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(s.marks).map(([sub, score]) => (
              <div key={sub} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "120px 1fr 80px" }}>
                <span className="text-[14px]">{sub}</span>
                <Bar pct={score} />
                <span className="text-[13.5px] text-right text-muted">{score} / 100</span>
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
