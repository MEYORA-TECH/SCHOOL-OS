import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { CLASS_LIST, SCHOOL_NAME, SUBJECTS, grade } from "../data";
import { useApp } from "../store";
import { BackLink, Badge, DataTable, EmptyState, PageHeader } from "../ui";

const EXAMS = [
  { name: "Term 1 Examination", classes: "Classes 6–10", status: "Completed" as const, dates: "05 Aug – 12 Aug 2026" },
  { name: "Unit Test 2", classes: "Classes 6–10", status: "Upcoming" as const, dates: "02 Sep – 05 Sep 2026" },
  { name: "Half Yearly Examination", classes: "Classes 1–12", status: "Upcoming" as const, dates: "10 Oct – 20 Oct 2026" }
];

export function Exams() {
  const { state, toast } = useApp();
  const canCreate = state.role === "principal";
  return (
    <>
      <PageHeader
        title="Exams"
        sub="Schedules, marks entry and report cards."
        action={canCreate
          ? <button className="btn btn-primary" onClick={() => toast("Exam created", "Prototype — schedule not persisted")}>Create Exam</button>
          : undefined}
      />
      <div className="grid grid-cols-3 gap-4">
        {EXAMS.map(e => (
          <Link key={e.name} to="/exams/results"
            className="panel p-5 flex flex-col gap-2 text-ink no-underline hover:no-underline hover:border-accent">
            <Badge tone={e.status === "Completed" ? "ok" : "accent"}>{e.status}</Badge>
            <span className="font-extrabold text-[19px] mt-1">{e.name}</span>
            <span className="text-[14px] text-muted">{e.classes}</span>
            <span className="text-[13px] text-muted">{e.dates}</span>
            <span className="text-[13.5px] text-accent font-bold mt-1.5">Open results →</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ExamResults() {
  const { state, dispatch, toast, me } = useApp();
  const options = me ? me.classes : CLASS_LIST;
  const [cls, setCls] = useState(options[0]);
  const [edits, setEdits] = useState<Record<string, Record<string, number>>>({});

  const roll = state.students.filter(s => s.cls === cls);

  function setMark(id: string, subject: string, raw: string) {
    const n = Math.min(100, parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0);
    setEdits(e => ({ ...e, [id]: { ...(e[id] || {}), [subject]: n } }));
  }

  function save() {
    dispatch({ type: "saveMarks", edits });
    setEdits({});
    toast("Marks saved successfully", "Results and report cards updated");
  }

  return (
    <>
      <BackLink to="/exams">Back to Exams</BackLink>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[30px] mb-1.5">Term 1 Examination</h1>
          <p className="m-0 text-[14.5px] text-muted">Enter marks out of 100. Totals and grades update as you type.</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-[13px] text-muted">
            Class
            <select className="select w-[120px]" value={cls} onChange={e => setCls(e.target.value)}>
              {options.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" onClick={save} disabled={Object.keys(edits).length === 0}>Save Marks</button>
        </div>
      </div>
      <div className="rule my-5" />

      <div className="panel">
        <DataTable head={["Student", ...SUBJECTS, "Total", "Average", "Grade", "Report card"]}>
          {roll.map(s => {
            const vals = SUBJECTS.map(sub => edits[s.id]?.[sub] ?? s.marks[sub] ?? 0);
            const total = vals.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / SUBJECTS.length);
            return (
              <tr key={s.id} className="border-b border-line">
                <td className="td font-semibold text-[14.5px]">{s.name}</td>
                {SUBJECTS.map((sub, i) => (
                  <td key={sub} className="px-3 py-2">
                    <input
                      className="w-[58px] h-11 border border-line bg-white text-[14.5px] text-center"
                      value={String(vals[i])}
                      onChange={e => setMark(s.id, sub, e.target.value)}
                      aria-label={sub + " marks for " + s.name}
                    />
                  </td>
                ))}
                <td className="td font-semibold">{total}</td>
                <td className="td">{avg}%</td>
                <td className="td font-bold" style={{ color: avg >= 80 ? "#15803d" : avg >= 60 ? "#b45309" : "#b91c1c" }}>{grade(avg)}</td>
                <td className="td"><Link to={`/exams/report/${s.id}`} className="text-[13.5px] font-semibold underline">Preview</Link></td>
              </tr>
            );
          })}
        </DataTable>
        {roll.length === 0 && <EmptyState title="No students in this class" body="Pick another class to enter marks." />}
      </div>
    </>
  );
}

export function ReportCard() {
  const { id } = useParams();
  const { state, toast } = useApp();
  const s = state.students.find(x => x.id === id);
  if (!s) return <EmptyState title="Student not found" body="This record may have been removed." />;

  const rows = SUBJECTS.map(sub => ({ sub, score: s.marks[sub] ?? 0 }));
  const total = rows.reduce((a, r) => a + r.score, 0);
  const avg = Math.round(total / SUBJECTS.length);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <BackLink to="/exams">Back to Exams</BackLink>
        <button className="btn btn-secondary" onClick={() => toast("Sent to printer", "Prototype — no file generated")}>
          <Printer size={16} /> Download / Print
        </button>
      </div>

      <div className="panel max-w-[840px] mx-auto px-12 py-11">
        <div className="flex items-center gap-4 pb-5 border-b-2 border-divider">
          <span className="w-[52px] h-[52px] bg-accent text-white grid place-items-center font-extrabold text-[22px]">S</span>
          <div>
            <div className="font-extrabold text-[22px]">{SCHOOL_NAME}</div>
            <div className="text-[13px] text-muted">Academic Year 2026–27 · Term 1 Examination Report Card</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[18px] py-[22px] border-b border-line">
          {[["Student", s.name], ["Class", s.cls], ["Roll / Admission No.", s.adm]].map(([k, v]) => (
            <div key={k}>
              <div className="kicker">{k}</div>
              <div className="text-[16px] font-bold">{v}</div>
            </div>
          ))}
        </div>

        <table className="w-full border-collapse my-[22px]">
          <thead>
            <tr className="border-b-2 border-divider">
              <th className="th px-0">Subject</th>
              <th className="th px-0 text-right">Marks</th>
              <th className="th px-0 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.sub} className="border-b border-line">
                <td className="py-3 text-[14.5px]">{r.sub}</td>
                <td className="py-3 text-[14.5px] text-right font-semibold">{r.score} / 100</td>
                <td className="py-3 text-[14.5px] text-right">{grade(r.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-4 gap-[18px] py-[18px] border-t-2 border-divider border-b border-line">
          {[
            ["Total", total + " / 500"], ["Average", avg + "%"],
            ["Attendance", s.attendance + "%"], ["Overall grade", grade(avg)]
          ].map(([k, v], i) => (
            <div key={k}>
              <div className="kicker">{k}</div>
              <div className={"font-extrabold text-[20px] " + (i === 3 ? "text-accent" : "")}>{v}</div>
            </div>
          ))}
        </div>

        <div className="py-[22px]">
          <div className="kicker mb-1.5">Teacher's remarks</div>
          <p className="text-[14.5px] m-0">
            Consistent effort through the term. Should focus a little more on written practice in Science.
          </p>
        </div>
        <div className="flex justify-between pt-11">
          <div className="border-t border-ink pt-2 text-[13px] w-[200px]">Class teacher</div>
          <div className="border-t border-ink pt-2 text-[13px] w-[200px] text-right">Principal</div>
        </div>
      </div>
    </>
  );
}
