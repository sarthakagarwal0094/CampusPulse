import { Activity, Award, CalendarDays, GraduationCap, Mail, Medal, Users, Trophy, Leaf, Laptop, Drama, BookOpen, Crown } from "lucide-react";
import "./CampusCredCard.css";

const categoryIcons = { Technical:Laptop, Cultural:Drama, Sports:Trophy, Workshops:BookOpen, Leadership:Crown, Social:Leaf, Other:Medal };
export default function CampusCredCard({ user, data, large = false }) {
  const { attendance, certificates, points, pointsByCategory, recordId, generatedAt } = data;
  const categories = Object.entries(pointsByCategory);
  return <article className={`campus-card${large ? " large" : ""}`}>
    <div className="campus-card-top-accent"/><header className="campus-card-header"><div className="campus-card-brand"><span><Activity size={17}/> CampusPulse</span><strong>CampusCred</strong><small>STUDENT ACHIEVEMENT CARD</small></div><div className="campus-card-institution"><GraduationCap/><strong>{user.institution || "KIET Deemed to be University"}</strong></div></header>
    <section className="campus-card-student"><div className="campus-card-photo">{user.profileImage ? <img src={user.profileImage} alt={`${user.name} profile`}/> : <span>{user.name?.split(/\s+/).map((part)=>part[0]).slice(0,2).join("").toUpperCase() || "ST"}</span>}</div><div className="campus-card-identity"><h2>{user.name}</h2><p><Medal/> Roll No. {user.rollNo || user.enrollment || "Not provided"}</p><p><GraduationCap/> {user.course || user.program || "Course not provided"} · {user.department || "Department not provided"}</p><p><Users/> Batch: {user.academicYear || "Not provided"} · {user.year || ""}</p><p><Mail/> {user.email}</p><p className="campus-card-academic">Semester {user.currentSemester || user.semester?.replace(/^Semester\s*/i, "") || "—"} · Section {user.section || "—"}</p></div><div className="campus-card-score"><Award/><strong>{points >= 1500 ? "Campus Leader" : "Campus Achiever"}</strong><small>Total CampusCred Points</small><b>{points.toLocaleString()}</b></div></section>
    <section className="campus-card-metrics"><div><CalendarDays/><strong>{attendance.length}</strong><span>Events Attended</span></div><div><Award/><strong>{certificates.length}</strong><span>Certificates Earned</span></div><div><Trophy/><strong>{points.toLocaleString()}</strong><span>CampusCred Points</span></div></section>
    <section className="campus-card-categories">{categories.map(([name, categoryPoints])=>{const Icon=categoryIcons[name]||Medal;return <div className={`campus-card-category ${name.toLowerCase()}`} key={name}><Icon/><span>{name}</span><strong>{categoryPoints} pts</strong></div>;})}</section>
   <footer className="campus-card-footer"><small>{recordId} · Updated {generatedAt.toLocaleDateString()}</small></footer>
  </article>;
}
