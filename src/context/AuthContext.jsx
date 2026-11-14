import { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { readStoredValue, writeStoredValue, removeStoredValue } from "../services/appDataService";
import { coordinators as initialCoordinators, sampleStudents } from "../data/demoData";

const SESSION_KEY = "campuspulse_demo_session";
const USERS_KEY = "campuspulse_demo_students";
const COORDINATORS_KEY = "campuspulse_demo_coordinator_accounts";
const LEGACY_COORDINATORS_KEY = "campuspulse_demo_coordinators";
const AuthContext = createContext(null);
const defaultStudent = {
  id: "MCA26001",
  role: "student",
  name: "Sarthak Agarwal",
  email: "student@campuspulse.demo",
  phone: "",
  profileImage: "",
  bio: "MCA student interested in Artificial Intelligence, Machine Learning, and Data Science.",
  enrollment: "MCA2026XXXX",
  rollNo: "MCA26001",
  course: "MCA",
  academicYear: "2026-27",
  year: "1st Year",
  currentSemester: "1",
  section: "D",
  program: "Master of Computer Applications",
  semester: "Semester 1",
  department: "Computer Applications",
  institution: "KIET Deemed to be University",
  location: "Uttar Pradesh, India",
  skills: ["Python", "Java", "SQL", "HTML", "CSS"],
  interests: ["Artificial Intelligence", "Machine Learning", "Data Science"],
};

const demoAccounts = [
  { id: "admin-demo-001", role: "admin", name: "CampusPulse Admin", email: "admin@campuspulse.demo" },
  defaultStudent,
];

const homeForRole = (role) => ({ admin: "/admin", coordinator: "/coordinator", student: "/student" }[role] || "/");
const programByCourse = { BCA: "Bachelor of Computer Applications", MCA: "Master of Computer Applications", "B.Tech": "Bachelor of Technology", BBA: "Bachelor of Business Administration", MBA: "Master of Business Administration", Other: "Other" };

export function AuthProvider({ children }) {
  const [registeredStudents, setRegisteredStudents] = useState(() => readStoredValue(USERS_KEY, sampleStudents, (value) => Array.isArray(value) && value.every((item) => item && item.role === "student" && typeof item.id === "string" && typeof item.email === "string")));
  const [user, setUser] = useState(() => readStoredValue(SESSION_KEY, null, (value) =>
    value && ["admin", "coordinator", "student"].includes(value.role) && typeof value.id === "string"
  ));
  const [coordinatorAccounts, setCoordinatorAccounts] = useState(() => {
    const legacyProfiles = readStoredValue(LEGACY_COORDINATORS_KEY, initialCoordinators, Array.isArray);
    const accounts = legacyProfiles.map(({ id, email, status }) => ({ id, email, status: status || "Active", role: "coordinator" }));
    return readStoredValue(COORDINATORS_KEY, accounts, (value) => Array.isArray(value) && value.every((item) => item && typeof item.id === "string" && typeof item.email === "string" && item.role === "coordinator"));
  });

  const persistCoordinatorAccounts = (next) => {
    if (!writeStoredValue(COORDINATORS_KEY, next)) return false;
    setCoordinatorAccounts(next);
    return true;
  };

  const createCoordinatorAccount = (account) => {
    const normalizedEmail = account.email.trim().toLowerCase();
    const duplicateEmail = [...coordinatorAccounts, ...registeredStudents, ...demoAccounts].some((item) => item.email.toLowerCase() === normalizedEmail);
    if (user?.role !== "admin" || duplicateEmail || coordinatorAccounts.some((item) => item.id === account.id)) return false;
    return persistCoordinatorAccounts([...coordinatorAccounts, { id: account.id, email: normalizedEmail, status: account.status || "Active", role: "coordinator" }]);
  };

  const updateCoordinatorAccount = (id, changes) => {
    if (user?.role !== "admin" || (changes.email && [...coordinatorAccounts, ...registeredStudents, ...demoAccounts].some((item) => item.id !== id && item.email.toLowerCase() === changes.email.toLowerCase()))) return false;
    return persistCoordinatorAccounts(coordinatorAccounts.map((item) => item.id === id ? { ...item, ...changes, id: item.id, role: "coordinator" } : item));
  };

  const removeCoordinatorAccount = (id) => {
    if (user?.role !== "admin") return false;
    return persistCoordinatorAccounts(coordinatorAccounts.filter((item) => item.id !== id));
  };

  const login = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = [...coordinatorAccounts.map((item) => ({ ...item, role: "coordinator" })), ...demoAccounts, ...registeredStudents].find((item) => item.email.toLowerCase() === normalizedEmail);
    if (!account || (account.role === "coordinator" && account.status === "Inactive")) return false;
    const baseUser = account;
    const savedProfile = readStoredValue(`campuspulse_demo_profile_${baseUser.id}`, {}, (value) => value && typeof value === "object" && !Array.isArray(value));
    const nextUser = { ...baseUser, ...savedProfile, id: baseUser.id, role: baseUser.role };
    if (!writeStoredValue(SESSION_KEY, nextUser)) return false;
    setUser(nextUser);
    return nextUser;
  };

  const registerStudent = (profile) => {
    const normalizedEmail = profile.email.trim().toLowerCase();
    const rollNo = (profile.rollNo || profile.enrollment || "").trim().toUpperCase();
    if (!rollNo || [...registeredStudents, ...coordinatorAccounts, ...demoAccounts].some((account) => account.email.toLowerCase() === normalizedEmail) || [defaultStudent, ...registeredStudents].some((student) => student.rollNo?.trim().toUpperCase() === rollNo)) return false;
    const nextUser = {
      ...defaultStudent,
      ...profile,
      email: normalizedEmail,
      id: `student-${Date.now()}`,
      role: "student",
      rollNo,
      enrollment: rollNo,
      course: profile.course,
      program: programByCourse[profile.course] || profile.course,
      department: profile.department.trim(),
      academicYear: profile.academicYear.trim(),
      year: profile.year,
      currentSemester: String(profile.currentSemester),
      semester: `Semester ${profile.currentSemester}`,
      section: profile.section.trim(),
    };
    const nextStudents = [...registeredStudents.filter((item) => item.email !== nextUser.email), nextUser];
    if (!writeStoredValue(USERS_KEY, nextStudents) || !writeStoredValue(SESSION_KEY, nextUser)) return false;
    setRegisteredStudents(nextStudents);
    setUser(nextUser);
    return true;
  };

  const updateStudentProfile = (profile) => {
    if (user?.role !== "student") return false;
    const editable = ["name", "email", "phone", "location", "bio", "profileImage", "skills", "interests", "rollNo", "enrollment", "course", "department", "academicYear", "year", "currentSemester", "semester", "section", "institution"];
    const updates = Object.fromEntries(editable.filter((key) => key in profile).map((key) => [key, profile[key]]));
    if (updates.rollNo || updates.enrollment) {
      const rollNo = String(updates.rollNo || updates.enrollment).trim().toUpperCase();
      if ([defaultStudent, ...registeredStudents].some((student) => student.id !== user.id && student.rollNo?.trim().toUpperCase() === rollNo)) return false;
      updates.rollNo = rollNo;
      updates.enrollment = rollNo;
    }
    if (updates.course) updates.program = programByCourse[updates.course] || updates.course;
    if (updates.currentSemester !== undefined) {
      updates.currentSemester = String(updates.currentSemester).trim();
      updates.semester = `Semester ${updates.currentSemester}`;
    }
    if (updates.email) updates.email = updates.email.trim().toLowerCase();
    if (updates.email && [...registeredStudents, ...coordinatorAccounts, ...demoAccounts].some((account) => account.id !== user.id && account.email.toLowerCase() === updates.email)) return false;
    const nextUser = { ...user, ...updates, id: user.id, role: user.role };
    const nextStudents = registeredStudents.map((student) => student.id === user.id ? { ...student, ...updates } : student);
    const savedProfile = readStoredValue(`campuspulse_demo_profile_${user.id}`, {}, (value) => value && typeof value === "object" && !Array.isArray(value));
    if (!writeStoredValue(`campuspulse_demo_profile_${user.id}`, { ...savedProfile, ...updates }) || !writeStoredValue(SESSION_KEY, nextUser) || (registeredStudents.some((student) => student.id === user.id) && !writeStoredValue(USERS_KEY, nextStudents))) return false;
    if (registeredStudents.some((student) => student.id === user.id)) setRegisteredStudents(nextStudents);
    setUser(nextUser);
    return true;
  };

  const logout = () => {
    removeStoredValue(SESSION_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, registerStudent, updateStudentProfile, createCoordinatorAccount, updateCoordinatorAccount, removeCoordinatorAccount, logout, homeForRole }}>{children}</AuthContext.Provider>;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function RequireRole({ role, children }) {
  const { user, homeForRole } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== role) return <Navigate to={homeForRole(user.role)} replace />;
  return children;
}
