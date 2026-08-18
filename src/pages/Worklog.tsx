import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { CLASS_LIST, SUBJECTS, TODAY, WorklogEntry } from "../data";
import { useApp } from "../store";
import { Avatar, Badge, Bar, DataTable, EmptyState, Field, Modal, PageHeader, StatGrid } from "../ui";

export default function Worklog() {
  const { state, dispatch, toast, me } = useApp();
  const isTeacher = state.role === "teacher";
  const [open, setOpen] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");
  const [form, setForm] = useState({
    period: "1", cls: me?.classes[0] || CLASS_LIST[0], subject: me?.subject || SUBJECTS[0],
    topic: "", remarks: "", attendanceMarked: true, syllabusPct: "50"
  });

  const entries = useMemo(() => state.worklog.filter(w => {
    if (isTeacher && w.teacherId !== me?.id) return false;
    if (!isTeacher && teacherFilter !== "All" && w.teacherId !== teacherFilter) return false;
    if (dayFilter !== "All" && w.date !== dayFilter) return false;
    return true;
  }), [state.worklog, isTeacher, me, teacherFilter, dayFilter]);

  const days = Array.from(new Set(state.worklog.map(w => w.date)));
  const nameOf = (id: string) => state.teachers.find(t => t.id === id)?.name ?? "—";

  const todayEntries = state.worklog.filter(w => w.date === TODAY);
  const wroteToday = new Set(todayEntries.map(w => w.teacherId));
  const missing = state.teachers.filter(t => !wroteToday.has(t.id));

  function save() {
    if (!form.topic.trim()) { toast("Enter the topic covered", "Topic is required"); return; }
    const entry: WorklogEntry = {
      id: "w" + Date.now(), teacherId: me?.id ?? "t0", date: TODAY,
      period: parseInt(form.period, 10), cls: form.cls, subject: form.subject,
      topic: form.topic, remarks: form.remarks,
      attendanceMarked: form.attendanceMarked, syllabusPct: parseInt(form.syllabusPct, 10) || 0
    };
    dispatch({ type: "addWorklog", entry });
    setOpen(false);
    setForm({ ...form, topic: "", remarks: "" });
    toast("Worklog saved", form.cls + " · period " + form.period + " · " + form.subject);
  }

  return (
    <>
      <PageHeader
        title={isTeacher ? "My Worklog" : "Teacher Worklog"}
        sub={isTeacher
          ? "Log what you taught today — period by period."
          : "What each teacher taught, class by class, with syllabus progress."}
        action={isTeacher
          ? <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add Today's Entry</button>
          : undefined}
      />

      {!isTeacher && (
        <>
          <div className="mb-5">
            <StatGrid
              cols={4}
              items={[
                { label: "Entries today", value: todayEntries.length, sub: "across all teachers" },
                { label: "Teachers logged", value: wroteToday.size + " of " + state.teachers.length, color: missing.length ? "#b45309" : "#15803d" },
                { label: "Attendance not marked", value: todayEntries.filter(w => !w.attendanceMarked).length, sub: "periods", color: "#b45309" },
                { label: "Avg syllabus progress", value: Math.round(state.worklog.reduce((a, w) => a + w.syllabusPct, 0) / Math.max(1, state.worklog.length)) + "%" }
              ]}
            />
          </div>

          {missing.length > 0 && (
            <section className="panel mb-5">
              <div className="sectionhead">
                <h2 className="text-[18px] m-0">Not written today</h2>
                <span className="text-[13px] text-muted">{missing.length} teachers</span>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                {missing.map(t => (
                  <div key={t.id} className="flex items-center gap-3 border border-line px-3 min-h-[44px]">
                    <Avatar name={t.name} size={28} />
                    <span className="text-[14px] font-semibold">{t.name}</span>
                    <span className="text-[12.5px] text-muted">{t.subject}</span>
                    <button className="link" onClick={() => toast("Reminder sent", t.name + " asked to submit today's worklog")}>Remind</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex gap-4 items-end mb-4">
            <Field label="Teacher">
              <select className="select w-[240px]" value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}>
                <option value="All">All teachers</option>
                {state.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Day">
              <select className="select w-[180px]" value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
                <option value="All">All days</option>
                {days.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <span className="text-[13.5px] text-muted pb-3">{entries.length} entries</span>
          </div>
        </>
      )}

      {isTeacher && (
        <div className="mb-5">
          <StatGrid
            cols={3}
            items={[
              { label: "Logged today", value: entries.filter(w => w.date === TODAY).length + " periods" },
              { label: "This week", value: entries.length + " entries" },
              { label: "Classes covered", value: new Set(entries.map(w => w.cls)).size }
            ]}
          />
        </div>
      )}

      <div className="panel">
        <DataTable head={isTeacher
          ? ["Date", "Period", "Class", "Subject", "Topic covered", "Attendance", "Syllabus"]
          : ["Date", "Teacher", "Period", "Class", "Subject", "Topic covered", "Attendance", "Syllabus"]}>
          {entries.map(w => (
            <tr key={w.id} className="border-b border-line align-top">
              <td className="td text-muted whitespace-nowrap">{w.date}</td>
              {!isTeacher && <td className="td font-semibold whitespace-nowrap">{nameOf(w.teacherId)}</td>}
              <td className="td">P{w.period}</td>
              <td className="td font-semibold">{w.cls}</td>
              <td className="td">{w.subject}</td>
              <td className="td">
                <div className="font-semibold text-[14px]">{w.topic}</div>
                {w.remarks && <div className="text-[12.5px] text-muted">{w.remarks}</div>}
              </td>
              <td className="td">
                {w.attendanceMarked
                  ? <Badge tone="ok">Marked</Badge>
                  : <Badge tone="warn">Not marked</Badge>}
              </td>
              <td className="td w-[130px]">
                <Bar pct={w.syllabusPct} />
                <div className="text-[12.5px] text-muted mt-1">{w.syllabusPct}%</div>
              </td>
            </tr>
          ))}
        </DataTable>
        {entries.length === 0 && (
          <EmptyState
            title="No worklog entries"
            body={isTeacher ? "Add today's entry after each period." : "No entries match this filter."}
          />
        )}
      </div>

      {open && (
        <Modal
          title="Today's worklog entry"
          width={560}
          onClose={() => setOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Entry</button>
            </>
          }
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Period">
              <select className="select" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                {[1, 2, 3, 4, 5, 6, 7].map(p => <option key={p} value={String(p)}>Period {p}</option>)}
              </select>
            </Field>
            <Field label="Class">
              <select className="select" value={form.cls} onChange={e => setForm({ ...form, cls: e.target.value })}>
                {(me?.classes ?? CLASS_LIST).map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Subject">
              <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </Field>
          </div>
          <Field label="Topic covered">
            <input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Quadratic equations — nature of roots" />
          </Field>
          <Field label="Remarks on the class (optional)">
            <textarea className="w-full border border-line bg-white p-3 text-[14.5px]" rows={3}
              value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4 items-end">
            <Field label="Syllabus completed for this class (%)">
              <input className="input" value={form.syllabusPct}
                onChange={e => setForm({ ...form, syllabusPct: e.target.value.replace(/[^0-9]/g, "") })} />
            </Field>
            <button
              className={"btn " + (form.attendanceMarked ? "btn-accent-soft" : "btn-secondary")}
              onClick={() => setForm({ ...form, attendanceMarked: !form.attendanceMarked })}
            >
              {form.attendanceMarked ? <Check size={16} /> : <X size={16} />}
              Attendance marked for this period
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
