import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, Phone, Search, X } from "lucide-react";
import {
  CLASS_LIST, PAYMENT_METHODS, SECTIONS, TERMS, inr, lakh, phoneHref, waHref
} from "../data";
import { useApp, useTotals } from "../store";
import { BackLink, Badge, DataTable, EmptyState, Field, Modal, PageHeader, StatGrid } from "../ui";

type Status = "All" | "Paid" | "Pending" | "Partly paid";

function statusOf(total: number, paid: number): Exclude<Status, "All"> {
  if (paid >= total) return "Paid";
  if (paid === 0) return "Pending";
  return "Partly paid";
}

const THRESHOLDS = [0, 5000, 10000, 20000, 30000];

export function Fees() {
  const { state } = useApp();
  const t = useTotals();

  const [q, setQ] = useState("");
  const [cls, setCls] = useState("All");
  const [sec, setSec] = useState("All");
  const [status, setStatus] = useState<Status>("All");
  const [term, setTerm] = useState("All");
  const [method, setMethod] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minPending, setMinPending] = useState(0);

  const active =
    (q ? 1 : 0) + (cls !== "All" ? 1 : 0) + (sec !== "All" ? 1 : 0) + (status !== "All" ? 1 : 0) +
    (term !== "All" ? 1 : 0) + (method !== "All" ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0) + (minPending ? 1 : 0);

  function clear() {
    setQ(""); setCls("All"); setSec("All"); setStatus("All"); setTerm("All");
    setMethod("All"); setFrom(""); setTo(""); setMinPending(0);
  }

  const rows = useMemo(() => state.students.filter(s => {
    const pending = s.feeTotal - s.feePaid;
    if (cls !== "All" && s.cls !== cls) return false;
    if (sec !== "All" && s.sec !== sec) return false;
    if (status !== "All" && statusOf(s.feeTotal, s.feePaid) !== status) return false;
    if (term !== "All") {
      const ft = s.feeTerms.find(x => x.term === term);
      if (!ft || ft.paid >= ft.amount) return false;
    }
    if (method !== "All" && !s.payments.some(p => p.method === method)) return false;
    if (minPending && pending < minPending) return false;
    if (from || to) {
      // Demo data carries "18 Aug"-style dates; compare on day-of-August for the range.
      const days = s.payments.map(p => parseInt(p.date, 10));
      const lo = from ? new Date(from).getDate() : 0;
      const hi = to ? new Date(to).getDate() : 31;
      if (!days.some(d => d >= lo && d <= hi)) return false;
    }
    if (q.trim() && !(s.name + " " + s.adm + " " + s.cls).toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  }), [state.students, q, cls, sec, status, term, method, from, to, minPending]);

  const shownPending = rows.reduce((a, s) => a + (s.feeTotal - s.feePaid), 0);

  return (
    <>
      <PageHeader title="Fees" sub="Track collections and record payments." />

      <div className="mb-5">
        <StatGrid
          cols={4}
          items={[
            { label: "Total expected", value: lakh(t.expected) },
            { label: "Collected", value: lakh(t.collected), color: "#15803d" },
            { label: "Pending", value: lakh(t.pending), color: "#b45309" },
            { label: "Collection rate", value: t.collectionPct + "%" }
          ]}
        />
      </div>

      <section className="panel p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] m-0">Filter fee records</h2>
          <button className="btn btn-secondary" onClick={clear} disabled={active === 0}>
            <X size={15} /> Clear filters{active ? " (" + active + ")" : ""}
          </button>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
          <div className="col-span-2">
            <Field label="Search">
              <div className="flex items-center gap-2 border border-line px-3 h-11 bg-white">
                <Search size={16} className="text-muted" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Student name, admission number or class"
                  className="flex-1 border-0 bg-transparent text-[14px] outline-none" />
              </div>
            </Field>
          </div>
          <Field label="Class">
            <select className="select" value={cls} onChange={e => setCls(e.target.value)}>
              {["All", ...CLASS_LIST].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Section">
            <select className="select" value={sec} onChange={e => setSec(e.target.value)}>
              {["All", ...SECTIONS].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Payment status">
            <select className="select" value={status} onChange={e => setStatus(e.target.value as Status)}>
              {["All", "Paid", "Partly paid", "Pending"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Fee term outstanding">
            <select className="select" value={term} onChange={e => setTerm(e.target.value)}>
              {["All", ...TERMS].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Payment method used">
            <select className="select" value={method} onChange={e => setMethod(e.target.value)}>
              {["All", ...PAYMENT_METHODS].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Pending above">
            <select className="select" value={String(minPending)} onChange={e => setMinPending(Number(e.target.value))}>
              {THRESHOLDS.map(v => <option key={v} value={v}>{v === 0 ? "Any amount" : inr(v)}</option>)}
            </select>
          </Field>
          <Field label="Paid between — from">
            <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </Field>
          <Field label="to">
            <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 pt-4 border-t border-line flex items-center gap-5 text-[13.5px]">
          <span><strong>{rows.length}</strong> of {state.students.length} students shown</span>
          <span className="text-warn">Pending in this view: <strong>{inr(shownPending)}</strong></span>
        </div>
      </section>

      <div className="panel">
        <DataTable head={["Student", "Class", "Total fee", "Paid", "Pending", "Last payment", "Status", "Action"]}>
          {rows.map(s => {
            const pending = s.feeTotal - s.feePaid;
            const st = statusOf(s.feeTotal, s.feePaid);
            return (
              <tr key={s.id} className="border-b border-line hover:bg-accent-100">
                <td className="td font-semibold text-[14.5px]">{s.name}</td>
                <td className="td">{s.cls}</td>
                <td className="td">{inr(s.feeTotal)}</td>
                <td className="td text-ok font-semibold">{inr(s.feePaid)}</td>
                <td className="td font-semibold">{pending > 0 ? inr(pending) : "—"}</td>
                <td className="td text-muted">{s.payments.length ? s.payments[s.payments.length - 1].date : "—"}</td>
                <td className="td">
                  <Badge tone={st === "Paid" ? "ok" : st === "Pending" ? "bad" : "warn"}>{st}</Badge>
                </td>
                <td className="td"><Link to={`/fees/${s.id}`} className="text-[13.5px] font-semibold underline">View / Collect</Link></td>
              </tr>
            );
          })}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState title="No fee records found" body="No student matches these filters."
            action={<button className="btn btn-secondary" onClick={clear}>Clear Filters</button>} />
        )}
      </div>
    </>
  );
}

export function FeeStudent() {
  const { id } = useParams();
  const { state, dispatch, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState(TERMS[1]);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  const s = state.students.find(x => x.id === id);
  if (!s) return <EmptyState title="Student not found" body="This record may have been removed." />;
  const pending = s.feeTotal - s.feePaid;

  const waText =
    `Dear ${s.father}, this is a fee reminder from ABC Matriculation Higher Secondary School for ${s.name} (${s.cls}). ` +
    `Pending amount: ${inr(pending)}. Kindly pay at the school office or via UPI. Thank you.`;

  function record() {
    if (!s) return;
    const n = parseInt(amount, 10);
    if (!n || n <= 0) { toast("Enter an amount", "Payment amount is required"); return; }
    dispatch({ type: "recordPayment", id: s.id, amount: n, method, term });
    setOpen(false); setAmount("");
    toast("Payment recorded successfully", inr(n) + " received by " + method + " · " + term);
  }

  return (
    <>
      <BackLink to="/fees">Back to Fees</BackLink>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[30px] mb-1.5">{s.name}</h1>
          <p className="m-0 text-[14px] text-muted">Class {s.cls} · {s.adm} · Parent: {s.father} · {s.phone}</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <a className="btn btn-secondary text-ink no-underline hover:no-underline" href={phoneHref(s.phone)}>
            <Phone size={16} /> Call Parent
          </a>
          <a
            className="btn btn-wa text-white no-underline hover:no-underline"
            href={waHref(s.whatsapp, waText)}
            target="_blank"
            rel="noreferrer"
            onClick={() => toast("WhatsApp reminder opened", inr(pending) + " reminder to " + s.father)}
          >
            <MessageCircle size={16} /> Notify on WhatsApp
          </a>
          <button className="btn btn-secondary" onClick={() => toast("Reminder sent", "SMS reminder queued for " + s.phone)}>
            Send SMS Reminder
          </button>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>Record Payment</button>
        </div>
      </div>
      <div className="rule my-5" />

      <div className="mb-5">
        <StatGrid
          cols={4}
          items={[
            { label: "Total fee", value: inr(s.feeTotal) },
            { label: "Paid", value: inr(s.feePaid), color: "#15803d" },
            { label: "Pending", value: pending > 0 ? inr(pending) : "—", color: pending > 0 ? "#b45309" : "#15803d" },
            { label: "Status", value: statusOf(s.feeTotal, s.feePaid) }
          ]}
        />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel">
          <div className="sectionhead"><h2 className="text-[18px] m-0">Term-wise fee</h2></div>
          <DataTable head={["Term", "Amount", "Paid", "Pending", "Due date"]}>
            {s.feeTerms.map(ft => (
              <tr key={ft.term} className="border-b border-line">
                <td className="td font-semibold">{ft.term}</td>
                <td className="td">{inr(ft.amount)}</td>
                <td className="td text-ok">{inr(ft.paid)}</td>
                <td className="td font-semibold">{ft.amount - ft.paid > 0 ? inr(ft.amount - ft.paid) : "—"}</td>
                <td className="td text-muted">{ft.due}</td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section className="panel">
          <div className="sectionhead">
            <h2 className="text-[18px] m-0">Payment history</h2>
            <button className="link" onClick={() => toast("Receipt opened", "Prototype — no PDF generated")}>View Receipt</button>
          </div>
          {s.payments.length === 0
            ? <EmptyState title="No payments yet" body="Record the first payment to start the history." />
            : (
              <DataTable head={["Date", "Amount", "Term", "Method", "Receipt No."]}>
                {s.payments.map(p => (
                  <tr key={p.receipt} className="border-b border-line">
                    <td className="td">{p.date}</td>
                    <td className="td font-semibold">{inr(p.amount)}</td>
                    <td className="td">{p.term}</td>
                    <td className="td">{p.method}</td>
                    <td className="td text-muted">{p.receipt}</td>
                  </tr>
                ))}
              </DataTable>
            )}
        </section>
      </div>

      {open && (
        <Modal
          title="Record Payment"
          onClose={() => setOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={record}>Record Payment</button>
            </>
          }
        >
          <Field label="Student">
            <div className="input flex items-center bg-ground">{s.name} · {s.cls}</div>
          </Field>
          <Field label="Fee term">
            <select className="select" value={term} onChange={e => setTerm(e.target.value)}>
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₹)">
              <input className="input" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="5000" />
            </Field>
            <Field label="Payment method">
              <select className="select" value={method} onChange={e => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Date">
            <div className="input flex items-center bg-ground">18 August 2026</div>
          </Field>
        </Modal>
      )}
    </>
  );
}
