import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer, ArrowRight } from "lucide-react";
import { CLASS_LIST, SCHOOL_NAME, SUBJECTS, grade } from "../data";
import { useApp } from "../store";
import { BackLink, Badge, DataTable, EmptyState, PageHeader, Row } from "../ui";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMS.map(e => (
          <Link key={e.name} to="/exams/results"
            className="card p-5 flex flex-col gap-2.5 hover:shadow-md hover:border-line-strong transition-all group">
            <div className="flex items-center justify-between">
              <Badge tone={e.status === "Completed" ? "ok" : "accent"} dot>{e.status}</Badge>
            </div>
            <span className="font-display font-bold text-h2 text-ink mt-1">{e.name}</span>
            <span className="text-[13.5px] text-body">{e.classes}</span>
            <span className="text-[12.5px] text-muted">{e.dates}</span>
            <span className="inline-flex items-center gap-1 text-[13px] text-accent font-semibold mt-1.5 group-hover:gap-2 transition-all">
              Open results <ArrowRight size={14} />
            </span>
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
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-display font-bold text-ink">Term 1 Examination</h1>
          <p className="mt-1 text-[14px] text-muted">Enter marks out of 100. Totals and grades update as you type.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select className="select w-auto min-w-[120px]" value={cls} onChange={e => setCls(e.target.value)} aria-label="Class">
            {options.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={save} disabled={Object.keys(edits).length === 0}>
            Save Marks{Object.keys(edits).length ? ` (${Object.keys(edits).length})` : ""}
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <DataTable head={["Student", ...SUBJECTS, { label: "Total", align: "right" }, { label: "Avg", align: "right" }, { label: "Grade", align: "center" }, { label: "", align: "right" }]} minWidth={900}>
          {roll.map(s => {
            const vals = SUBJECTS.map(sub => edits[s.id]?.[sub] ?? s.marks[sub] ?? 0);
            const total = vals.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / SUBJECTS.length);
            return (
              <Row key={s.id}>
                <td className="td font-semibold text-ink whitespace-nowrap">{s.name}</td>
                {SUBJECTS.map((sub, i) => (
                  <td key={sub} className="px-2 py-2">
                    <input
                      className="w-[56px] h-9 rounded-md border border-line bg-surface text-[14px] text-center text-ink tabular-nums transition-all hover:border-line-strong focus:border-accent-400 focus:shadow-focus"
                      value={String(vals[i])}
                      onChange={e => setMark(s.id, sub, e.target.value)}
                      inputMode="numeric"
                      aria-label={sub + " marks for " + s.name}
                    />
                  </td>
                ))}
                <td className="td text-right font-semibold tabular-nums">{total}</td>
                <td className="td text-right tabular-nums">{avg}%</td>
                <td className="td text-center font-bold" style={{ color: avg >= 80 ? "#15803d" : avg >= 60 ? "#b45309" : "#be123c" }}>{grade(avg)}</td>
                <td className="td text-right"><Link to={`/exams/report/${s.id}`} className="link">Report</Link></td>
              </Row>
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

      <div className="card max-w-[840px] mx-auto px-8 sm:px-12 py-10 sm:py-11">
        <div className="flex items-center gap-4 pb-5 border-b-2 border-line-strong">
          <span className="h-13 w-13 rounded-xl bg-accent text-white grid place-items-center font-display font-bold text-[22px]">S</span>
          <div>
            <div className="font-display font-bold text-h2 text-ink">{SCHOOL_NAME}</div>
            <div className="text-[13px] text-muted">Academic Year 2026–27 · Term 1 Examination Report Card</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-5 border-b border-line">
          {[["Student", s.name], ["Class", s.cls], ["Roll / Admission No.", s.adm]].map(([k, v]) => (
            <div key={k}>
              <div className="kicker mb-1">{k}</div>
              <div className="text-[15px] font-bold text-ink">{v}</div>
            </div>
          ))}
        </div>

        <table className="w-full border-collapse my-5">
          <thead>
            <tr className="border-b border-line">
              <th className="th px-0 bg-transparent">Subject</th>
              <th className="th px-0 bg-transparent text-right">Marks</th>
              <th className="th px-0 bg-transparent text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.sub} className="border-b border-line">
                <td className="py-3 text-[14px] text-body">{r.sub}</td>
                <td className="py-3 text-[14px] text-right font-semibold text-ink tabular-nums">{r.score} / 100</td>
                <td className="py-3 text-[14px] text-right text-body">{grade(r.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-t-2 border-line-strong border-b border-line">
          {[
            ["Total", total + " / 500"], ["Average", avg + "%"],
            ["Attendance", s.attendance + "%"], ["Overall grade", grade(avg)]
          ].map(([k, v], i) => (
            <div key={k}>
              <div className="kicker mb-1">{k}</div>
              <div className={"font-display font-bold text-[20px] " + (i === 3 ? "text-accent" : "text-ink")}>{v}</div>
            </div>
          ))}
        </div>

        <div className="py-5">
          <div className="kicker mb-1.5">Teacher's remarks</div>
          <p className="text-[14px] text-body m-0">
            Consistent effort through the term. Should focus a little more on written practice in Science.
          </p>
        </div>
        <div className="flex justify-between pt-10">
          <div className="border-t border-ink pt-2 text-[13px] text-body w-[200px]">Class teacher</div>
          <div className="border-t border-ink pt-2 text-[13px] text-body w-[200px] text-right">Principal</div>
        </div>
      </div>
    </>
  );
}
