import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] mb-1.5">{title}</h1>
          {sub && <p className="m-0 text-[14.5px] text-muted">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="rule my-5" />
    </>
  );
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-muted text-[13.5px] no-underline hover:no-underline mb-3.5 w-fit min-h-[44px] items-center">
      <ArrowLeft size={15} /> {children}
    </Link>
  );
}

export function StatGrid({ items, cols = 4 }: {
  items: { label: string; value: React.ReactNode; sub?: React.ReactNode; color?: string }[];
  cols?: number;
}) {
  return (
    <div className="panel grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {items.map((it, i) => (
        <div key={i} className={"px-5 py-[18px]" + (i < items.length - 1 ? " border-r border-line" : "")}>
          <div className="kicker">{it.label}</div>
          <div className="stat" style={it.color ? { color: it.color } : undefined}>{it.value}</div>
          {it.sub && <div className="text-[12.5px] text-muted">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "bad" | "accent"; children: React.ReactNode }) {
  const map = {
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    bad: "bg-bad-bg text-bad",
    accent: "bg-accent-100 text-accent-700"
  };
  return <span className={"inline-block px-2.5 py-1 text-[12px] font-semibold " + map[tone]}>{children}</span>;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const text = name.split(" ").map(p => p[0]).join("").slice(0, 2);
  return (
    <span
      className="bg-accent-200 text-accent-700 grid place-items-center font-extrabold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {text}
    </span>
  );
}

export function Bar({ pct, color = "#1d4ed8", track = "#f4f4f5" }: { pct: number; color?: string; track?: string }) {
  return (
    <span className="block h-2.5 relative" style={{ background: track }}>
      <span className="absolute left-0 top-0 bottom-0 block" style={{ width: Math.min(100, Math.max(0, pct)) + "%", background: color }} />
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="p-14 text-center">
      <div className="font-extrabold text-[19px] mb-1.5">{title}</div>
      <p className="text-muted text-[14px] m-0 mb-4">{body}</p>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, actions, width = 480 }: {
  title: string; onClose: () => void; children: React.ReactNode; actions: React.ReactNode; width?: number;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6" style={{ background: "rgba(31,36,48,0.5)" }} onClick={onClose}>
      <div className="panel shadow-lg" style={{ width: `min(${width}px, 100%)` }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-[22px] py-[18px] border-b-2 border-divider">
          <h2 className="text-[20px] m-0">{title}</h2>
          <button className="btn btn-secondary w-11 justify-center px-0" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="p-[22px] flex flex-col gap-4">{children}</div>
        <div className="flex justify-end gap-2.5 px-[22px] py-[18px] border-t border-line">{actions}</div>
      </div>
    </div>
  );
}

export function DataTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-divider">{head.map(h => <th key={h} className="th">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
