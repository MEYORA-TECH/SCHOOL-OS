import { useState } from "react";
import { Send } from "lucide-react";
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

      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "300px 1fr 340px" }}>
        <section className="panel p-[18px]">
          <h2 className="text-[16px] m-0 mb-3.5">Who should receive this?</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(AUDIENCES).map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className={"flex flex-col items-start gap-0.5 px-3.5 py-3 min-h-[33px] border cursor-pointer text-left w-full " +
                  (audience === a ? "border-accent bg-accent-100" : "border-line bg-white hover:border-accent")}>
                <span className={"text-[14.5px] " + (audience === a ? "font-bold" : "font-medium")}>{a}</span>
                <span className="text-[12.5px] text-muted">{AUDIENCES[a]} parents</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-[16px] m-0 mb-4">Write your message</h2>
          <div className="flex flex-col gap-4">
            <Field label="Message title">
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Holiday tomorrow" />
            </Field>
            <Field label="Message">
              <textarea
                className="w-full border border-line bg-white p-3 text-[15px] leading-relaxed"
                rows={9}
                maxLength={500}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Dear Parents, ..."
              />
            </Field>
            <div className="flex justify-between text-[12.5px] text-muted -mt-2">
              <span>Recipients: {count} parents</span>
              <span>{body.length} / 500 characters</span>
            </div>
          </div>
          <div className="flex gap-2.5 mt-[18px]">
            <button className="btn btn-secondary" onClick={() => { setShowPreview(p => !p); if (!showPreview) toast("Preview shown", "This is what parents will receive"); }}>
              {showPreview ? "Hide Preview" : "Preview"}
            </button>
            <button className="btn btn-primary" onClick={send}><Send size={16} /> Send Message</button>
          </div>

          {state.messages.length > 0 && (
            <div className="mt-6 pt-[18px] border-t border-line">
              <div className="kicker mb-3">Recently sent</div>
              <div className="flex flex-col gap-2.5">
                {state.messages.map((m, i) => (
                  <div key={i} className="flex justify-between gap-3 border border-line px-3.5 py-2.5">
                    <div>
                      <div className="text-[14px] font-semibold">{m.title}</div>
                      <div className="text-[12.5px] text-muted">{m.audience} · {m.count} parents</div>
                    </div>
                    <span className="text-[12.5px] text-ok font-semibold">Sent {m.when}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="panel p-[18px]">
          <h2 className="text-[16px] m-0 mb-3.5">Parent's phone</h2>
          {showPreview ? (
            <div className="border border-line bg-ground p-3.5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-[30px] h-[30px] bg-accent text-white grid place-items-center font-extrabold text-[13px]">S</span>
                <div>
                  <div className="text-[13.5px] font-bold">ABC School</div>
                  <div className="text-[11.5px] text-muted">now</div>
                </div>
              </div>
              <div className="bg-white border border-line p-3.5">
                <div className="text-[13.5px] font-bold mb-1.5">{title || "Message from ABC School"}</div>
                <div className="text-[13.5px] whitespace-pre-wrap leading-relaxed">
                  {body || "Dear Parents,\n\nTomorrow will be a holiday due to the school event.\n\nThank you,\nABC School"}
                </div>
              </div>
              <div className="text-[11.5px] text-muted mt-2.5">Recipients: {count} parents</div>
            </div>
          ) : (
            <div className="border border-dashed border-line p-8 text-center">
              <div className="text-[14px] font-semibold mb-1.5">Preview hidden</div>
              <p className="text-[13px] text-muted m-0">Click Preview to see exactly what parents will get.</p>
            </div>
          )}
          <p className="text-[12.5px] text-muted mt-3.5 mb-0">Sending is simulated in this prototype — no real messages go out.</p>
        </section>
      </div>
    </>
  );
}
