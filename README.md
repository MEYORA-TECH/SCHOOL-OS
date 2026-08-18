# SchoolOS — React prototype

School management CRM for small and medium Indian schools. Frontend-only: React 18 + TypeScript + Vite + Tailwind + React Router + lucide-react. No backend; state lives in React and persists to `localStorage`.

## Run

```bash
cd react-app
npm install
npm run dev
```

## Sign in

The login screen has a Principal / Teacher switch and two one-click demo buttons. Any password works.

- **Principal** — Mrs. Priya Raman. All modules.
- **Teacher** — pick any of the eight teachers (Sudha Ramesh is class teacher of 10-A). Sees Dashboard, Attendance for her own classes, My Worklog, Exams, My Profile.

## Design system

Modernist: flat surfaces, zero corner radius (enforced globally in `index.css`), 2px dividers between major sections, Archivo throughout, one accent — professional blue `#1d4ed8` — used for primary actions and selection only. Semantic colour is fixed: green paid/present, amber pending, red absent/overdue. Every control is 44px tall, one size everywhere.

Tokens live in `tailwind.config.js`; component classes (`.btn`, `.panel`, `.input`, `.th`, `.td`, `.stat`) in `src/index.css`.

## Modules

| Route | What it does |
| --- | --- |
| `/` | Principal dashboard — KPIs, weekly attendance trend, class-wise rates, lowest attendance, term-wise fees, largest pending amounts, admissions funnel, worklog compliance, transport snapshot, needs attention, quick actions. Teachers get their own dashboard: today's periods, syllabus progress, tasks from the principal. |
| `/students` | List with search and class/status filters, add student, Student 360 (Overview / Attendance / Fees / Exams), call and WhatsApp the parent |
| `/teachers` | Staff table with worklog-written-today status; profile tabs: Overview, Timetable, Worklog, Leave, Salary, Documents |
| `/admissions` | Kanban pipeline (New → Contacted → School Visit → Application → Admitted), enquiry detail with timeline, WhatsApp the parent |
| `/fees` | Nine filters — search, class, section, paid/partly/pending, outstanding term, payment method, pending threshold, paid-between dates — plus term-wise fee table, payment history, Record Payment, WhatsApp fee reminder |
| `/attendance` | Present/Absent per student, Mark All Present, running counts, save — updates the dashboard rate |
| `/communication` | Audience picker, composer with 500-character cap, phone preview, simulated send |
| `/exams` | Exam cards, marks entry with live totals and grades, printable report card |
| `/worklog` | Teacher Worklog. Teacher logs period / class / subject / topic / remarks / attendance-marked / syllabus %; principal reviews all entries, sees who hasn't written and reminds them |
| `/documents` | School, staff, certificate and TC records (no per-student documents) |
| `/transport` | Buses with occupancy bars, driver and attendant contacts, today's bus attendance (marked by the attendant), papers due for renewal. Route detail adds stop-wise pickup/drop times, licence details, vehicle papers, and assigned students with transport-fee status |
| `/settings` | School profile, reset demo data |

## Data

All seed data is in `src/data.ts` — realistic Indian names, 10-digit phone numbers in `XXXXX XXXXX` format, rupee fee amounts, Chennai bus routes. No real personal information. Reducer and persistence live in `src/store.tsx`.

## Not implemented (by design)

Real authentication, database, WhatsApp Business API (buttons open `wa.me` links with a prefilled message), SMS, payment gateway, file storage, GPS tracking.
