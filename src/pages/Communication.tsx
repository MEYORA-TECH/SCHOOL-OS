import { useState } from "react";
import { Send, Users } from "lucide-react";
import { AUDIENCES } from "../data";
import { useApp } from "../store";
import { Field, PageHeader } from "../ui";

export default function Communication() {
  const { state, dispatch, toast } = useApp();
  const [audience, setAudience] = useState("Absent Students");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const count = AUDIENCES[audience] ?? 42;

  function send() {
    if (!body.trim()) { toast("Write a message first", "The message body is empty"); return; }
    dispatch({ type: "sendMessage", message: { title: title || "Untitled", audience, count, when: "Just now" } });
    setTitle(""); setBody("");
    toast("Message sent successfully", count + " parents notified");
  }

  return (
    <>
      <PageHeader title="Parent Communication" sub="Send announcements and updates to parents." />

      <div className="grid gap-5 items-start lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px]">
        {/* Audience selector */}
        <section className="panel p-4">
          <h2 className="text-h3 font-display font-bold text-ink mb-3">Who should receive this?</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(AUDIENCES).map(a => {
              const on = audience === a;
              return (
                <button key={a} onClick={() => setAudience(a)}
                  className={"flex items-center justify-between gap-2 px-3.5 py-3 rounded-md border cursor-pointer text-left w-full transition-colors "
                    + (on ? "border-accent-200 bg-accent-50" : "border-line bg-surface hover:border-line-strong hover:bg-subtle")}>
                  <div className="min-w-0">
                    <div className={"text-[14px] " + (on ? "font-bold text-accent-700" : "font-medium text-ink")}>{a}</div>
                    <div className="text-[12px] text-muted">{AUDIENCES[a]} parents</div>
                  </div>
                  {on && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Composer */}
        <section className="panel p-5">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Write your message</h2>
          <div className="flex flex-col gap-4">
            <Field label="Message title">
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Holiday tomorrow" />
            </Field>
            <Field label="Message" hint={`${body.length} / 500 characters`}>
              <textarea
                className="textarea"
                rows={9}
                maxLength={500}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Dear Parents, ..."
              />
            </Field>
            <div className="flex items-center gap-2 rounded-md bg-accent-50 border border-accent-100 px-3.5 py-2.5">
              <Users size={16} className="text-accent-700 shrink-0" />
              <span className="text-[13px] text-accent-700 font-medium">This will reach {count} parents in "{audience}"</span>
            </div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button className="btn btn-secondary" onClick={() => { setShowPreview(p => !p); if (!showPreview) toast("Preview shown", "This is what parents will receive"); }}>
              {showPreview ? "Hide Preview" : "Preview"}
            </button>
            <button className="btn btn-primary" onClick={send}><Send size={16} /> Send Message</button>
          </div>

          {state.messages.length > 0 && (
            <div className="mt-6 pt-5 border-t border-line">
              <div className="kicker mb-3">Recently sent</div>
              <div className="flex flex-col gap-2.5">
                {state.messages.map((m, i) => (
                  <div key={i} className="flex justify-between items-center gap-3 rounded-md border border-line px-3.5 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink truncate">{m.title}</div>
                      <div className="text-[12px] text-muted">{m.audience} · {m.count} parents</div>
                    </div>
                    <span className="text-[12px] text-ok font-semibold shrink-0">Sent {m.when}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Phone preview */}
        <section className="panel p-4 xl:sticky xl:top-24">
          <h2 className="text-h3 font-display font-bold text-ink mb-3">Parent's phone</h2>
          {showPreview ? (
            <div className="rounded-xl bg-subtle border border-line p-3.5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-8 w-8 rounded-full bg-accent text-white grid place-items-center font-display font-bold text-[13px]">S</span>
                <div>
                  <div className="text-[13px] font-bold text-ink">ABC School</div>
                  <div className="text-[11px] text-muted">now</div>
                </div>
              </div>
              <div className="rounded-lg bg-surface border border-line p-3.5 shadow-xs">
                <div className="text-[13.5px] font-bold text-ink mb-1.5">{title || "Message from ABC School"}</div>
                <div className="text-[13px] text-body whitespace-pre-wrap leading-relaxed">
                  {body || "Dear Parents,\n\nTomorrow will be a holiday due to the school event.\n\nThank you,\nABC School"}
                </div>
              </div>
              <div className="text-[11.5px] text-muted mt-2.5">Recipients: {count} parents</div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line p-8 text-center">
              <div className="text-[14px] font-semibold text-ink mb-1">Preview hidden</div>
              <p className="text-[13px] text-muted m-0">Click Preview to see exactly what parents will get.</p>
            </div>
          )}
          <p className="text-[12px] text-muted mt-3.5 mb-0">Sending is simulated in this prototype — no real messages go out.</p>
        </section>
      </div>
    </>
  );
}
