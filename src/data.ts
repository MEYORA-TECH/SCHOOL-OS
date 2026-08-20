export type Mark = "present" | "absent";
export type Role = "principal" | "teacher";

export interface Payment { date: string; amount: number; method: string; receipt: string; term: string; }
export interface FeeTerm { term: string; amount: number; paid: number; due: string; }

export interface Student {
  id: string; adm: string; name: string; cls: string; sec: string;
  father: string; mother: string; phone: string; whatsapp: string; email: string;
  attendance: number; feeTotal: number; feePaid: number; feeTerms: FeeTerm[];
  dob: string; gender: string; blood: string; status: "Active" | "Inactive";
  marks: Record<string, number>;
  admDate: string; address: string; city: string; pin: string;
  payments: Payment[];
}

export type StageKey = "new" | "contacted" | "visit" | "application" | "admitted";

export interface Enquiry {
  id: string; name: string; parent: string; cls: string; phone: string; date: string;
  stage: StageKey; prevSchool: string; email: string; assigned: string; followUp: string; notes: string;
}

export interface LeaveRecord { casualTaken: number; casualBalance: number; sickTaken: number; sickBalance: number; lastLeave: string; }
export interface Salary { basic: number; hra: number; allowances: number; deductions: number; }
export interface Period { day: string; slots: (string | null)[]; }

export interface Teacher {
  id: string; empId: string; name: string; subject: string; department: string;
  classes: string[]; classTeacherOf: string | null;
  phone: string; email: string; status: "Active" | "On leave";
  qualification: string; experienceYears: number; joinedOn: string;
  attendance: number; examsGraded: number; avgClassScore: number;
  salary: Salary; leave: LeaveRecord; timetable: Period[];
  documents: { name: string; meta: string }[];
  periodsPerWeek: number;
}

export interface WorklogEntry {
  id: string; teacherId: string; date: string; period: number; cls: string;
  subject: string; topic: string; remarks: string; attendanceMarked: boolean; syllabusPct: number;
}

export interface Task {
  id: string; teacherId: string; title: string; assignedBy: string; due: string;
  status: "Open" | "Done";
}

export interface BusStudent { name: string; cls: string; stop: string; feeStatus: "Paid" | "Pending"; feePending: number; }
export interface Stop { name: string; pickup: string; drop: string; students: number; }

export interface Bus {
  id: string; bus: string; route: string;
  driver: string; driverPhone: string; licence: string; licenceExpiry: string;
  attendant: string; attendantPhone: string;
  capacity: number; status: "Active" | "Maintenance";
  stops: Stop[]; students: BusStudent[];
  insuranceExpiry: string; fcExpiry: string; permitExpiry: string;
  attendanceToday: { present: number; absent: number; markedBy: string; at: string } | null;
}

export interface Message { title: string; audience: string; count: number; when: string; }

export const STAGES: { key: StageKey; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "visit", label: "School Visit" },
  { key: "application", label: "Application" },
  { key: "admitted", label: "Admitted" }
];

export const CLASS_LIST = ["6-A", "6-B", "7-A", "8-A", "9-A", "9-B", "10-A", "10-B"];
export const SECTIONS = ["A", "B"];
export const SUBJECTS = ["Maths", "Science", "English", "Social", "Tamil"];
export const TERMS = ["Term 1", "Term 2", "Term 3"];
export const PAYMENT_METHODS = ["UPI", "Cash", "Cheque", "Bank Transfer", "Card"];
export const DOC_CATEGORIES = ["Certificates", "Transfer Certificates", "Staff Documents", "School Documents"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SCHOOL_NAME = "ABC Matriculation Higher Secondary School";
export const TODAY = "18 Aug 2026";

export function inr(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return "₹" + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return "₹" + rest + "," + last3;
}

export function lakh(n: number): string {
  const v = n / 100000;
  return "₹" + (v >= 10 ? v.toFixed(1) : v.toFixed(2)) + "L";
}

export function phoneHref(p: string): string { return "tel:+91" + p.replace(/\s/g, ""); }
export function waHref(p: string, text: string): string {
  return "https://wa.me/91" + p.replace(/\s/g, "") + "?text=" + encodeURIComponent(text);
}
export function initials(name: string): string { return name.split(" ").map(p => p[0]).join("").slice(0, 2); }
export function grade(avg: number): string {
  return avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B" : avg >= 60 ? "C" : "D";
}

function terms(total: number, paid: number): FeeTerm[] {
  const per = Math.round(total / 3 / 100) * 100;
  const amounts = [per, per, total - per * 2];
  const due = ["15 Jun 2026", "15 Sep 2026", "15 Dec 2026"];
  let left = paid;
  return amounts.map((amount, i) => {
    const p = Math.min(amount, left);
    left -= p;
    return { term: TERMS[i], amount, paid: p, due: due[i] };
  });
}

/* ------------------------------------------------------------------ *
 *  Student roster — generated from Tamil name pools.
 *  ~30 students per section (8 sections → ~240 students).
 *  Fully deterministic (seeded PRNG) so the demo is identical on every
 *  load — no random hydration drift, but plenty of realistic variety.
 * ------------------------------------------------------------------ */

/** mulberry32 — tiny deterministic PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tamil given names for boys. */
const BOY_NAMES = [
  "Aravind", "Bharath", "Chandran", "Dhanush", "Elango", "Gokul", "Hariharan", "Iniyan",
  "Jeevan", "Karthik", "Lokesh", "Mani", "Naveen", "Prakash", "Ragav", "Sathish",
  "Tamilarasan", "Udhaya", "Vignesh", "Yuvan", "Arun", "Barani", "Deepak", "Ezhil",
  "Ganesh", "Hemachandran", "Jagan", "Kishore", "Muthu", "Nithish", "Prabhu", "Ramesh",
  "Sanjay", "Surya", "Vimal", "Ajith", "Balaji", "Dinesh", "Guhan", "Manoj",
  "Kamalesh", "Mohan", "Praveen", "Senthil", "Thamizh", "Vetri", "Karthikeyan", "Selvan",
  "Anbu", "Kavin", "Sabari", "Madhan", "Kabilan", "Jayakumar", "Rithik", "Sivakumar"
];

/** Tamil given names for girls. */
const GIRL_NAMES = [
  "Aishwarya", "Bhavani", "Charulatha", "Divya", "Eswari", "Gayathri", "Harini", "Ilakkiya",
  "Janani", "Kavya", "Lavanya", "Malini", "Nandhini", "Oviya", "Priyanka", "Ramya",
  "Sowmya", "Thendral", "Uma", "Vaishnavi", "Yamini", "Abinaya", "Deepika", "Iniya",
  "Keerthana", "Meena", "Nithya", "Pavithra", "Revathi", "Sangeetha", "Subhashini", "Vidya",
  "Anitha", "Bhuvana", "Dharani", "Kalaivani", "Madhavi", "Poornima", "Saranya", "Swetha",
  "Kanmani", "Nivetha", "Preethi", "Roshini", "Sneha", "Vennila", "Aarthi", "Jothika",
  "Kausalya", "Mahalakshmi", "Nirmala", "Pooja", "Shanmugapriya", "Tamilselvi", "Varsha"
];

/** Father names (Tamil). */
const FATHER_NAMES = [
  "Murugan", "Rajendran", "Selvaraj", "Palanisamy", "Kumaravel", "Sundaram", "Balasubramanian",
  "Chandrasekaran", "Duraisamy", "Ganapathy", "Ilangovan", "Jayaraman", "Krishnamoorthy",
  "Loganathan", "Manikandan", "Natarajan", "Perumal", "Ramachandran", "Saravanan", "Thirumurugan",
  "Venkatesan", " Arumugam", "Dhandapani", "Elumalai", "Gopalakrishnan", "Karunanidhi",
  "Muthusamy", "Nallathambi", "Pandian", "Ravichandran", "Sivakumar", "Subramani", "Vijayakumar",
  "Anbarasu", "Bhaskaran", "Chinnasamy", "Kaliyaperumal", "Marimuthu", "Nagarajan", "Ponnusamy"
].map(s => s.trim());

/** Mother names (Tamil). */
const MOTHER_NAMES = [
  "Lakshmi", "Kalaivani", "Meenakshi", "Saraswathi", "Vijaya", "Anjali", "Bhagyalakshmi",
  "Chitra", "Devaki", "Eswari", "Geetha", "Hemalatha", "Indira", "Jayanthi", "Kamala",
  "Malliga", "Nagalakshmi", "Poongodi", "Rajeswari", "Selvi", "Thulasi", "Umadevi",
  "Valli", "Yashoda", "Amudha", "Bhuvaneswari", "Dhanalakshmi", "Kanaga", "Mangayarkarasi",
  "Parvathi", "Santhi", "Tamilarasi", "Vasanthi", "Alamelu", "Chandra", "Jothi", "Kasthuri",
  "Nithya", "Punitha", "Sumathi"
];

/** Chennai residential areas + street names for addresses. */
const AREAS = [
  "Anna Nagar", "Adyar", "Velachery", "T. Nagar", "Ambattur", "Tambaram", "Mylapore",
  "Kodambakkam", "Porur", "Perambur", "Guindy", "Nungambakkam", "Chromepet", "Pallikaranai",
  "Ashok Nagar", "Villivakkam", "Saidapet", "Thiruvanmiyur", "Madipakkam", "Vadapalani"
];
const STREETS = [
  "Bharathi Street", "Kamaraj Salai", "Gandhi Road", "Nehru Street", "Anna Salai",
  "Periyar Nagar", "Thiruvalluvar Street", "MGR Nagar", "Bharathidasan Street",
  "VOC Street", "Kalaignar Salai", "Netaji Road", "Subramaniya Street", "Vivekananda Road"
];

const BLOODS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

/** Fee by grade level (₹). Higher grades cost more. */
function feeForGrade(grade: number): number {
  return { 6: 36000, 7: 42000, 8: 48000, 9: 54000, 10: 60000 }[grade] ?? 42000;
}

/** Approximate birth year for a grade in academic year 2026-27. */
function birthYear(grade: number): number {
  return 2020 - grade; // grade 6 → ~2014? tuned below to feel right
}

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

export function seedStudents(): Student[] {
  const students: Student[] = [];
  let idx = 0;
  let adm = 1024;

  CLASS_LIST.forEach((cls, ci) => {
    const grade = parseInt(cls, 10);
    const sec = cls.split("-")[1];
    const feeTotal = feeForGrade(grade);
    // Deterministic per-section seed.
    const r = rng(1000 + ci * 97);
    const PER_SECTION = 30;

    for (let n = 0; n < PER_SECTION; n++) {
      const isBoy = r() < 0.52;
      const given = isBoy
        ? BOY_NAMES[Math.floor(r() * BOY_NAMES.length)]
        : GIRL_NAMES[Math.floor(r() * GIRL_NAMES.length)];
      const father = FATHER_NAMES[Math.floor(r() * FATHER_NAMES.length)];
      const mother = MOTHER_NAMES[Math.floor(r() * MOTHER_NAMES.length)];
      // Tamil naming: mix the common school-register conventions —
      //  ~45% "Given Father" (father name as surname),
      //  ~35% "F. Given"    (initial-first),
      //  ~20% "Given F."    (given + father initial).
      const nf = r();
      const name = nf < 0.45 ? `${given} ${father}`
                 : nf < 0.80 ? `${father[0]}. ${given}`
                 : `${given} ${father[0]}.`;

      // Phone: valid-looking Indian mobile (starts 6–9).
      const prefix = [98410, 98842, 94441, 90031, 93810, 97899, 98407, 99621, 94422, 90475][Math.floor(r() * 10)];
      const tail = String(Math.floor(r() * 90000) + 10000);
      const phone = `${prefix} ${tail}`.replace(/(\d{5}) (\d{5})/, "$1 $2");

      // Attendance: mostly healthy, a few outliers per section.
      let attendance = 84 + Math.floor(r() * 15);        // 84–98
      if (r() < 0.12) attendance = 66 + Math.floor(r() * 14); // ~12% below 80

      // Marks: a per-student ability band with subject jitter.
      const base = 55 + Math.floor(r() * 38);            // 55–92 ability
      const jit = () => Math.max(35, Math.min(99, base + Math.floor(r() * 18) - 9));
      const marks: Record<string, number> = {
        Maths: jit(), Science: jit(), English: jit(), Social: jit(), Tamil: jit()
      };

      // Fee state: ~45% fully paid, ~35% partial, ~20% unpaid.
      const roll = r();
      let feePaid: number;
      if (roll < 0.45) feePaid = feeTotal;
      else if (roll < 0.80) feePaid = Math.round((feeTotal / 3) * (1 + Math.floor(r() * 2)) / 100) * 100;
      else feePaid = 0;

      const by = birthYear(grade) - 1; // shift so grade 10 ≈ 2009
      const dob = `${by}-${MONTHS[Math.floor(r() * 12)]}-${String(Math.floor(r() * 27) + 1).padStart(2, "0")}`;
      const area = AREAS[Math.floor(r() * AREAS.length)];
      const street = STREETS[Math.floor(r() * STREETS.length)];

      const paid = feePaid;
      const payments = paid > 0
        ? (() => {
            const first = Math.round(paid * 0.6);
            const list = [{ date: "12 Jun", amount: first, method: "UPI", receipt: "RC" + (2001 + idx), term: "Term 1" }];
            if (paid - first > 0) list.push({ date: "05 Aug", amount: paid - first, method: r() < 0.5 ? "Cash" : "Bank Transfer", receipt: "RC" + (5001 + idx), term: "Term 2" });
            return list;
          })()
        : [];

      students.push({
        id: "s" + idx,
        adm: "STU" + (adm++),
        name, cls, sec,
        father, mother,
        phone, whatsapp: phone,
        email: given.toLowerCase() + "." + father.toLowerCase() + "@example.com",
        attendance,
        feeTotal, feePaid,
        feeTerms: terms(feeTotal, feePaid),
        dob,
        gender: isBoy ? "Male" : "Female",
        blood: BLOODS[Math.floor(r() * BLOODS.length)],
        status: "Active",
        marks,
        admDate: `${2026 - (grade - 6)}-06-0${1 + (n % 5)}`,
        address: `${1 + Math.floor(r() * 180)}, ${street}`,
        city: "Chennai",
        pin: "600" + String(Math.floor(r() * 118) + 1).padStart(3, "0"),
        payments
      });
      idx++;
    }
  });

  return students;
}

export function seedAdmissions(): Enquiry[] {
  const d: [string, string, string, string, string, StageKey, string][] = [
    ["Aarav Suresh","Suresh Kumar","6","98410 77281","16 Aug","new","Little Flower School"],
    ["Ishita Bose","Amit Bose","7","99401 26630","16 Aug","new","St. Mary's School"],
    ["Nikhil Varma","Rakesh Varma","9","98842 03917","15 Aug","new","Green Valley School"],
    ["Tara Menon","Sanjay Menon","6","94440 51268","15 Aug","new","Home schooled"],
    ["Kabir Shah","Imran Shah","8","90032 84175","14 Aug","contacted","Bright Kids School"],
    ["Riya Joseph","Thomas Joseph","10","93811 40726","14 Aug","contacted","Holy Cross School"],
    ["Manav Reddy","Kiran Reddy","7","97890 63514","13 Aug","contacted","Sunrise School"],
    ["Anika Das","Prabir Das","6","98409 27853","12 Aug","visit","Little Angels School"],
    ["Vivaan Kapoor","Rohit Kapoor","9","99625 18490","12 Aug","visit","Modern Public School"],
    ["Sara Fernandes","Peter Fernandes","8","94428 30671","11 Aug","application","City Central School"],
    ["Yash Thakur","Vijay Thakur","6","90478 65239","10 Aug","application","New Era School"],
    ["Diya Pillai","Naveen Pillai","7","98846 12074","08 Aug","admitted","Vidya Mandir"],
    ["Advait Sharma","Gaurav Sharma","10","93452 79318","07 Aug","admitted","Oakridge School"]
  ];
  return d.map((r, i) => ({
    id: "e" + i, name: r[0], parent: r[1], cls: r[2], phone: r[3], date: r[4],
    stage: r[5], prevSchool: r[6],
    email: r[1].split(" ")[0].toLowerCase() + "@example.com",
    assigned: i % 2 ? "Kavitha (Admissions)" : "Ramesh (Admissions)",
    followUp: "22 Aug 2026",
    notes: "Parent asked about transport and fee instalments."
  }));
}

function timetable(subject: string, classes: string[]): Period[] {
  return DAYS.map((day, di) => ({
    day,
    slots: Array.from({ length: 7 }, (_, si) =>
      (si + di) % 3 === 0 ? null : subject + " · " + classes[(si + di) % classes.length]
    )
  }));
}

export function seedTeachers(): Teacher[] {
  const d: [string, string, string, string[], string | null, string, string, string, number, string, number, number, number][] = [
    ["EMP014","Sudha Ramesh","Mathematics",["10-A","10-B","9-A"],"10-A","98410 55031","M.Sc. Mathematics, B.Ed.","2014-06-09",12,"Mathematics",48000,96,81],
    ["EMP021","Anand Kumar","Science",["9-A","9-B","8-A"],"9-A","98842 60147","M.Sc. Physics, B.Ed.","2016-06-13",9,"Science",44000,95,78],
    ["EMP008","Fatima Begum","English",["10-A","8-A","7-A"],null,"94441 78290","M.A. English, B.Ed.","2011-06-06",15,"Languages",52000,94,84],
    ["EMP033","Ravi Shankar","Social Science",["10-B","9-B"],"9-B","90031 62784","M.A. History, B.Ed.","2019-06-10",6,"Social Science",38000,93,74],
    ["EMP017","Meenakshi S","Tamil",["6-A","6-B","7-A"],"6-A","93810 24917","M.A. Tamil, B.Ed.","2015-06-15",11,"Languages",45000,92,86],
    ["EMP041","Joseph Antony","Computer Science",["9-A","10-A"],null,"97899 41386","M.C.A., B.Ed.","2021-06-07",4,"Computer Science",36000,91,80],
    ["EMP029","Deepa Narayan","Physical Education",["6-A","7-A","8-A","9-A"],null,"98407 93265","M.P.Ed.","2018-06-11",7,"Physical Education",34000,90,88],
    ["EMP046","Karthik Vel","Mathematics",["6-A","7-A","8-A"],"8-A","99621 50874","M.Sc. Mathematics, B.Ed.","2022-06-06",3,"Mathematics",32000,89,76]
  ];
  return d.map((r, i) => ({
    id: "t" + i, empId: r[0], name: r[1], subject: r[2], classes: r[3], classTeacherOf: r[4],
    phone: r[5], email: r[1].split(" ")[0].toLowerCase() + "@abcschool.edu.in",
    qualification: r[6], joinedOn: r[7], experienceYears: r[8], department: r[9],
    status: i === 6 ? "On leave" : "Active",
    attendance: r[11], examsGraded: 3 + (i % 4), avgClassScore: r[12],
    salary: { basic: r[10], hra: Math.round(r[10] * 0.3), allowances: Math.round(r[10] * 0.12), deductions: Math.round(r[10] * 0.09) },
    leave: { casualTaken: 4 + (i % 5), casualBalance: 12 - (4 + (i % 5)), sickTaken: 1 + (i % 3), sickBalance: 8 - (1 + (i % 3)), lastLeave: "02 Aug 2026" },
    timetable: timetable(r[2], r[3]),
    periodsPerWeek: 28 + (i % 6),
    documents: [
      { name: "Degree certificate", meta: "PDF · verified 12 Jun 2024" },
      { name: "B.Ed. certificate", meta: "PDF · verified 12 Jun 2024" },
      { name: "Aadhaar", meta: "PDF · verified 12 Jun 2024" },
      { name: "Appointment letter", meta: "PDF · issued " + r[7] }
    ]
  }));
}

export function seedWorklog(): WorklogEntry[] {
  const d: [string, string, number, string, string, string, string, boolean, number][] = [
    ["t0","18 Aug 2026",1,"10-A","Mathematics","Quadratic equations — nature of roots","Class attentive; 4 students need extra practice.",true,62],
    ["t0","18 Aug 2026",3,"10-B","Mathematics","Revision: polynomials worksheet","Worksheet collected from 36 of 39.",true,58],
    ["t0","18 Aug 2026",5,"9-A","Mathematics","Coordinate geometry — distance formula","Introduced with graph work.",true,54],
    ["t1","18 Aug 2026",2,"9-A","Science","Light — reflection from curved mirrors","Lab demo done; ray diagrams pending.",true,49],
    ["t1","18 Aug 2026",4,"8-A","Science","Cell structure recap","Slow progress; will repeat tomorrow.",false,44],
    ["t2","18 Aug 2026",1,"10-A","English","Formal letter writing — format drill","Peer correction worked well.",true,66],
    ["t2","18 Aug 2026",6,"7-A","English","Reading comprehension practice","",true,61],
    ["t3","17 Aug 2026",2,"10-B","Social Science","Nationalism in India — Non-cooperation","Map work assigned.",true,52],
    ["t4","17 Aug 2026",3,"6-A","Tamil","கவிதை பாடம் — உரையாடல்","",true,57],
    ["t5","17 Aug 2026",5,"9-A","Computer Science","Spreadsheet formulas","Lab systems 3 and 7 need repair.",true,47]
  ];
  return d.map((r, i) => ({
    id: "w" + i, teacherId: r[0], date: r[1], period: r[2], cls: r[3], subject: r[4],
    topic: r[5], remarks: r[6], attendanceMarked: r[7], syllabusPct: r[8]
  }));
}

export function seedTasks(): Task[] {
  return [
    { id: "k0", teacherId: "t0", title: "Submit Term 1 mark analysis for 10-A", assignedBy: "Principal", due: "20 Aug 2026", status: "Open" },
    { id: "k1", teacherId: "t0", title: "Parent call list — repeated absences", assignedBy: "Principal", due: "21 Aug 2026", status: "Open" },
    { id: "k2", teacherId: "t1", title: "Lab equipment indent for Term 2", assignedBy: "Principal", due: "22 Aug 2026", status: "Open" },
    { id: "k3", teacherId: "t2", title: "Reading club schedule", assignedBy: "Vice Principal", due: "19 Aug 2026", status: "Done" },
    { id: "k4", teacherId: "t3", title: "Update syllabus tracker for 9-B", assignedBy: "Principal", due: "20 Aug 2026", status: "Open" }
  ];
}

function busStudents(names: [string, string, string, "Paid" | "Pending", number][]): BusStudent[] {
  return names.map(n => ({ name: n[0], cls: n[1], stop: n[2], feeStatus: n[3], feePending: n[4] }));
}

export function seedBuses(): Bus[] {
  return [
    {
      id: "b0", bus: "TN 09 AB 1024", route: "Anna Nagar",
      driver: "Kumar M", driverPhone: "98410 30271", licence: "TN3820140006512", licenceExpiry: "14 Mar 2028",
      attendant: "Lakshmi R", attendantPhone: "94441 62038",
      capacity: 50, status: "Active",
      stops: [
        { name: "Porur Toll", pickup: "7:10 AM", drop: "4:35 PM", students: 12 },
        { name: "Manapakkam Signal", pickup: "7:25 AM", drop: "4:22 PM", students: 9 },
        { name: "Ramapuram Bus Stand", pickup: "7:40 AM", drop: "4:10 PM", students: 14 },
        { name: "School Gate", pickup: "8:00 AM", drop: "3:55 PM", students: 7 }
      ],
      students: busStudents([
        ["Arjun Kumar","10-A","Porur Toll","Paid",0],
        ["Priya Sharma","10-A","Manapakkam Signal","Pending",3600],
        ["Sneha Iyer","10-B","Ramapuram Bus Stand","Paid",0],
        ["Dhruv Patel","9-A","Porur Toll","Pending",3600],
        ["Meera Nair","8-A","Ramapuram Bus Stand","Paid",0],
        ["Sanjay Pillai","6-A","Manapakkam Signal","Paid",0]
      ]),
      insuranceExpiry: "09 Jan 2027", fcExpiry: "28 Nov 2026", permitExpiry: "31 Mar 2027",
      attendanceToday: { present: 40, absent: 2, markedBy: "Lakshmi R (attendant)", at: "8:04 AM" }
    },
    {
      id: "b1", bus: "TN 09 AC 2287", route: "Adyar",
      driver: "Selvam P", driverPhone: "98842 51763", licence: "TN0120110004417", licenceExpiry: "02 Sep 2027",
      attendant: "Revathi K", attendantPhone: "93810 77452",
      capacity: 45, status: "Active",
      stops: [
        { name: "Besant Nagar Beach", pickup: "7:05 AM", drop: "4:40 PM", students: 10 },
        { name: "Thiruvanmiyur Signal", pickup: "7:20 AM", drop: "4:25 PM", students: 13 },
        { name: "Adyar Depot", pickup: "7:35 AM", drop: "4:12 PM", students: 11 },
        { name: "School Gate", pickup: "7:55 AM", drop: "3:55 PM", students: 4 }
      ],
      students: busStudents([
        ["Rahul Kumar","10-A","Adyar Depot","Paid",0],
        ["Ananya Menon","9-A","Besant Nagar Beach","Paid",0],
        ["Rohan Gupta","8-A","Thiruvanmiyur Signal","Pending",1800],
        ["Divya Krishnan","7-A","Adyar Depot","Paid",0]
      ]),
      insuranceExpiry: "21 Feb 2027", fcExpiry: "05 Sep 2026", permitExpiry: "30 Jun 2027",
      attendanceToday: { present: 36, absent: 2, markedBy: "Revathi K (attendant)", at: "7:58 AM" }
    },
    {
      id: "b2", bus: "TN 09 BX 3390", route: "Velachery",
      driver: "Murthy S", driverPhone: "94422 18604", licence: "TN1420130008820", licenceExpiry: "19 Jul 2029",
      attendant: "Sarala D", attendantPhone: "90031 55938",
      capacity: 50, status: "Active",
      stops: [
        { name: "Guindy Station", pickup: "7:00 AM", drop: "4:45 PM", students: 15 },
        { name: "Velachery Lake", pickup: "7:18 AM", drop: "4:28 PM", students: 16 },
        { name: "Taramani Link Road", pickup: "7:34 AM", drop: "4:14 PM", students: 10 },
        { name: "School Gate", pickup: "7:52 AM", drop: "3:55 PM", students: 4 }
      ],
      students: busStudents([
        ["Karthik Raja","10-A","Guindy Station","Paid",0],
        ["Vikram Naidu","10-B","Velachery Lake","Pending",3600],
        ["Lakshmi Devi","9-B","Taramani Link Road","Paid",0],
        ["Aditya Rao","9-B","Velachery Lake","Pending",3600]
      ]),
      insuranceExpiry: "14 Dec 2026", fcExpiry: "22 Jan 2027", permitExpiry: "31 Mar 2027",
      attendanceToday: { present: 43, absent: 2, markedBy: "Sarala D (attendant)", at: "8:01 AM" }
    },
    {
      id: "b3", bus: "TN 09 CD 4471", route: "T. Nagar",
      driver: "Bala K", driverPhone: "97899 30612", licence: "TN0920160002204", licenceExpiry: "11 May 2026",
      attendant: "Kalpana V", attendantPhone: "98409 71183",
      capacity: 42, status: "Maintenance",
      stops: [
        { name: "West Mambalam", pickup: "7:08 AM", drop: "4:38 PM", students: 11 },
        { name: "Panagal Park", pickup: "7:22 AM", drop: "4:24 PM", students: 12 },
        { name: "Kodambakkam Bridge", pickup: "7:38 AM", drop: "4:11 PM", students: 9 },
        { name: "School Gate", pickup: "7:56 AM", drop: "3:55 PM", students: 4 }
      ],
      students: busStudents([["Aarav Suresh","6-A","Panagal Park","Pending",1800]]),
      insuranceExpiry: "03 Oct 2026", fcExpiry: "30 Aug 2026", permitExpiry: "28 Feb 2027",
      attendanceToday: null
    },
    {
      id: "b4", bus: "TN 09 EF 5518", route: "Ambattur",
      driver: "Raghavan T", driverPhone: "99625 40877", licence: "TN2020120007731", licenceExpiry: "27 Oct 2028",
      attendant: "Jaya M", attendantPhone: "94428 61205",
      capacity: 50, status: "Active",
      stops: [
        { name: "Avadi Checkpost", pickup: "6:55 AM", drop: "4:50 PM", students: 14 },
        { name: "Ambattur OT", pickup: "7:12 AM", drop: "4:32 PM", students: 15 },
        { name: "Padi Flyover", pickup: "7:30 AM", drop: "4:16 PM", students: 8 },
        { name: "School Gate", pickup: "7:50 AM", drop: "3:55 PM", students: 3 }
      ],
      students: busStudents([["Ishita Bose","7-A","Ambattur OT","Paid",0]]),
      insuranceExpiry: "18 Apr 2027", fcExpiry: "12 Dec 2026", permitExpiry: "31 Mar 2027",
      attendanceToday: { present: 38, absent: 2, markedBy: "Jaya M (attendant)", at: "7:56 AM" }
    },
    {
      id: "b5", bus: "TN 09 GH 6602", route: "Tambaram",
      driver: "Vinoth R", driverPhone: "90475 22869", licence: "TN5720150009943", licenceExpiry: "08 Feb 2027",
      attendant: "Suganya P", attendantPhone: "98846 30574",
      capacity: 48, status: "Active",
      stops: [
        { name: "Chromepet Market", pickup: "6:58 AM", drop: "4:48 PM", students: 13 },
        { name: "Pallavaram Signal", pickup: "7:15 AM", drop: "4:30 PM", students: 16 },
        { name: "Meenambakkam", pickup: "7:32 AM", drop: "4:15 PM", students: 11 },
        { name: "School Gate", pickup: "7:54 AM", drop: "3:55 PM", students: 4 }
      ],
      students: busStudents([["Nikhil Varma","9-A","Pallavaram Signal","Pending",1800]]),
      insuranceExpiry: "07 Jul 2027", fcExpiry: "19 Oct 2026", permitExpiry: "30 Sep 2026",
      attendanceToday: { present: 42, absent: 2, markedBy: "Suganya P (attendant)", at: "8:06 AM" }
    }
  ];
}

export const AUDIENCES: Record<string, number> = {
  "Entire School": 240,
  "Class 10-A": 30,
  "Section A": 180,
  "Absent Students": 28,
  "Fee Pending Students": 66,
  "Individual Parent": 1
};
