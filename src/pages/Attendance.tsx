import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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

  function save() {
    dispatch({ type: "saveAttendance", cls, marks });
    toast("Attendance saved successfully", `${cls} · ${present} present, ${absent} absent`);
  }

  return (
    <>
      <PageHeader title="Mark Attendance" sub="Tap Present or Absent for each student, then save." />

      <div className="panel flex gap-4 items-end flex-wrap px-5 py-[18px] mb-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-muted">Date</span>
          <strong className="text-[15.5px]">Tuesday, 18 August 2026</strong>
        </div>
        <div className="h-11 w-px bg-line" />
        <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
          Class
          <select value={cls} onChange={e => setCls(e.target.value)} className="h-11 border border-line bg-white text-[15px] px-3 min-w-[120px] text-ink">
            {options.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-muted">Section</span>
          <strong className="text-[15.5px] h-11 flex items-center">{cls.split("-")[1]}</strong>
        </div>
        <button
          className="ml-auto btn h-11 border-accent bg-white text-accent-700 hover:bg-accent-100"
          onClick={() => { setMarks(Object.fromEntries(roll.map(s => [s.id, "present" as Mark]))); toast("All students marked present", "Review and save"); }}
        >
          Mark All Present
        </button>
      </div>

      <div className="panel">
        {roll.map(s => {
          const isPresent = marks[s.id] !== "absent";
          return (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-line">
              <Avatar name={s.name} size={36} />
              <div className="flex-1">
                <div className="text-[15.5px] font-semibold">{s.name}</div>
                <div className="text-[12.5px] text-muted">{s.adm}</div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setMarks(m => ({ ...m, [s.id]: "present" }))}
                  aria-pressed={isPresent}
                  className={"flex items-center gap-2 h-11 px-[22px] border-2 font-bold text-[14.5px] cursor-pointer " +
                    (isPresent ? "bg-ok border-ok text-white" : "bg-white border-line text-muted")}
                >
                  <Check size={16} /> Present
                </button>
                <button
                  onClick={() => setMarks(m => ({ ...m, [s.id]: "absent" }))}
                  aria-pressed={!isPresent}
                  className={"flex items-center gap-2 h-11 px-[22px] border-2 font-bold text-[14.5px] cursor-pointer " +
                    (!isPresent ? "bg-bad border-bad text-white" : "bg-white border-line text-muted")}
                >
                  <X size={16} /> Absent
                </button>
              </div>
            </div>
          );
        })}
        {roll.length === 0 && <EmptyState title="No students in this class" body="Choose another class to mark attendance." />}
        <div className="flex items-center gap-6 px-5 py-[18px] bg-ground">
          <span className="flex items-center gap-2 text-[15px]"><span className="w-2.5 h-2.5 block bg-ok" />Present: <strong>{present}</strong></span>
          <span className="flex items-center gap-2 text-[15px]"><span className="w-2.5 h-2.5 block bg-bad" />Absent: <strong>{absent}</strong></span>
          <span className="text-[14px] text-muted">of {roll.length} students</span>
          <button className="ml-auto btn btn-primary h-12 px-7 text-[15px]" onClick={save}>Save Attendance</button>
        </div>
      </div>
    </>
  );
}
