import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Role, seedTeachers } from "../data";
import { useApp } from "../store";
import { Field } from "../ui";

const TEACHERS = seedTeachers();

export default function Login() {
  const { dispatch, toast } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("principal");
  const [teacherId, setTeacherId] = useState("t0");
  const [email, setEmail] = useState("priya@abcschool.edu.in");
  const [pass, setPass] = useState("demo1234");

  function pick(next: Role, id?: string) {
    setRole(next);
    if (id) setTeacherId(id);
    const t = TEACHERS.find(x => x.id === (id || teacherId))!;
    setEmail(next === "principal" ? "priya@abcschool.edu.in" : t.email);
  }

  function signIn() {
    dispatch({ type: "signIn", role, teacherId });
    const t = TEACHERS.find(x => x.id === teacherId)!;
    toast(
      role === "principal" ? "Signed in as Principal" : "Signed in as " + t.name,
      role === "principal" ? "Full access to all modules" : t.subject + " · " + t.classes.join(", ")
    );
    navigate("/");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-canvas">
      {/* Form side */}
      <div className="px-6 sm:px-12 lg:px-16 py-10 lg:py-14 flex flex-col justify-between bg-surface">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-accent text-white grid place-items-center font-display font-bold text-[18px] shadow-xs">S</span>
          <div className="leading-tight">
            <div className="font-display font-bold text-[19px] text-ink">SchoolOS</div>
            <div className="text-[12px] text-muted">School management</div>
          </div>
        </div>

        <div className="max-w-[420px] w-full py-10">
          <h1 className="text-display font-display font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-[15px] text-muted mb-7">Sign in to manage your school.</p>

          {/* Role toggle */}
          <div className="flex p-1 mb-6 rounded-lg border border-line bg-subtle">
            {(["principal", "teacher"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => pick(r)}
                className={"flex-1 h-9 rounded-md text-[13.5px] font-semibold cursor-pointer transition-all "
                  + (role === r ? "bg-surface text-accent-700 shadow-xs" : "bg-transparent text-muted hover:text-ink")}
              >
                {r === "principal" ? "Principal" : "Teacher"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {role === "teacher" && (
              <Field label="Who are you?">
                <select className="select" value={teacherId} onChange={e => pick("teacher", e.target.value)}>
                  {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                </select>
              </Field>
            )}
            <Field label="Email">
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            </Field>
            <button className="btn btn-primary h-[42px]" onClick={signIn}>Sign In <ArrowRight size={16} /></button>
            <div className="flex justify-between items-center">
              <a href="#" className="text-[13px]" onClick={e => e.preventDefault()}>Forgot password?</a>
              <span className="text-[12.5px] text-muted">Demo build — any password works</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <div className="kicker mb-3">Quick demo sign-in</div>
            <div className="flex flex-col gap-2.5">
              <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-surface border border-line cursor-pointer text-left hover:border-accent-200 hover:bg-accent-50 transition-colors"
                onClick={() => { dispatch({ type: "signIn", role: "principal" }); toast("Signed in as Principal", "Full access to all modules"); navigate("/"); }}>
                <span className="h-9 w-9 rounded-full bg-accent-100 text-accent-700 grid place-items-center font-bold text-[13px]">PR</span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-ink">Mrs. Priya Raman</span>
                  <span className="block text-[12px] text-muted">Principal · full access</span>
                </span>
                <ArrowRight size={16} className="text-faint" />
              </button>
              <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-surface border border-line cursor-pointer text-left hover:border-accent-200 hover:bg-accent-50 transition-colors"
                onClick={() => { dispatch({ type: "signIn", role: "teacher", teacherId: "t0" }); toast("Signed in as Sudha Ramesh", "Mathematics · 10-A, 10-B, 9-A"); navigate("/"); }}>
                <span className="h-9 w-9 rounded-full bg-[#e7f2ec] text-[#15803d] grid place-items-center font-bold text-[13px]">SR</span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-ink">Sudha Ramesh</span>
                  <span className="block text-[12px] text-muted">Teacher · class teacher 10-A</span>
                </span>
                <ArrowRight size={16} className="text-faint" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12.5px] text-muted">
          <ShieldCheck size={15} className="text-ok" /> One simple place to manage your entire school.
        </div>
      </div>

      {/* Brand side */}
      <div className="hidden lg:flex bg-accent-700 text-white p-14 flex-col justify-end relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="font-display font-bold text-[42px] leading-[1.08] tracking-[-0.02em] max-w-[10em]">
            One simple place to manage your entire school.
          </div>
          <div className="h-px bg-white/25 my-8" />
          <div className="grid grid-cols-3 gap-6">
            {[["842", "Students"], ["48", "Teachers"], ["10", "Modules"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display font-bold text-[28px]">{n}</div>
                <div className="text-[12.5px] text-white/75">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
