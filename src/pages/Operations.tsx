import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, Bus as BusIcon, FileText, MapPin, MessageCircle, Phone, RotateCcw, Upload } from "lucide-react";
import { DOC_CATEGORIES, SCHOOL_NAME, inr, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import { BackLink, Badge, Bar, DataTable, EmptyState, PageHeader, Row, SectionCard, StatGrid } from "../ui";

export function Documents() {
  const { state, toast } = useApp();
  const [cat, setCat] = useState(DOC_CATEGORIES[0]);
  const files = state.docs[cat] ?? [];

  return (
    <>
      <PageHeader title="Documents" sub="School, staff and certificate records kept in one place." />
      <div className="grid gap-5 items-start lg:grid-cols-[280px_1fr]">
        <section className="panel p-4">
          <div className="kicker mb-3">Categories</div>
          <div className="flex flex-col gap-1.5">
            {DOC_CATEGORIES.map(c => {
              const on = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)}
                  className={"flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer text-left w-full transition-colors "
                    + (on ? "border-accent-200 bg-accent-50" : "border-line bg-surface hover:border-line-strong hover:bg-subtle")}>
                  <span className={"text-[13.5px] " + (on ? "font-bold text-accent-700" : "font-medium text-ink")}>{c}</span>
                  <span className="text-[12px] text-muted">{(state.docs[c] ?? []).length}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="panel p-5">
          <div className="flex justify-between items-start mb-5 gap-4">
            <div>
              <h2 className="text-h2 font-display font-bold text-ink">{cat}</h2>
              <div className="text-[13px] text-muted mt-0.5">{SCHOOL_NAME}</div>
            </div>
            <button className="btn btn-accent-soft" onClick={() => toast("Document uploaded", "Prototype — file not stored")}>
              <Upload size={16} /> Upload
            </button>
          </div>
          {files.length === 0
            ? <EmptyState icon={FileText} title="No documents here yet" body="Upload the first file for this category." />
            : (
              <div className="flex flex-col gap-2.5">
                {files.map(d => (
                  <div key={d.name} className="flex items-center gap-3 rounded-md border border-line px-3.5 py-3 hover:border-line-strong transition-colors">
                    <span className="grid place-items-center h-9 w-9 rounded-lg bg-subtle text-muted shrink-0"><FileText size={17} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-ink truncate">{d.name}</div>
                      <div className="text-[12px] text-muted">{d.meta}</div>
                    </div>
                    <button className="link" onClick={() => toast("Opening document", "Prototype — no viewer")}>Open</button>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </>
  );
}

function expiring(dates: [string, string][]) {
  return dates.filter(([, d]) => d.includes("2026"));
}

export function Transport() {
  const { state } = useApp();
  const buses = state.buses;
  const totalSeats = buses.reduce((a, b) => a + b.capacity, 0);
  const riders = buses.reduce((a, b) => a + b.stops.reduce((x, s) => x + s.students, 0), 0);
  const pendingFee = buses.reduce((a, b) => a + b.students.reduce((x, s) => x + s.feePending, 0), 0);
  const unmarked = buses.filter(b => b.status === "Active" && !b.attendanceToday);
  const paperAlerts = buses.flatMap(b =>
    expiring([["Insurance", b.insuranceExpiry], ["FC", b.fcExpiry], ["Permit", b.permitExpiry], ["Driver licence", b.licenceExpiry]])
      .map(([kind, date]) => ({ bus: b.bus, route: b.route, kind, date, id: b.id }))
  );

  return (
    <>
      <PageHeader title="Transport" sub="Buses, routes, staff and today's bus attendance." />

      <div className="mb-6">
        <StatGrid
          cols={5}
          items={[
            { label: "Buses", value: buses.length, sub: buses.filter(b => b.status === "Active").length + " running today" },
            { label: "Routes", value: buses.length, sub: buses.reduce((a, b) => a + b.stops.length, 0) + " stops" },
            { label: "Students on transport", value: riders, sub: totalSeats + " seats available" },
            { label: "Transport fee pending", value: inr(pendingFee), color: "#b45309" },
            { label: "Attendance not marked", value: unmarked.length, sub: "active buses", color: unmarked.length ? "#b45309" : "#15803d" }
          ]}
        />
      </div>

      {paperAlerts.length > 0 && (
        <SectionCard title="Papers due for renewal" icon={AlertTriangle} className="mb-6" action={<Badge tone="warn">{paperAlerts.length} items</Badge>}>
          <div className="flex flex-wrap gap-2.5">
            {paperAlerts.map((a, i) => (
              <Link key={i} to={`/transport/${a.id}`}
                className="flex items-center gap-2.5 rounded-md border border-line px-3 py-1.5 bg-surface hover:border-warn-border hover:bg-warn-bg transition-colors">
                <span className="text-[13.5px] font-semibold text-ink">{a.bus}</span>
                <span className="text-[12.5px] text-muted">{a.kind}</span>
                <span className="text-[12.5px] text-warn font-semibold">{a.date}</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="panel overflow-hidden">
        <DataTable head={["Bus number", "Route", "Driver", "Attendant", "Occupancy", "Bus attendance today", { label: "Status", align: "center" }, { label: "", align: "right" }]} minWidth={1040}>
          {buses.map(b => {
            const onboard = b.stops.reduce((a, s) => a + s.students, 0);
            const pct = Math.round((onboard / b.capacity) * 100);
            return (
              <Row key={b.id} className="align-top">
                <td className="td font-bold text-ink whitespace-nowrap">{b.bus}</td>
                <td className="td">{b.route}</td>
                <td className="td">
                  <div className="font-semibold text-ink">{b.driver}</div>
                  <div className="text-[12px] text-muted">{b.driverPhone}</div>
                </td>
                <td className="td">
                  <div className="font-semibold text-ink">{b.attendant}</div>
                  <div className="text-[12px] text-muted">{b.attendantPhone}</div>
                </td>
                <td className="td w-[160px]">
                  <Bar pct={pct} color={pct > 95 ? "#d97706" : "#2563eb"} />
                  <div className="text-[12px] text-muted mt-1">{onboard} of {b.capacity} seats</div>
                </td>
                <td className="td">
                  {b.attendanceToday
                    ? <>
                        <Badge tone="ok" dot>{b.attendanceToday.present} present</Badge>
                        <div className="text-[12px] text-muted mt-1">{b.attendanceToday.absent} absent · {b.attendanceToday.at}</div>
                      </>
                    : <Badge tone="warn" dot>Not marked</Badge>}
                </td>
                <td className="td text-center"><Badge tone={b.status === "Active" ? "ok" : "warn"}>{b.status}</Badge></td>
                <td className="td text-right"><Link to={`/transport/${b.id}`} className="link">View route</Link></td>
              </Row>
            );
          })}
        </DataTable>
      </div>
    </>
  );
}

export function RouteDetail() {
  const { id } = useParams();
  const { state, toast } = useApp();
  const b = state.buses.find(x => x.id === id);
  if (!b) return <EmptyState title="Route not found" body="This bus may have been removed." />;

  const onboard = b.stops.reduce((a, s) => a + s.students, 0);
  const pendingFee = b.students.reduce((a, s) => a + s.feePending, 0);

  return (
    <>
      <BackLink to="/transport">Back to Transport</BackLink>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-h1 font-display font-bold text-ink truncate">{b.route} route</h1>
            <p className="mt-1 text-[13px] text-muted">
              {b.bus} · {b.stops.length} stops · {onboard} of {b.capacity} seats · {b.status}
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <a className="btn btn-secondary" href={phoneHref(b.driverPhone)}><Phone size={16} /> Call Driver</a>
            <a className="btn btn-wa" target="_blank" rel="noreferrer"
              href={waHref(b.attendantPhone, "Please confirm today's bus attendance for the " + b.route + " route (" + b.bus + ").")}
              onClick={() => toast("WhatsApp opened", "Message to " + b.attendant)}>
              <MessageCircle size={16} /> Message Attendant
            </a>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <StatGrid
          cols={4}
          items={[
            { label: "Students on route", value: onboard },
            { label: "Occupancy", value: Math.round((onboard / b.capacity) * 100) + "%", sub: b.capacity - onboard + " seats free" },
            { label: "Transport fee pending", value: pendingFee > 0 ? inr(pendingFee) : "—", color: pendingFee > 0 ? "#b45309" : "#15803d" },
            {
              label: "Bus attendance today",
              value: b.attendanceToday ? b.attendanceToday.present + " present" : "Not marked",
              sub: b.attendanceToday ? "marked by " + b.attendanceToday.markedBy + " at " + b.attendanceToday.at : "attendant has not marked yet",
              color: b.attendanceToday ? "#15803d" : "#b45309"
            }
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard title="Stops, pickup and drop" pad={false}>
          <DataTable head={["#", "Stop", "Pickup", "Drop", { label: "Students", align: "right" }]}>
            {b.stops.map((s, i) => (
              <Row key={s.name}>
                <td className="td text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                <td className="td font-semibold text-ink">{s.name}</td>
                <td className="td">{s.pickup}</td>
                <td className="td">{s.drop}</td>
                <td className="td text-right text-muted tabular-nums">{s.students}</td>
              </Row>
            ))}
          </DataTable>
        </SectionCard>

        <div className="flex flex-col gap-6">
          <SectionCard title="Staff on board">
            <div className="grid sm:grid-cols-2 gap-5 text-[14px]">
              <div className="flex flex-col gap-1.5">
                <div className="kicker">Driver</div>
                <div className="font-bold text-[15px] text-ink">{b.driver}</div>
                <div className="text-body">{b.driverPhone}</div>
                <div className="text-muted text-[13px]">Licence {b.licence}</div>
                <div className="text-muted text-[13px]">Valid to {b.licenceExpiry}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="kicker">Attendant</div>
                <div className="font-bold text-[15px] text-ink">{b.attendant}</div>
                <div className="text-body">{b.attendantPhone}</div>
                <div className="text-muted text-[13px]">Marks daily bus attendance</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Vehicle papers" pad={false}>
            <DataTable head={["Document", { label: "Valid until", align: "right" }]}>
              {([["Insurance", b.insuranceExpiry], ["Fitness certificate (FC)", b.fcExpiry], ["Route permit", b.permitExpiry]] as [string, string][]).map(([k, v]) => (
                <Row key={k}>
                  <td className="td">{k}</td>
                  <td className={"td text-right font-semibold " + (v.includes("2026") ? "text-warn" : "text-ink")}>{v}</td>
                </Row>
              ))}
            </DataTable>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Students assigned"
        pad={false}
        className="mt-6"
        action={<span className="text-[12.5px] text-muted">{b.students.length} named · {onboard} total</span>}
      >
        <DataTable head={["Student", "Class", "Stop", { label: "Transport fee", align: "center" }, { label: "Pending", align: "right" }]}>
          {b.students.map(s => (
            <Row key={s.name}>
              <td className="td font-semibold text-ink">{s.name}</td>
              <td className="td">{s.cls}</td>
              <td className="td text-muted">{s.stop}</td>
              <td className="td text-center"><Badge tone={s.feeStatus === "Paid" ? "ok" : "warn"} dot>{s.feeStatus}</Badge></td>
              <td className="td text-right font-semibold tabular-nums">{s.feePending > 0 ? inr(s.feePending) : "—"}</td>
            </Row>
          ))}
        </DataTable>
        {b.students.length === 0 && <EmptyState title="No students named on this route yet" body="Assign students from their profile." />}
      </SectionCard>

      <section className="panel p-5 mt-6">
        <h2 className="text-h3 font-display font-bold text-ink mb-4">Route map</h2>
        <div className="rounded-xl border border-dashed border-line bg-subtle/60 h-[240px] grid place-items-center text-center p-6">
          <div>
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-surface border border-line text-faint mx-auto mb-3"><MapPin size={22} /></span>
            <div className="text-[14px] font-semibold text-ink">Map placeholder</div>
            <p className="text-[13px] text-muted m-0 mt-1.5 max-w-[320px]">
              Live GPS tracking is out of scope. Stop timings above are the source of truth for parents.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Settings() {
  const { state, dispatch, toast } = useApp();
  return (
    <>
      <PageHeader title="Settings" sub="School details and prototype controls." />
      <div className="grid gap-5 md:grid-cols-2 max-w-[920px]">
        <section className="panel p-5">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">School profile</h2>
          <div className="grid gap-x-5 gap-y-3 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
            {[
              ["Name", SCHOOL_NAME],
              ["Academic year", "2026–27"],
              ["Classes", "1 to 12, sections A–C"],
              ["Principal", "Mrs. Priya Raman"],
              ["Teaching staff", String(state.teachers.length + 40)],
              ["Students on roll", String(state.attTotals.total)]
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <span className="text-muted">{k}</span><span className="text-ink font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-h3 font-display font-bold text-ink mb-4">Prototype controls</h2>
          <p className="text-[13.5px] text-muted m-0 mb-4 leading-relaxed">
            Data lives in this browser only. Messages, payments, uploads and printing are simulated.
          </p>
          <button className="btn btn-secondary" onClick={() => { dispatch({ type: "reset" }); toast("Demo data reset", "All modules are back to their starting numbers"); }}>
            <RotateCcw size={15} /> Reset demo data
          </button>
        </section>
      </div>
    </>
  );
}
