import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Activity, Home, CalendarDays, BookmarkCheck, ClipboardCheck, Trophy,
  FileText, User, LayoutDashboard, Users, QrCode, Award,
  ChartNoAxesColumn, MapPin, Layers, Settings, LogOut, Menu, X,
} from "lucide-react";
import "./PortalLayouts.css";
import { useAuth } from "../context/AuthContext";

const studentLinks = [
  ["Dashboard", Home, "/student", true],
  ["Explore Events", CalendarDays, "/student/events"],
  ["My Registrations", BookmarkCheck, "/student/registrations"],
  ["My Attendance", ClipboardCheck, "/student/attendance"],
  ["CampusCred", Trophy, "/student/campuscred"],
  ["Certificates", FileText, "/student/certificates"],
  ["Profile", User, "/student/profile"],
];

const coordinatorLinks = [
  ["Dashboard", LayoutDashboard, "/coordinator", true],
  ["My Events", CalendarDays, "/coordinator/events"],
  ["Event Teams", Users, "/coordinator/teams"],
  ["Registrations", ClipboardCheck, "/coordinator/registrations"],
  ["Attendance", QrCode, "/coordinator/attendance"],
  ["Certificates", Award, "/coordinator/certificates"],
  ["Analytics", ChartNoAxesColumn, "/coordinator/analytics"],
];

const adminLinks = [
  ["Dashboard", ChartNoAxesColumn, "/admin", true],
  ["Event Management", CalendarDays, "/admin/events"],
  ["Coordinator Management", Users, "/admin/coordinators"],
  ["Venue Management", MapPin, "/admin/venues"],
  ["Event Clash Management", Layers, "/admin/clashes"],
  ["Analytics & Reports", ChartNoAxesColumn, "/admin/analytics"],
  ["Settings", Settings, "/admin/settings"],
];

function SidebarLinks({ links, className, onNavigate }) {
  return <nav className={className}>{links.map(([label, Icon, to, end]) => (
    <NavLink key={to} to={to} end={end} aria-label={label} title={label} onClick={onNavigate}>
      <Icon size={20} /> <span>{label}</span>
    </NavLink>
  ))}</nav>;
}

function PortalFrame({ type, children, links }) {
  const { logout, user } = useAuth();
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);
  const closeStudentMenu = () => setStudentMenuOpen(false);
  return <div className={`portal-shell ${type}-portal${studentMenuOpen ? " student-menu-open" : ""}`}>
    <aside className={`portal-sidebar ${type}-portal-sidebar`}>
      {type === "admin" ? <div className="portal-admin-brand"><CalendarDays size={25} /><div><h2>CampusPulse</h2><p>Admin Portal</p></div></div> :
        <NavLink to="/" className="portal-brand" onClick={closeStudentMenu}><Activity size={30} /><span>Campus<span>Pulse</span></span></NavLink>}
      {type === "student" && <div className="portal-user"><b>{user?.name?.charAt(0) || "S"}</b><div><strong>{user?.name}</strong><small>{user?.program || "Student"}</small><small>{user?.semester || "Student"}</small></div></div>}
      {type === "coordinator" && <p className="portal-caption">COORDINATOR PORTAL</p>}
      <SidebarLinks links={links} className="portal-nav" onNavigate={type === "student" ? closeStudentMenu : undefined} />
      <div className="portal-sidebar-footer">{type === "admin" && <><strong>KIET</strong><span>Campus Event Management</span></>}<button type="button" aria-label="Log out" title="Log out" onClick={logout}><LogOut size={20}/><span>Log out</span></button></div>
    </aside>
    {type === "student" && studentMenuOpen && <button className="portal-mobile-backdrop" type="button" aria-label="Close student navigation" onClick={closeStudentMenu} />}
    <main className="portal-content">
      {type === "student" && <div className="portal-mobile-menu-bar"><button type="button" aria-expanded={studentMenuOpen} aria-label={studentMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setStudentMenuOpen((open) => !open)}>{studentMenuOpen ? <X size={20}/> : <Menu size={20}/>}<span>{studentMenuOpen ? "Close menu" : "Menu"}</span></button></div>}
      {children || <Outlet />}
    </main>
  </div>;
}

export function AdminLayout() { return <PortalFrame type="admin" links={adminLinks} />; }
export function CoordinatorLayout() { return <PortalFrame type="coordinator" links={coordinatorLinks} />; }
export function StudentLayout() { return <PortalFrame type="student" links={studentLinks} />; }
