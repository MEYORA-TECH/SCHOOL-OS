import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Plus } from "lucide-react";
import { Enquiry, STAGES, StageKey, waHref, phoneHref } from "../data";
import { useApp } from "../store";
import { BackLink, EmptyState, Field, Modal, PageHeader, StatGrid } from "../ui";

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
        sub="Track every admission enquiry from first contact to admission."
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Admission</button>}
      />

      <div className="mb-5">
        <StatGrid cols={4} items={[
          { label: "Total enquiries", value: state.admissions.length },
          { label: "New", value: counts.new },
          { label: "School visits", value: counts.visit },
          { label: "Admitted", value: counts.admitted, color: "#15803d" }
        ]} />
      </div>

      <div className="grid gap-3.5 items-start" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
        {STAGES.map(stage => {
          const cards = state.admissions.filter(a => a.stage === stage.key);
          return (
            <div key={stage.key} className="panel">
              <div className={"flex items-center justify-between px-3.5 py-3 border-b-2 border-divider " + (stage.key === "admitted" ? "bg-ok-bg" : "bg-ground")}>
                <span className="text-[11.5px] uppercase tracking-[0.08em] font-bold">{stage.label}</span>
                <span className="text-[12px] font-bold text-muted">{cards.length}</span>
              </div>
              <div className="p-3 flex flex-col gap-2.5 min-h-[120px]">
                {cards.map(c => (
                  <div key={c.id} className="border border-line p-3">
                    <Link to={`/admissions/${c.id}`} className="block text-ink no-underline hover:no-underline">
                      <div className="text-[14.5px] font-bold">{c.name}</div>
                      <div className="text-[12.5px] text-muted mt-0.5">Parent: {c.parent}</div>
                      <div className="text-[12.5px] text-muted">Class {c.cls} · {c.phone}</div>
                      <div className="text-[12px] text-muted mt-1.5">{c.date}</div>
                    </Link>
                    <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-line">
                      <button className="btn btn-secondary w-11 justify-center px-0" onClick={() => move(c, -1)} aria-label="Move back a stage">
                        <ArrowLeft size={14} />
                      </button>
                      <button className="btn btn-accent-soft flex-1 justify-center text-[12.5px] px-2" onClick={() => move(c, 1)}>Move stage</button>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && <div className="py-5 px-2 text-center text-[13px] text-muted">No enquiries here yet.</div>}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <Modal
          title="New Admission Enquiry"
          width={520}
          onClose={() => setOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Add Enquiry</button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            {[["name", "Student name"], ["parent", "Parent name"], ["cls", "Class applying for"], ["phone", "Phone"], ["prevSchool", "Previous school"]].map(([k, label]) => (
              <Field key={k} label={label}>
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

  return (
    <>
      <BackLink to="/admissions">Back to Admissions</BackLink>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[30px] mb-1.5">{e.name}</h1>
          <p className="m-0 text-[14px] text-muted">Class {e.cls} · Enquiry on {e.date} · Stage: {STAGES[idx].label}</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <a className="btn btn-secondary text-ink no-underline hover:no-underline" href={phoneHref(e.phone)}><Phone size={16} /> Call Parent</a>
          <a className="btn btn-wa text-white no-underline hover:no-underline" target="_blank" rel="noreferrer"
            href={waHref(e.phone, "Dear " + e.parent + ", thank you for your interest in ABC Matriculation Higher Secondary School for " + e.name + " (Class " + e.cls + "). May we schedule a school visit this week?")}
            onClick={() => toast("WhatsApp opened", "Message to " + e.parent)}>
            <MessageCircle size={16} /> WhatsApp Parent
          </a>
          <button className="btn btn-secondary" onClick={() => move(1)}>Move to Next Stage</button>
          <button className="btn btn-primary" onClick={() => { dispatch({ type: "setStage", id: e.id, stage: "admitted" }); toast("Admission confirmed", e.name + " is now admitted"); }}>
            Confirm Admission
          </button>
        </div>
      </div>
      <div className="rule my-5" />

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel p-5">
          <h2 className="text-[17px] m-0 mb-3.5">Enquiry details</h2>
          <div className="grid gap-x-5 gap-y-2.5 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
            {[
              ["Student name", e.name], ["Parent name", e.parent], ["Phone", e.phone], ["Email", e.email],
              ["Class applying for", "Class " + e.cls], ["Previous school", e.prevSchool], ["Enquiry date", e.date],
              ["Follow-up date", e.followUp], ["Assigned to", e.assigned]
            ].map(([k, v]) => (
              <div key={k} className="contents"><span className="text-muted">{k}</span><span>{v}</span></div>
            ))}
          </div>
          <div className="mt-[18px]">
            <div className="kicker mb-1.5">Notes</div>
            <div className="border border-line p-3 text-[14px] bg-ground">{e.notes}</div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-[17px] m-0 mb-[18px]">Admission timeline</h2>
          <div className="flex flex-col">
            {labels.map((label, i) => {
              const done = STAGES.findIndex(s => s.key === order[i]) <= idx;
              return (
                <div key={label} className="flex gap-3.5 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <span className={"w-3.5 h-3.5 block border-2 " + (done ? "bg-accent border-accent" : "bg-white border-line")} />
                    {i < labels.length - 1 && <span className="w-[2px] h-[34px] bg-line block" />}
                  </div>
                  <div className="pb-3">
                    <div className={"text-[14.5px] font-semibold " + (done ? "" : "text-muted")}>{label}</div>
                    <div className="text-[12.5px] text-muted">{done ? "Completed" : "Pending"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
