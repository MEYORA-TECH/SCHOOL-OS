import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, Phone, Wallet, X, SlidersHorizontal, Receipt } from "lucide-react";
import {
  CLASS_LIST, PAYMENT_METHODS, SECTIONS, TERMS, inr, lakh, phoneHref, waHref
} from "../data";
import { useApp, useTotals } from "../store";
import { BackLink, Badge, DataTable, EmptyState, Field, Modal, PageHeader, Row, SearchInput, SectionCard, StatGrid } from "../ui";

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

  const [showFilters, setShowFilters] = useState(false);
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
    (cls !== "All" ? 1 : 0) + (sec !== "All" ? 1 : 0) + (status !== "All" ? 1 : 0) +
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
      <PageHeader title="Fees" sub="Track collections and record payments across the school." />

      <div className="mb-6">
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

      {/* Search + filter toggle */}
      <div className="panel p-3 mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by student, admission number or class" className="flex-1 min-w-[240px]" />
        <button
          className={"btn " + (showFilters || active ? "btn-accent-soft" : "btn-secondary")}
          onClick={() => setShowFilters(v => !v)}
        >
          <SlidersHorizontal size={15} /> Filters{active ? ` (${active})` : ""}
        </button>
        {active > 0 && (
          <button className="btn btn-ghost" onClick={clear}><X size={15} /> Clear</button>
        )}
        <span className="text-[13px] text-muted ml-auto pr-1">
          <strong className="text-ink">{rows.length}</strong> shown ·
          <span className="text-warn font-medium"> {inr(shownPending)} pending</span>
        </span>
      </div>

      {showFilters && (
        <section className="panel p-5 mb-4 animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Field label="Term outstanding">
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
            <Field label="Paid from">
              <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </Field>
            <Field label="Paid to">
              <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </Field>
          </div>
        </section>
      )}

      <div className="panel overflow-hidden">
        <DataTable
          head={["Student", "Class", { label: "Total fee", align: "right" }, { label: "Paid", align: "right" }, { label: "Pending", align: "right" }, "Last payment", { label: "Status", align: "center" }, { label: "", align: "right" }]}
          minWidth={880}
        >
          {rows.map(s => {
            const pending = s.feeTotal - s.feePaid;
            const st = statusOf(s.feeTotal, s.feePaid);
            return (
              <Row key={s.id}>
                <td className="td font-semibold text-ink">{s.name}</td>
                <td className="td">{s.cls}</td>
                <td className="td text-right tabular-nums">{inr(s.feeTotal)}</td>
                <td className="td text-right text-ok font-semibold tabular-nums">{inr(s.feePaid)}</td>
                <td className="td text-right font-semibold tabular-nums" style={{ color: pending > 0 ? "#b45309" : undefined }}>{pending > 0 ? inr(pending) : "—"}</td>
                <td className="td text-muted">{s.payments.length ? s.payments[s.payments.length - 1].date : "—"}</td>
                <td className="td text-center">
                  <Badge tone={st === "Paid" ? "ok" : st === "Pending" ? "bad" : "warn"} dot>{st}</Badge>
                </td>
                <td className="td text-right"><Link to={`/fees/${s.id}`} className="link">Collect</Link></td>
              </Row>
            );
          })}
        </DataTable>
        {rows.length === 0 && (
          <EmptyState icon={Wallet} title="No fee records found" body="No student matches these filters. Try clearing them to see the full roll."
            action={<button className="btn btn-secondary" onClick={clear}>Clear filters</button>} />
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

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-h1 font-display font-bold text-ink truncate">{s.name}</h1>
            <p className="mt-1 text-[13px] text-muted">Class {s.cls} · {s.adm} · {s.father} · {s.phone}</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <a className="btn btn-secondary" href={phoneHref(s.phone)}><Phone size={16} /> Call</a>
            <a className="btn btn-wa" href={waHref(s.whatsapp, waText)} target="_blank" rel="noreferrer"
              onClick={() => toast("WhatsApp reminder opened", inr(pending) + " reminder to " + s.father)}>
              <MessageCircle size={16} /> Notify
            </a>
            <button className="btn btn-secondary" onClick={() => toast("Reminder sent", "SMS reminder queued for " + s.phone)}>Send SMS</button>
            <button className="btn btn-primary" onClick={() => setOpen(true)}><Receipt size={15} /> Record Payment</button>
          </div>
        </div>
      </div>

      <div className="mb-6">
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

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard title="Term-wise fee" pad={false}>
          <DataTable head={["Term", { label: "Amount", align: "right" }, { label: "Paid", align: "right" }, { label: "Pending", align: "right" }, "Due date"]}>
            {s.feeTerms.map(ft => (
              <Row key={ft.term}>
                <td className="td font-semibold text-ink">{ft.term}</td>
                <td className="td text-right tabular-nums">{inr(ft.amount)}</td>
                <td className="td text-right text-ok tabular-nums">{inr(ft.paid)}</td>
                <td className="td text-right font-semibold tabular-nums">{ft.amount - ft.paid > 0 ? inr(ft.amount - ft.paid) : "—"}</td>
                <td className="td text-muted">{ft.due}</td>
              </Row>
            ))}
          </DataTable>
        </SectionCard>

        <SectionCard
          title="Payment history"
          pad={false}
          action={<button className="link" onClick={() => toast("Receipt opened", "Prototype — no PDF generated")}>View receipt</button>}
        >
          {s.payments.length === 0
            ? <EmptyState icon={Receipt} title="No payments yet" body="Record the first payment to start the history." />
            : (
              <DataTable head={["Date", { label: "Amount", align: "right" }, "Term", "Method", "Receipt No."]}>
                {s.payments.map(p => (
                  <Row key={p.receipt}>
                    <td className="td">{p.date}</td>
                    <td className="td text-right font-semibold tabular-nums">{inr(p.amount)}</td>
                    <td className="td">{p.term}</td>
                    <td className="td">{p.method}</td>
                    <td className="td text-muted">{p.receipt}</td>
                  </Row>
                ))}
              </DataTable>
            )}
        </SectionCard>
      </div>

      {open && (
        <Modal
          title="Record Payment"
          sub={`${s.name} · Class ${s.cls}`}
          onClose={() => setOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={record}>Record Payment</button>
            </>
          }
        >
          {pending > 0 && (
            <div className="flex items-center justify-between rounded-md bg-warn-bg border border-warn-border px-3.5 py-2.5">
              <span className="text-[13px] text-warn font-medium">Outstanding</span>
              <span className="text-[15px] font-bold text-warn tabular-nums">{inr(pending)}</span>
            </div>
          )}
          <Field label="Fee term">
            <select className="select" value={term} onChange={e => setTerm(e.target.value)}>
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₹)" required>
              <input className="input" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="5000" inputMode="numeric" />
            </Field>
            <Field label="Payment method">
              <select className="select" value={method} onChange={e => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Date">
            <div className="input flex items-center bg-subtle text-muted">18 August 2026</div>
          </Field>
        </Modal>
      )}
    </>
  );
}
