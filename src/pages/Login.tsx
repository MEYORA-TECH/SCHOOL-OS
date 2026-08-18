import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen grid bg-white" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
      <div className="px-16 py-14 flex flex-col justify-between border-r-2 border-divider">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-accent text-white grid place-items-center font-extrabold text-[17px]">S</span>
          <span className="font-extrabold text-[20px]">SchoolOS</span>
        </div>

        <div className="max-w-[440px]">
          <h1 className="text-[38px] mb-3">Welcome back</h1>
          <p className="text-[15px] text-muted mb-7">Sign in to manage your school.</p>

          <div className="flex mb-6 border border-line">
            {(["principal", "teacher"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => pick(r)}
                className={"flex-1 h-11 text-[14px] font-bold cursor-pointer border-0 " +
                  (role === r ? "bg-accent text-white" : "bg-white text-muted hover:bg-accent-100")}
              >
                {r === "principal" ? "Principal" : "Teacher"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {role === "teacher" && (
              <Field label="Who are you?">
                <select className="select" value={teacherId} onChange={e => pick("teacher", e.target.value)}>
                  {TEACHERS.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Email">
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            </Field>
            <button className="btn btn-primary" onClick={signIn}>Sign In</button>
            <div className="flex justify-between items-center">
              <a href="#" className="text-[13px]" onClick={e => e.preventDefault()}>Forgot password?</a>
              <span className="text-[13px] text-muted">Demo build — any password works</span>
            </div>
          </div>

          <div className="mt-9 pt-5 border-t-2 border-divider">
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted mb-2.5">Quick demo sign-in</div>
            <div className="flex flex-col gap-2.5">
              <button className="flex items-center gap-3 w-full min-h-[33px] p-3 bg-white border border-line cursor-pointer text-left hover:border-accent hover:bg-accent-100"
                onClick={() => { dispatch({ type: "signIn", role: "principal" }); toast("Signed in as Principal", "Full access to all modules"); navigate("/"); }}>
                <span className="w-[34px] h-[34px] bg-accent-200 text-accent-700 grid place-items-center font-extrabold text-[13px]">PR</span>
                <span>
                  <span className="block text-[14px] font-semibold">Mrs. Priya Raman</span>
                  <span className="block text-[12.5px] text-muted">Principal · full access</span>
                </span>
              </button>
              <button className="flex items-center gap-3 w-full min-h-[33px] p-3 bg-white border border-line cursor-pointer text-left hover:border-accent hover:bg-accent-100"
                onClick={() => { dispatch({ type: "signIn", role: "teacher", teacherId: "t0" }); toast("Signed in as Sudha Ramesh", "Mathematics · 10-A, 10-B, 9-A"); navigate("/"); }}>
                <span className="w-[34px] h-[34px] bg-accent-200 text-accent-700 grid place-items-center font-extrabold text-[13px]">SR</span>
                <span>
                  <span className="block text-[14px] font-semibold">Sudha Ramesh</span>
                  <span className="block text-[12.5px] text-muted">Teacher · class teacher 10-A</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-[12.5px] text-muted">One simple place to manage your entire school.</div>
      </div>

      <div className="bg-accent text-white p-14 flex flex-col justify-end">
        <div className="font-extrabold text-[44px] leading-[1.05] tracking-[-0.02em] max-w-[9em]">
          One simple place to manage your entire school.
        </div>
        <div className="h-[2px] bg-white/45 my-8" />
        <div className="grid grid-cols-3 gap-6">
          {[["842", "Students"], ["48", "Teachers"], ["10", "Modules"]].map(([n, l]) => (
            <div key={l}>
              <div className="font-extrabold text-[26px]">{n}</div>
              <div className="text-[12.5px] opacity-85">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
