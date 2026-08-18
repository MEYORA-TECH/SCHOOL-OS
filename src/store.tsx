import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import {
  Bus, Enquiry, Mark, Message, Role, StageKey, Student, Task, Teacher, WorklogEntry,
  seedAdmissions, seedBuses, seedStudents, seedTasks, seedTeachers, seedWorklog
} from "./data";

export interface State {
  signedIn: boolean;
  role: Role;
  /** Which teacher is signed in, when role === "teacher". */
  teacherId: string;
  students: Student[];
  admissions: Enquiry[];
  teachers: Teacher[];
  worklog: WorklogEntry[];
  tasks: Task[];
  buses: Bus[];
  docs: Record<string, { name: string; meta: string }[]>;
  attTotals: { present: number; absent: number; total: number };
  classRates: Record<string, number>;
  attSaved: Record<string, Record<string, Mark>>;
  extraCollected: number;
  feeExpected: number;
  feeCollectedBase: number;
  messages: Message[];
}

const initial: State = {
  signedIn: false,
  role: "principal",
  teacherId: "t0",
  students: seedStudents(),
  admissions: seedAdmissions(),
  teachers: seedTeachers(),
  worklog: seedWorklog(),
  tasks: seedTasks(),
  buses: seedBuses(),
  docs: {
    Certificates: [
      { name: "Bonafide certificate template", meta: "DOCX · updated 04 Jul 2026" },
      { name: "Conduct certificate template", meta: "DOCX · updated 04 Jul 2026" }
    ],
    "Transfer Certificates": [
      { name: "TC — Nithya Balaji (10-B, 2026)", meta: "PDF · issued 28 Apr 2026" },
      { name: "TC — Harish Kumar (9-A, 2026)", meta: "PDF · issued 02 May 2026" }
    ],
    "Staff Documents": [
      { name: "Staff handbook 2026–27", meta: "PDF · updated 01 Jun 2026" },
      { name: "Salary structure — teaching staff", meta: "XLSX · updated 01 Jun 2026" }
    ],
    "School Documents": [
      { name: "Matriculation recognition certificate", meta: "PDF · valid to 2029" },
      { name: "Fire safety compliance", meta: "PDF · valid to 14 Feb 2027" },
      { name: "Building stability certificate", meta: "PDF · valid to 2028" }
    ]
  },
  attTotals: { present: 796, absent: 46, total: 842 },
  classRates: { "10-A": 95, "10-B": 93, "9-A": 97, "9-B": 91 },
  attSaved: {},
  extraCollected: 0,
  feeExpected: 1200000,
  feeCollectedBase: 920000,
  messages: []
};

export type Action =
  | { type: "signIn"; role: Role; teacherId?: string }
  | { type: "signOut" }
  | { type: "addStudent"; student: Student }
  | { type: "saveAttendance"; cls: string; marks: Record<string, Mark> }
  | { type: "recordPayment"; id: string; amount: number; method: string; term: string }
  | { type: "addEnquiry"; enquiry: Enquiry }
  | { type: "setStage"; id: string; stage: StageKey }
  | { type: "sendMessage"; message: Message }
  | { type: "addWorklog"; entry: WorklogEntry }
  | { type: "toggleTask"; id: string }
  | { type: "saveMarks"; edits: Record<string, Record<string, number>> }
  | { type: "reset" };

/** One saved class stands in for ~3 classes of the same size in this demo school. */
const CLASS_WEIGHT = 3;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "signIn": return { ...state, signedIn: true, role: action.role, teacherId: action.teacherId ?? state.teacherId };
    case "signOut": return { ...state, signedIn: false };
    case "addStudent": return { ...state, students: [...state.students, action.student] };
    case "saveAttendance": {
      const ids = Object.keys(action.marks);
      const present = ids.filter(k => action.marks[k] === "present").length;
      const absent = ids.length - present;
      const prev = state.attSaved[action.cls];
      let dP = 0, dA = 0;
      if (prev) {
        const pIds = Object.keys(prev);
        const prevPresent = pIds.filter(k => prev[k] === "present").length;
        dP = present - prevPresent;
        dA = absent - (pIds.length - prevPresent);
      }
      return {
        ...state,
        attSaved: { ...state.attSaved, [action.cls]: action.marks },
        classRates: { ...state.classRates, [action.cls]: ids.length ? Math.round((present / ids.length) * 100) : 100 },
        attTotals: {
          ...state.attTotals,
          present: state.attTotals.present + dP * CLASS_WEIGHT,
          absent: state.attTotals.absent + dA * CLASS_WEIGHT
        }
      };
    }
    case "recordPayment":
      return {
        ...state,
        extraCollected: state.extraCollected + action.amount,
        students: state.students.map(s => {
          if (s.id !== action.id) return s;
          let left = action.amount;
          const feeTerms = s.feeTerms.map(t => {
            if (left <= 0) return t;
            const room = t.amount - t.paid;
            const take = Math.min(room, left);
            left -= take;
            return { ...t, paid: t.paid + take };
          });
          return {
            ...s,
            feePaid: Math.min(s.feeTotal, s.feePaid + action.amount),
            feeTerms,
            payments: [...s.payments, {
              date: "18 Aug", amount: action.amount, method: action.method, term: action.term,
              receipt: "RC" + (4000 + Math.floor(Math.random() * 900))
            }]
          };
        })
      };
    case "addEnquiry": return { ...state, admissions: [action.enquiry, ...state.admissions] };
    case "setStage":
      return { ...state, admissions: state.admissions.map(a => a.id === action.id ? { ...a, stage: action.stage } : a) };
    case "sendMessage": return { ...state, messages: [action.message, ...state.messages] };
    case "addWorklog": return { ...state, worklog: [action.entry, ...state.worklog] };
    case "toggleTask":
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: t.status === "Open" ? "Done" : "Open" } : t)
      };
    case "saveMarks":
      return {
        ...state,
        students: state.students.map(s =>
          action.edits[s.id] ? { ...s, marks: { ...s.marks, ...action.edits[s.id] } } : s)
      };
    case "reset": return { ...initial, signedIn: state.signedIn, role: state.role, teacherId: state.teacherId };
    default: return state;
  }
}

const KEY = "schoolos.state.v2";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...(JSON.parse(raw) as State) };
  } catch { return initial; }
}

export interface Toast { id: number; title: string; sub?: string; }

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  toast: (title: string, sub?: string) => void;
  toasts: Toast[];
  /** The signed-in teacher, when role === "teacher". */
  me: Teacher | null;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const toast = useCallback((title: string, sub?: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, title, sub }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const me = state.role === "teacher" ? state.teachers.find(t => t.id === state.teacherId) ?? null : null;
  const value = useMemo(() => ({ state, dispatch, toast, toasts, me }), [state, toasts, toast, me]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Derived school-wide numbers, shared by the dashboard and Fees. */
export function useTotals() {
  const { state } = useApp();
  const collected = state.feeCollectedBase + state.extraCollected;
  const pending = Math.max(0, state.feeExpected - collected);
  const rate = state.attTotals.total ? (state.attTotals.present / state.attTotals.total) * 100 : 0;
  return {
    collected, pending, expected: state.feeExpected,
    collectionPct: Math.round((collected / state.feeExpected) * 100),
    attendanceRate: rate,
    present: state.attTotals.present,
    absent: state.attTotals.absent
  };
}
