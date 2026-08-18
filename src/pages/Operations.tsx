import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, Bus as BusIcon, FileText, MessageCircle, Phone, Upload } from "lucide-react";
import { DOC_CATEGORIES, SCHOOL_NAME, inr, phoneHref, waHref } from "../data";
import { useApp } from "../store";
import { BackLink, Badge, Bar, DataTable, EmptyState, PageHeader, StatGrid } from "../ui";

export function Documents() {
  const { state, toast } = useApp();
  const [cat, setCat] = useState(DOC_CATEGORIES[0]);
  const files = state.docs[cat] ?? [];

  return (
    <>
      <PageHeader title="Documents" sub="School, staff and certificate records kept in one place." />
      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "280px 1fr" }}>
        <section className="panel p-4">
          <div className="kicker mb-3">Categories</div>
          <div className="flex flex-col gap-2">
            {DOC_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={"flex flex-col items-start px-3 py-2.5 min-h-[33px] border cursor-pointer text-left w-full " +
                  (cat === c ? "border-accent bg-accent-100" : "border-line bg-white hover:border-accent")}>
                <span className={"text-[14px] " + (cat === c ? "font-bold" : "font-medium")}>{c}</span>
                <span className="text-[12px] text-muted">{(state.docs[c] ?? []).length} files</span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <div className="flex justify-between items-start mb-[18px]">
            <div>
              <h2 className="text-[19px] m-0 mb-1">{cat}</h2>
              <div className="text-[13px] text-muted">{SCHOOL_NAME}</div>
            </div>
            <button className="btn btn-accent-soft" onClick={() => toast("Document uploaded", "Prototype — file not stored")}>
              <Upload size={16} /> Upload Document
            </button>
          </div>
          {files.length === 0
            ? <EmptyState title="No documents here yet" body="Upload the first file for this category." />
            : (
              <div className="flex flex-col gap-2.5">
                {files.map(d => (
                  <div key={d.name} className="flex items-center gap-3 border border-line px-3.5 py-3">
                    <FileText size={18} className="text-muted shrink-0" />
                    <div className="flex-1">
                      <div className="text-[14.5px] font-semibold">{d.name}</div>
                      <div className="text-[12.5px] text-muted">{d.meta}</div>
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
  // Papers expiring in 2026 are treated as "due soon" against the demo date of Aug 2026.
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

      <div className="mb-5">
        <StatGrid
          cols={5}
          items={[
            { label: "Buses", value: buses.length, sub: buses.filter(b => b.status === "Active").length + " running today" },
            { label: "Routes", value: buses.length, sub: buses.reduce((a, b) => a + b.stops.length, 0) + " stops" },
            { label: "Students using transport", value: riders, sub: totalSeats + " seats available" },
            { label: "Transport fee pending", value: inr(pendingFee), color: "#b45309" },
            { label: "Attendance not marked", value: unmarked.length, sub: "active buses", color: unmarked.length ? "#b45309" : "#15803d" }
          ]}
        />
      </div>

      {paperAlerts.length > 0 && (
        <section className="panel mb-5">
          <div className="sectionhead">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-warn" />
              <h2 className="text-[18px] m-0">Papers due for renewal</h2>
            </div>
            <span className="text-[13px] text-muted">{paperAlerts.length} items</span>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {paperAlerts.map((a, i) => (
              <Link key={i} to={`/transport/${a.id}`}
                className="flex items-center gap-3 border border-line px-3 min-h-[33px] text-ink no-underline hover:no-underline hover:border-accent">
                <span className="text-[14px] font-semibold">{a.bus}</span>
                <span className="text-[13px] text-muted">{a.kind}</span>
                <span className="text-[13px] text-warn font-semibold">{a.date}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="panel">
        <DataTable head={["Bus number", "Route", "Driver", "Attendant", "Occupancy", "Bus attendance today", "Status", "Action"]}>
          {buses.map(b => {
            const onboard = b.stops.reduce((a, s) => a + s.students, 0);
            const pct = Math.round((onboard / b.capacity) * 100);
            return (
              <tr key={b.id} className="border-b border-line hover:bg-accent-100 align-top">
                <td className="td font-bold whitespace-nowrap">{b.bus}</td>
                <td className="td">{b.route}</td>
                <td className="td">
                  <div className="font-semibold">{b.driver}</div>
                  <div className="text-[12.5px] text-muted">{b.driverPhone}</div>
                </td>
                <td className="td">
                  <div className="font-semibold">{b.attendant}</div>
                  <div className="text-[12.5px] text-muted">{b.attendantPhone}</div>
                </td>
                <td className="td w-[150px]">
                  <Bar pct={pct} color={pct > 95 ? "#b45309" : "#1d4ed8"} />
                  <div className="text-[12.5px] text-muted mt-1">{onboard} of {b.capacity} seats</div>
                </td>
                <td className="td">
                  {b.attendanceToday
                    ? <>
                        <Badge tone="ok">{b.attendanceToday.present} present</Badge>
                        <div className="text-[12.5px] text-muted mt-1">{b.attendanceToday.absent} absent · {b.attendanceToday.at}</div>
                      </>
                    : <Badge tone="warn">Not marked</Badge>}
                </td>
                <td className="td"><Badge tone={b.status === "Active" ? "ok" : "warn"}>{b.status}</Badge></td>
                <td className="td"><Link to={`/transport/${b.id}`} className="text-[13.5px] font-semibold underline">View route</Link></td>
              </tr>
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
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[30px] mb-1.5">{b.route} route</h1>
          <p className="m-0 text-[14px] text-muted">
            {b.bus} · {b.stops.length} stops · {onboard} of {b.capacity} seats used · {b.status}
          </p>
        </div>
        <div className="flex gap-2.5">
          <a className="btn btn-secondary text-ink no-underline hover:no-underline" href={phoneHref(b.driverPhone)}><Phone size={16} /> Call Driver</a>
          <a className="btn btn-wa text-white no-underline hover:no-underline" target="_blank" rel="noreferrer"
            href={waHref(b.attendantPhone, "Please confirm today's bus attendance for the " + b.route + " route (" + b.bus + ").")}
            onClick={() => toast("WhatsApp opened", "Message to " + b.attendant)}>
            <MessageCircle size={16} /> Message Attendant
          </a>
        </div>
      </div>
      <div className="rule my-5" />

      <div className="mb-5">
        <StatGrid
          cols={4}
          items={[
            { label: "Students on this route", value: onboard },
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

      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel">
          <div className="sectionhead"><h2 className="text-[18px] m-0">Stops, pickup and drop</h2></div>
          <DataTable head={["#", "Stop", "Pickup", "Drop", "Students"]}>
            {b.stops.map((s, i) => (
              <tr key={s.name} className="border-b border-line">
                <td className="td text-muted">{String(i + 1).padStart(2, "0")}</td>
                <td className="td font-semibold">{s.name}</td>
                <td className="td">{s.pickup}</td>
                <td className="td">{s.drop}</td>
                <td className="td text-muted">{s.students}</td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section className="panel">
          <div className="sectionhead"><h2 className="text-[18px] m-0">Staff on board</h2></div>
          <div className="p-5 grid grid-cols-2 gap-5 text-[14px]">
            <div className="flex flex-col gap-2">
              <div className="kicker">Driver</div>
              <div className="font-bold text-[15px]">{b.driver}</div>
              <div>{b.driverPhone}</div>
              <div className="text-muted">Licence {b.licence}</div>
              <div className="text-muted">Valid to {b.licenceExpiry}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="kicker">Attendant</div>
              <div className="font-bold text-[15px]">{b.attendant}</div>
              <div>{b.attendantPhone}</div>
              <div className="text-muted">Marks daily bus attendance</div>
            </div>
          </div>
          <div className="sectionhead border-t-2"><h2 className="text-[18px] m-0">Vehicle papers</h2></div>
          <DataTable head={["Document", "Valid until"]}>
            {[["Insurance", b.insuranceExpiry], ["Fitness certificate (FC)", b.fcExpiry], ["Route permit", b.permitExpiry]].map(([k, v]) => (
              <tr key={k} className="border-b border-line">
                <td className="td">{k}</td>
                <td className={"td font-semibold " + (v.includes("2026") ? "text-warn" : "")}>{v}</td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>

      <section className="panel mt-5">
        <div className="sectionhead">
          <h2 className="text-[18px] m-0">Students assigned</h2>
          <span className="text-[13px] text-muted">{b.students.length} named · {onboard} total on route</span>
        </div>
        <DataTable head={["Student", "Class", "Stop", "Transport fee", "Pending"]}>
          {b.students.map(s => (
            <tr key={s.name} className="border-b border-line">
              <td className="td font-semibold">{s.name}</td>
              <td className="td">{s.cls}</td>
              <td className="td text-muted">{s.stop}</td>
              <td className="td"><Badge tone={s.feeStatus === "Paid" ? "ok" : "warn"}>{s.feeStatus}</Badge></td>
              <td className="td font-semibold">{s.feePending > 0 ? inr(s.feePending) : "—"}</td>
            </tr>
          ))}
        </DataTable>
        {b.students.length === 0 && <EmptyState title="No students named on this route yet" body="Assign students from their profile." />}
      </section>

      <section className="panel mt-5 p-5">
        <h2 className="text-[18px] m-0 mb-3.5">Route map</h2>
        <div className="border border-dashed border-line bg-ground h-[240px] grid place-items-center text-center p-6">
          <div>
            <BusIcon size={34} className="text-muted mx-auto mb-2.5" />
            <div className="text-[14.5px] font-semibold">Map placeholder</div>
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
      <div className="grid grid-cols-2 gap-5 max-w-[920px]">
        <section className="panel p-5">
          <h2 className="text-[17px] m-0 mb-3.5">School profile</h2>
          <div className="grid gap-x-5 gap-y-2.5 text-[14px]" style={{ gridTemplateColumns: "auto 1fr" }}>
            {[
              ["Name", SCHOOL_NAME],
              ["Academic year", "2026–27"],
              ["Classes", "1 to 12, sections A–C"],
              ["Principal", "Mrs. Priya Raman"],
              ["Teaching staff", String(state.teachers.length + 40)],
              ["Students on roll", String(state.attTotals.total)]
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <span className="text-muted">{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-[17px] m-0 mb-3.5">Prototype controls</h2>
          <p className="text-[14px] text-muted m-0 mb-4">
            Data lives in this browser only. Messages, payments, uploads and printing are simulated.
          </p>
          <button className="btn btn-secondary" onClick={() => { dispatch({ type: "reset" }); toast("Demo data reset", "All modules are back to their starting numbers"); }}>
            Reset demo data
          </button>
        </section>
      </div>
    </>
  );
}
