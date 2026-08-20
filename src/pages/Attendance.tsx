import { useEffect, useState } from "react";
import { Check, X, CheckCheck } from "lucide-react";
import { CLASS_LIST, Mark } from "../data";
import { useApp } from "../store";
import { Avatar, EmptyState, PageHeader } from "../ui";

export default function Attendance() {
  const { state, dispatch, toast, me } = useApp();
  /** A teacher only marks the classes they teach. */
  const options = me ? me.classes : CLASS_LIST;
  const [cls, setCls] = useState(options[0]);
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  const roll = state.students.filter(s => s.cls === cls);

  /** Seed the sheet: saved marks win, otherwise one student per class starts absent
   *  so the presenter sees both states without tapping. */
  useEffect(() => {
    const saved = state.attSaved[cls];
    const seeded: Record<string, Mark> = {};
    roll.forEach((s, i) => {
      seeded[s.id] = saved?.[s.id] ?? (i === 2 || s.attendance < 75 ? "absent" : "present");
    });
    setMarks(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cls, state.attSaved, state.students.length]);

  const present = Object.values(marks).filter(m => m === "present").length;
  const absent = Object.keys(marks).length - present;
  const pct = roll.length ? Math.round((present / roll.length) * 100) : 0;

  function save() {
    dispatch({ type: "saveAttendance", cls, marks });
    toast("Attendance saved successfully", `${cls} · ${present} present, ${absent} absent`);
  }

  return (
    <>
      <PageHeader title="Mark Attendance" sub="Tap Present or Absent for each student, then save." />

      {/* Control bar */}
      <div className="panel p-4 mb-5 flex flex-wrap gap-x-6 gap-y-4 items-center">
        <div>
          <div className="kicker mb-1">Date</div>
          <div className="text-[14px] font-semibold text-ink">Tuesday, 18 August 2026</div>
        </div>
        <div className="h-9 w-px bg-line hidden sm:block" />
        <label className="flex flex-col gap-1">
          <span className="kicker">Class</span>
          <select value={cls} onChange={e => setCls(e.target.value)} className="select w-auto min-w-[130px] h-9">
            {options.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div>
          <div className="kicker mb-1">Section</div>
          <div className="text-[14px] font-semibold text-ink">{cls.split("-")[1]}</div>
        </div>

        {/* live summary */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <div className="font-display font-bold text-[22px] leading-none text-ink tabular-nums">{pct}%</div>
            <div className="text-[11.5px] text-muted mt-0.5">{present}/{roll.length} present</div>
          </div>
          <button
            className="btn btn-accent-soft"
            onClick={() => { setMarks(Object.fromEntries(roll.map(s => [s.id, "present" as Mark]))); toast("All students marked present", "Review and save"); }}
          >
            <CheckCheck size={16} /> Mark all present
          </button>
        </div>
      </div>

      {/* Roll */}
      <div className="panel overflow-hidden">
        {roll.map((s, i) => {
          const isPresent = marks[s.id] !== "absent";
          return (
            <div key={s.id} className={"flex items-center gap-4 px-4 sm:px-5 py-3 transition-colors " + (i < roll.length - 1 ? "border-b border-line " : "") + (isPresent ? "" : "bg-bad-bg/30")}>
              <span className="text-[12px] text-faint w-6 tabular-nums hidden sm:block">{String(i + 1).padStart(2, "0")}</span>
              <Avatar name={s.name} size={38} />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold text-ink truncate">{s.name}</div>
                <div className="text-[12px] text-muted">{s.adm}</div>
              </div>
              {/* Segmented Present/Absent toggle */}
              <div className="flex rounded-md border border-line overflow-hidden shrink-0">
                <button
                  onClick={() => setMarks(m => ({ ...m, [s.id]: "present" }))}
                  aria-pressed={isPresent}
                  className={"flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold transition-colors border-r border-line "
                    + (isPresent ? "bg-ok-strong text-white" : "bg-surface text-muted hover:bg-ok-bg hover:text-ok")}
                >
                  <Check size={15} /> Present
                </button>
                <button
                  onClick={() => setMarks(m => ({ ...m, [s.id]: "absent" }))}
                  aria-pressed={!isPresent}
                  className={"flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold transition-colors "
                    + (!isPresent ? "bg-bad-strong text-white" : "bg-surface text-muted hover:bg-bad-bg hover:text-bad")}
                >
                  <X size={15} /> Absent
                </button>
              </div>
            </div>
          );
        })}
        {roll.length === 0 && <EmptyState title="No students in this class" body="Choose another class to mark attendance." />}
      </div>

      {/* Sticky save bar */}
      {roll.length > 0 && (
        <div className="sticky bottom-4 mt-4 z-10">
          <div className="card shadow-md px-5 py-3 flex items-center gap-5">
            <span className="flex items-center gap-2 text-[14px] text-body">
              <span className="h-2.5 w-2.5 rounded-full bg-ok-strong" /> Present <strong className="text-ink tabular-nums">{present}</strong>
            </span>
            <span className="flex items-center gap-2 text-[14px] text-body">
              <span className="h-2.5 w-2.5 rounded-full bg-bad-strong" /> Absent <strong className="text-ink tabular-nums">{absent}</strong>
            </span>
            <span className="text-[13px] text-muted hidden sm:inline">of {roll.length} students</span>
            <button className="ml-auto btn btn-primary px-6" onClick={save}>Save Attendance</button>
          </div>
        </div>
      )}
    </>
  );
}
