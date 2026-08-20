import React from "react";
import { ArrowLeft, Search, LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

/* ============================================================================
   SchoolOS shared component library
   All exports keep their original prop shape so existing pages don't break;
   internals are modernised (rounded surfaces, soft shadows, calm hierarchy).
   ========================================================================== */

/* ---------- Page header ---------- */
export function PageHeader({
  title, sub, action
}: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div className="min-w-0">
        <h1 className="text-h1 font-display font-bold text-ink">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-muted max-w-2xl">{sub}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-muted text-[13px] font-medium
                 hover:text-ink mb-3 w-fit transition-colors"
    >
      <ArrowLeft size={15} /> {children}
    </Link>
  );
}

/* ---------- KPI card (single) ---------- */
export function KpiCard({
  label, value, sub, Icon, tone = "neutral", trend, to
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  Icon?: LucideIcon;
  tone?: "neutral" | "ok" | "warn" | "bad" | "accent";
  trend?: { dir: "up" | "down"; text: string; good?: boolean };
  to?: string;
}) {
  const toneRing: Record<string, string> = {
    neutral: "bg-subtle text-muted",
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    bad: "bg-bad-bg text-bad",
    accent: "bg-accent-50 text-accent-700"
  };
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="kicker leading-[1.35] pt-0.5">{label}</span>
        {Icon && (
          <span className={"grid place-items-center h-9 w-9 rounded-lg shrink-0 " + toneRing[tone]}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <div className="mt-3 stat leading-none">{value}</div>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap min-h-[18px]">
        {trend && (
          <span
            className={"inline-flex items-center gap-0.5 text-[11.5px] font-semibold rounded-full px-1.5 py-0.5 " +
              (trend.good ? "text-ok bg-ok-bg" : "text-bad bg-bad-bg")}
          >
            {trend.dir === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.text}
          </span>
        )}
        {sub && <span className="text-[12px] text-muted">{sub}</span>}
      </div>
    </>
  );
  const cls = "card p-5 transition-shadow duration-200";
  return to
    ? <Link to={to} className={cls + " block hover:shadow-md hover:border-line-strong"}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

/* ---------- KPI grid (compat with old StatGrid API) ---------- */
export function StatGrid({
  items, cols = 4
}: {
  items: { label: string; value: React.ReactNode; sub?: React.ReactNode; color?: string; Icon?: LucideIcon; tone?: "neutral" | "ok" | "warn" | "bad" | "accent" }[];
  cols?: number;
}) {
  // Map a legacy hex `color` to a tone for the accent value, keeping visual intent.
  const colorToTone = (c?: string): string | undefined => {
    if (!c) return undefined;
    if (c.includes("15803d") || c.includes("16a34a")) return "#15803d";
    if (c.includes("b45309") || c.includes("d97706")) return "#b45309";
    if (c.includes("b91c1c") || c.includes("be123c") || c.includes("e11d48")) return "#be123c";
    return c;
  };
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
    >
      {items.map((it, i) => (
        <div key={i} className="card p-4.5">
          <div className="flex items-center justify-between gap-2">
            <span className="kicker">{it.label}</span>
            {it.Icon && <it.Icon size={15} className="text-faint" />}
          </div>
          <div
            className="mt-2.5 stat"
            style={it.color ? { color: colorToTone(it.color) } : undefined}
          >
            {it.value}
          </div>
          {it.sub && <div className="mt-1 text-[12.5px] text-muted">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  tone, children, dot
}: { tone: "ok" | "warn" | "bad" | "accent" | "neutral"; children: React.ReactNode; dot?: boolean }) {
  const map: Record<string, string> = {
    ok: "bg-ok-bg text-ok border-ok-border",
    warn: "bg-warn-bg text-warn border-warn-border",
    bad: "bg-bad-bg text-bad border-bad-border",
    accent: "bg-accent-50 text-accent-700 border-accent-100",
    neutral: "bg-subtle text-muted border-line"
  };
  const dotMap: Record<string, string> = {
    ok: "bg-ok-strong", warn: "bg-warn-strong", bad: "bg-bad-strong",
    accent: "bg-accent", neutral: "bg-faint"
  };
  return (
    <span className={"chip border " + map[tone]}>
      {dot && <span className={"h-1.5 w-1.5 rounded-full " + dotMap[tone]} />}
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */
const AVATAR_TINTS = [
  "bg-accent-100 text-accent-700",
  "bg-[#e7f2ec] text-[#15803d]",
  "bg-[#fbecef] text-[#be123c]",
  "bg-[#f0ecfb] text-[#6d28d9]",
  "bg-[#fdf1e0] text-[#b45309]",
  "bg-[#e4f2f7] text-[#0e7490]"
];
export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const text = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const tint = AVATAR_TINTS[name.charCodeAt(0) % AVATAR_TINTS.length];
  return (
    <span
      className={"grid place-items-center font-bold shrink-0 rounded-full " + tint}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {text}
    </span>
  );
}

/* ---------- Progress bar ---------- */
export function Bar({
  pct, color = "#2563eb", track = "#eef1f6", height = 8
}: { pct: number; color?: string; track?: string; height?: number }) {
  const v = Math.min(100, Math.max(0, pct));
  return (
    <span className="block rounded-full overflow-hidden" style={{ background: track, height }}>
      <span
        className="block h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: v + "%", background: color }}
      />
    </span>
  );
}

/* ---------- Form field ---------- */
export function Field({
  label, children, hint, required, error
}: { label: string; children: React.ReactNode; hint?: string; required?: boolean; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">
        {label}{required && <span className="text-bad ml-0.5">*</span>}
      </span>
      {children}
      {error
        ? <span className="text-[12px] text-bad font-medium">{error}</span>
        : hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

/* ---------- Search input ---------- */
export function SearchInput({
  value, onChange, placeholder, className = ""
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={"field-shell " + className}>
      <Search size={16} className="text-faint shrink-0" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

/* ---------- Toolbar (search + filters row) ---------- */
export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel p-3 mb-4 flex flex-wrap items-center gap-3">{children}</div>
  );
}

/* ---------- Section card (titled panel) ---------- */
export function SectionCard({
  title, icon: Icon, action, children, pad = true, className = ""
}: {
  title: React.ReactNode; icon?: LucideIcon; action?: React.ReactNode;
  children: React.ReactNode; pad?: boolean; className?: string;
}) {
  return (
    <section className={"panel " + className}>
      <div className="sectionhead">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon size={17} className="text-muted shrink-0" />}
          <h2 className="text-h3 font-display font-bold text-ink truncate">{title}</h2>
        </div>
        {action}
      </div>
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({
  tabs, value, onChange
}: { tabs: readonly T[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 border-b border-line mb-5 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={"tab " + (value === t ? "tab-active" : "tab-idle")}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({
  title, body, action, icon: Icon
}: { title: string; body: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="px-6 py-14 text-center flex flex-col items-center animate-fade-in">
      {Icon && (
        <span className="grid place-items-center h-12 w-12 rounded-xl bg-subtle text-faint mb-4">
          <Icon size={22} />
        </span>
      )}
      <div className="font-display font-bold text-[17px] text-ink mb-1">{title}</div>
      <p className="text-muted text-[13.5px] m-0 mb-4 max-w-sm">{body}</p>
      {action}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  title, sub, onClose, children, actions, width = 480
}: {
  title: string; sub?: string; onClose: () => void;
  children: React.ReactNode; actions: React.ReactNode; width?: number;
}) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card shadow-pop w-full animate-scale-in"
        style={{ maxWidth: width }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 px-5 py-4 border-b border-line">
          <div className="min-w-0">
            <h2 className="text-h2 font-display font-bold text-ink">{title}</h2>
            {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
          </div>
          <button className="icon-btn shrink-0" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-line bg-subtle/40 rounded-b-xl">
          {actions}
        </div>
      </div>
    </div>
  );
}

/* ---------- Data table ---------- */
export function DataTable({
  head, children, minWidth
}: { head: (string | { label: string; align?: "left" | "right" | "center" })[]; children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => {
              const label = typeof h === "string" ? h : h.label;
              const align = typeof h === "string" ? "left" : (h.align ?? "left");
              return (
                <th key={i} className={"th " + (align === "right" ? "text-right" : align === "center" ? "text-center" : "")}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* Row helper for consistent hover + divider styling */
export function Row({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={"border-b border-line last:border-0 transition-colors hover:bg-subtle/60 "
        + (onClick ? "cursor-pointer " : "") + className}
    >
      {children}
    </tr>
  );
}

/* ---------- Timeline (admission / activity) ---------- */
export function Timeline({
  items
}: { items: { label: string; meta?: string; done?: boolean; current?: boolean }[] }) {
  return (
    <div className="flex flex-col">
      {items.map((it, i) => (
        <div key={i} className="flex gap-3.5 items-start">
          <div className="flex flex-col items-center shrink-0">
            <span
              className={"h-3.5 w-3.5 rounded-full grid place-items-center border-2 "
                + (it.done ? "bg-accent border-accent" : it.current ? "bg-white border-accent" : "bg-white border-line-strong")}
            >
              {it.current && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </span>
            {i < items.length - 1 && (
              <span className={"w-0.5 flex-1 min-h-[30px] " + (it.done ? "bg-accent-200" : "bg-line")} />
            )}
          </div>
          <div className="pb-5">
            <div className={"text-[14px] font-semibold " + (it.done || it.current ? "text-ink" : "text-muted")}>{it.label}</div>
            {it.meta && <div className="text-[12.5px] text-muted mt-0.5">{it.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"skel " + className} />;
}

/* ---------- Donut chart ---------- */
export function Donut({
  segments, size = 150, thickness = 18, centerLabel, centerSub
}: {
  segments: { value: number; color: string }[];
  size?: number; thickness?: number;
  centerLabel?: React.ReactNode; centerSub?: React.ReactNode;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Proportion chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f6" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness} strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 grid place-content-center text-center">
          {centerLabel && <div className="font-display font-bold text-[24px] leading-none text-ink">{centerLabel}</div>}
          {centerSub && <div className="text-[11.5px] text-muted mt-1">{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------- School illustration (inline SVG, brand-tinted) ----------
   Self-contained scene — building with dome & clock, flag, trees, clouds, sun.
   No external assets; scales crisply and inherits the hero gradient behind it. */
export function SchoolScene({ className = "", height = 190 }: { className?: string; height?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 240"
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="ss-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eaf0fb" />
        </linearGradient>
        <linearGradient id="ss-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="ss-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="ss-tree" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5db07a" />
          <stop offset="1" stopColor="#3f9463" />
        </linearGradient>
      </defs>

      {/* sun */}
      <circle cx="60" cy="48" r="22" fill="#fcd34d" opacity="0.9" />
      <circle cx="60" cy="48" r="30" fill="#fcd34d" opacity="0.25" />

      {/* clouds */}
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="140" cy="44" rx="26" ry="12" />
        <ellipse cx="160" cy="48" rx="20" ry="10" />
        <ellipse cx="330" cy="60" rx="30" ry="13" />
        <ellipse cx="352" cy="64" rx="22" ry="11" />
      </g>

      {/* trees */}
      <g>
        <rect x="40" y="168" width="8" height="34" rx="3" fill="#8a6a4a" />
        <circle cx="44" cy="158" r="26" fill="url(#ss-tree)" />
        <circle cx="30" cy="170" r="18" fill="url(#ss-tree)" />
        <circle cx="58" cy="170" r="18" fill="url(#ss-tree)" />
      </g>
      <g>
        <rect x="374" y="172" width="8" height="30" rx="3" fill="#8a6a4a" />
        <circle cx="378" cy="162" r="24" fill="url(#ss-tree)" />
        <circle cx="392" cy="174" r="16" fill="url(#ss-tree)" />
        <circle cx="364" cy="174" r="16" fill="url(#ss-tree)" />
      </g>

      {/* ground */}
      <rect x="0" y="200" width="420" height="40" rx="0" fill="#dfe8f6" opacity="0.7" />

      {/* left & right wings */}
      <rect x="96" y="126" width="60" height="76" rx="4" fill="url(#ss-wall)" stroke="#c9d6ee" />
      <rect x="264" y="126" width="60" height="76" rx="4" fill="url(#ss-wall)" stroke="#c9d6ee" />
      <rect x="96" y="118" width="60" height="12" rx="3" fill="url(#ss-roof)" />
      <rect x="264" y="118" width="60" height="12" rx="3" fill="url(#ss-roof)" />

      {/* wing windows */}
      <g fill="#bcd3ff">
        <rect x="106" y="140" width="16" height="18" rx="2" />
        <rect x="130" y="140" width="16" height="18" rx="2" />
        <rect x="106" y="168" width="16" height="18" rx="2" />
        <rect x="130" y="168" width="16" height="18" rx="2" />
        <rect x="274" y="140" width="16" height="18" rx="2" />
        <rect x="298" y="140" width="16" height="18" rx="2" />
        <rect x="274" y="168" width="16" height="18" rx="2" />
        <rect x="298" y="168" width="16" height="18" rx="2" />
      </g>

      {/* main block */}
      <rect x="150" y="104" width="120" height="98" rx="5" fill="url(#ss-wall)" stroke="#c9d6ee" />
      <rect x="146" y="96" width="128" height="14" rx="4" fill="url(#ss-roof)" />

      {/* dome + clock + flag */}
      <path d="M186 96 Q210 58 234 96 Z" fill="url(#ss-dome)" />
      <rect x="207" y="40" width="6" height="20" rx="2" fill="#94a3b8" />
      <path d="M213 42 L233 48 L213 54 Z" fill="#e11d48" />
      <circle cx="210" cy="86" r="9" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
      <path d="M210 86 L210 81 M210 86 L214 88" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />

      {/* main windows */}
      <g fill="#bcd3ff">
        <rect x="162" y="122" width="20" height="22" rx="2" />
        <rect x="238" y="122" width="20" height="22" rx="2" />
        <rect x="162" y="154" width="20" height="22" rx="2" />
        <rect x="238" y="154" width="20" height="22" rx="2" />
      </g>

      {/* door + steps */}
      <path d="M196 202 v-34 a14 14 0 0 1 28 0 v34 Z" fill="#2563eb" />
      <path d="M196 168 a14 14 0 0 1 28 0" fill="#1d4ed8" />
      <line x1="210" y1="176" x2="210" y2="202" stroke="#bcd3ff" strokeWidth="1.5" />
      <rect x="188" y="202" width="44" height="6" rx="2" fill="#c9d6ee" />
    </svg>
  );
}
