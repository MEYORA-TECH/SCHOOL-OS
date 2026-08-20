import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle, Phone, Plus } from "lucide-react";
import { Enquiry, STAGES, StageKey, waHref, phoneHref } from "../data";
import { useApp } from "../store";
import { BackLink, EmptyState, Field, Modal, PageHeader, StatGrid, Timeline } from "../ui";

export function Admissions() {
  const { state, dispatch, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const counts = Object.fromEntries(STAGES.map(s => [s.key, state.admissions.filter(a => a.stage === s.key).length])) as Record<string, number>;

  function move(e: Enquiry, dir: 1 | -1) {
    const i = STAGES.findIndex(s => s.key === e.stage);
    const next = Math.max(0, Math.min(STAGES.length - 1, i + dir));
    if (next === i) return;
    dispatch({ type: "setStage", id: e.id, stage: STAGES[next].key as StageKey });
    toast("Admission updated successfully", e.name + " moved to " + STAGES[next].label);
  }

  function create() {
    if (!form.name || !form.parent) { toast("Enter student and parent name", "Both are required"); return; }
    const enquiry: Enquiry = {
      id: "e" + Date.now(), name: form.name, parent: form.parent, cls: form.cls || "6",
      phone: form.phone || "98410 00000", date: "18 Aug", stage: "new",
      prevSchool: form.prevSchool || "—", email: form.email || "parent@example.com",
      assigned: "Kavitha (Admissions)", followUp: "22 Aug 2026", notes: "New enquiry from front office."
    };
    dispatch({ type: "addEnquiry", enquiry });
    setOpen(false); setForm({});
    toast("Enquiry added successfully", enquiry.name + " · Class " + enquiry.cls);
  }

  return (
    <>
      <PageHeader
        title="Admissions"
        sub="Track every enquiry from first contact to confirmed admission."
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Admission</button>}
      />

      <div className="mb-6">
        <StatGrid cols={4} items={[
          { label: "Total enquiries", value: state.admissions.length },
          { label: "New", value: counts.new, color: "#2563eb" },
          { label: "School visits", value: counts.visit },
          { label: "Admitted", value: counts.admitted, color: "#15803d" }
        ]} />
      </div>

      {/* Pipeline board — horizontal scroll on small screens */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
        <div className="grid gap-4 min-w-[1000px]" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0,1fr))` }}>
          {STAGES.map(stage => {
            const cards = state.admissions.filter(a => a.stage === stage.key);
            const admitted = stage.key === "admitted";
            return (
              <div key={stage.key} className="flex flex-col rounded-xl bg-subtle/60 border border-line">
                <div className="flex items-center justify-between px-3.5 py-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className={"h-2 w-2 rounded-full " + (admitted ? "bg-ok-strong" : "bg-accent")} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-body">{stage.label}</span>
                  </div>
                  <span className="grid place-items-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-surface border border-line text-[12px] font-bold text-muted">{cards.length}</span>
                </div>
                <div className="p-2.5 flex flex-col gap-2.5 min-h-[140px]">
                  {cards.map(c => (
                    <div key={c.id} className="card p-3 hover:shadow-md hover:border-line-strong transition-all">
                      <Link to={`/admissions/${c.id}`} className="block group">
                        <div className="text-[14px] font-semibold text-ink group-hover:text-accent-700 transition-colors">{c.name}</div>
                        <div className="text-[12px] text-muted mt-1">Parent: {c.parent}</div>
                        <div className="text-[12px] text-muted">Class {c.cls} · {c.phone}</div>
                        <div className="text-[11.5px] text-faint mt-1.5">{c.date}</div>
                      </Link>
                      <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-line">
                        <button className="icon-btn h-8 w-8 shrink-0" onClick={() => move(c, -1)} aria-label="Move back a stage">
                          <ArrowLeft size={14} />
                        </button>
                        <button className="btn btn-accent-soft flex-1 h-8 text-[12.5px] px-2" onClick={() => move(c, 1)}>
                          Move <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="py-6 px-2 text-center text-[12.5px] text-faint">No enquiries here.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open && (
        <Modal
          title="New Admission Enquiry"
          sub="Capture the basics — you can add details later."
          width={560}
          onClose={() => setOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Add Enquiry</button>
            </>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {([["name", "Student name", true], ["parent", "Parent name", true], ["cls", "Class applying for", false], ["phone", "Phone", false], ["prevSchool", "Previous school", false]] as [string, string, boolean][]).map(([k, label, req]) => (
              <Field key={k} label={label} required={req}>
                <input className="input" value={form[k] || ""} onChange={e => set(k, e.target.value)} />
              </Field>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

export function AdmissionDetail() {
  const { id } = useParams();
  const { state, dispatch, toast } = useApp();
  const e = state.admissions.find(x => x.id === id);
  if (!e) return <EmptyState title="Enquiry not found" body="This enquiry may have been removed." />;

  const idx = STAGES.findIndex(s => s.key === e.stage);
  const order: StageKey[] = ["new", "contacted", "visit", "application", "application", "admitted"];
  const labels = ["Enquiry received", "Contacted", "School visit", "Application", "Documents", "Admission confirmed"];

  function move(dir: 1) {
    if (!e) return;
    const next = Math.min(STAGES.length - 1, idx + dir);
    dispatch({ type: "setStage", id: e.id, stage: STAGES[next].key });
    toast("Admission updated successfully", e.name + " moved to " + STAGES[next].label);
  }

  const timelineItems = labels.map((label, i) => {
    const stageIdx = STAGES.findIndex(s => s.key === order[i]);
    return {
      label,
      done: stageIdx < idx,
      current: stageIdx === idx,
      meta: stageIdx < idx ? "Completed" : stageIdx === idx ? "In progress" : "Pending"
    };
  });

  return (
    <>
      <BackLink to="/admissions">Back to Admissions</BackLink>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-h1 font-display font-bold text-ink truncate">{e.name}</h1>
            <p className="mt-1 text-[13px] text-muted">Class {e.cls} · Enquiry on {e.date} · Stage: <span className="text-accent-700 font-semibold">{STAGES[idx].label}</span></p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <a className="btn btn-secondary" href={phoneHref(e.phone)}><Phone size={16} /> Call</a>
            <a className="btn btn-wa" target="_blank" rel="noreferrer"
              href={waHref(e.phone, "Dear " + e.parent + ", thank you for your interest in ABC Matriculation Higher Secondary School for " + e.name + " (Class " + e.cls + "). May we schedule a school visit this week?")}
              onClick={() => toast("WhatsApp opened", "Message to " + e.parent)}>
              <MessageCircle size={16} /> WhatsApp
            </a>
            <button className="btn btn-secondary" onClick={() => move(1)}>Next Stage <ArrowRight size={15} /></button>
            <button className="btn btn-primary" onClick={() => { dispatch({ type: "setStage", id: e.id, stage: "admitted" }); toast("Admission confirmed", e.name + " is now admitted"); }}>
              Confirm Admission
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <section className="panel p-5">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Enquiry details</h2>
          <div className="grid gap-x-5 gap-y-3 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
            {[
              ["Student name", e.name], ["Parent name", e.parent], ["Phone", e.phone], ["Email", e.email],
              ["Class applying for", "Class " + e.cls], ["Previous school", e.prevSchool], ["Enquiry date", e.date],
              ["Follow-up date", e.followUp], ["Assigned to", e.assigned]
            ].map(([k, v]) => (
              <div key={k} className="contents"><span className="text-muted">{k}</span><span className="text-ink font-medium text-right">{v}</span></div>
            ))}
          </div>
          <div className="mt-5">
            <div className="kicker mb-2">Notes</div>
            <div className="rounded-md border border-line bg-subtle/60 p-3.5 text-[13.5px] text-body">{e.notes}</div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-h3 font-display font-bold text-ink mb-5">Admission timeline</h2>
          <Timeline items={timelineItems} />
        </section>
      </div>
    </>
  );
}
