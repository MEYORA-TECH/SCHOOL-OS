import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import { Students, AddStudent, StudentProfile } from "./pages/Students";
import Attendance from "./pages/Attendance";
import { Fees, FeeStudent } from "./pages/Fees";
import { Admissions, AdmissionDetail } from "./pages/Admissions";
import Communication from "./pages/Communication";
import { Exams, ExamResults, ReportCard } from "./pages/Academics";
import Worklog from "./pages/Worklog";
import { Teachers, TeacherProfile, MyProfile } from "./pages/Teachers";
import { Documents, Transport, RouteDetail, Settings } from "./pages/Operations";
import { useApp } from "./store";

export default function App() {
  const { state } = useApp();
  const loc = useLocation();

  if (!state.signedIn && loc.pathname !== "/login") return <Navigate to="/login" replace />;

  const isTeacher = state.role === "teacher";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={isTeacher ? <TeacherDashboard /> : <Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/worklog" element={<Worklog />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/results" element={<ExamResults />} />
        <Route path="/exams/report/:id" element={<ReportCard />} />
        <Route path="/me" element={<MyProfile />} />
        {!isTeacher && <Route path="/students" element={<Students />} />}
        {!isTeacher && <Route path="/students/new" element={<AddStudent />} />}
        {!isTeacher && <Route path="/students/:id" element={<StudentProfile />} />}
        {!isTeacher && <Route path="/teachers" element={<Teachers />} />}
        {!isTeacher && <Route path="/teachers/:id" element={<TeacherProfile />} />}
        {!isTeacher && <Route path="/fees" element={<Fees />} />}
        {!isTeacher && <Route path="/fees/:id" element={<FeeStudent />} />}
        {!isTeacher && <Route path="/admissions" element={<Admissions />} />}
        {!isTeacher && <Route path="/admissions/:id" element={<AdmissionDetail />} />}
        {!isTeacher && <Route path="/communication" element={<Communication />} />}
        {!isTeacher && <Route path="/documents" element={<Documents />} />}
        {!isTeacher && <Route path="/transport" element={<Transport />} />}
        {!isTeacher && <Route path="/transport/:id" element={<RouteDetail />} />}
        {!isTeacher && <Route path="/settings" element={<Settings />} />}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
