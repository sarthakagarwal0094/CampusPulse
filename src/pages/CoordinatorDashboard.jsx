import { Link } from "react-router-dom";
import { CalendarDays, Users, ClipboardList, QrCode, Award, ChartNoAxesColumn, Bell, MapPin, ArrowRight, CircleCheck, Zap } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useCoordinatorProfiles } from "../context/CoordinatorProfileContext";
import { useRegistrations } from "../context/RegistrationContext";
import "./CoordinatorDashboard.css";

function StatCard({ icon: Icon, title, value, subtitle }) {
  return <div className="coord-stat-card"><div className="coord-stat-icon"><Icon size={27} /></div><div className="coord-stat-info"><span>{title}</span><strong>{value}</strong><small>{subtitle}</small></div></div>;
}

export default function CoordinatorDashboard() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { coordinatorProfiles: coordinators } = useCoordinatorProfiles();
  const coordinatorProfile = coordinators.find((item) => item.id === user?.id);
  const { registrations, attendanceRecords } = useRegistrations();
  const assigned = events.filter((event) => event.status !== "Archived" && (event.leadCoordinator === user?.id || event.coCoordinators?.includes(user?.id)));
  const assignedIds = new Set(assigned.map((event) => String(event.id)));
  const ownRegistrations = registrations.filter((record) => assignedIds.has(String(record.eventId)) && record.status === "Confirmed");
  const ownAttendance = attendanceRecords.filter((record) => assignedIds.has(String(record.eventId)) && record.status === "Present");
  const teamEvent = assigned[0];
  const teamIds = teamEvent ? [teamEvent.leadCoordinator, ...(teamEvent.coCoordinators || [])].filter(Boolean) : [];

  return <div className="coord-layout"><main className="coord-main">
    <header className="coord-topbar"><span className="coord-role-badge"><CircleCheck size={15} /> Coordinator Portal</span><div className="coord-topbar-right"><Bell size={22} /><div className="coord-user"><div className="coord-avatar">{coordinatorProfile?.name?.charAt(0) || 'C'}</div><div><strong>{coordinatorProfile?.name || "Coordinator"}</strong><small>Coordinator</small></div></div></div></header>
    <section className="coord-content"><div className="coord-welcome"><div><span className="coord-eyebrow">COORDINATOR DASHBOARD</span><h1>Welcome, {coordinatorProfile?.name || "Coordinator"}!</h1><p>Manage assigned events, participants, attendance, and certificates.</p></div><div className="coord-date"><CalendarDays size={18} /> {new Date().toLocaleDateString()}</div></div>
      <section className="coord-stats"><StatCard icon={CalendarDays} title="My Events" value={assigned.length} subtitle="Assigned events"/><StatCard icon={Users} title="Participants" value={ownRegistrations.length} subtitle="Confirmed registrations"/><StatCard icon={ClipboardList} title="Registrations" value={ownRegistrations.length} subtitle="Across assigned events"/><StatCard icon={QrCode} title="Attendance" value={ownAttendance.length} subtitle="Marked present"/></section>
      <section className="coord-middle-grid"><div className="coord-panel coord-events-panel"><div className="coord-panel-heading"><h2><CalendarDays /> My Events</h2><Link to="/coordinator/events">View All <ArrowRight size={17}/></Link></div><div className="coord-event-list">{assigned.slice(0, 4).map((event) => <div className="coord-event-row" key={event.id}><img src={event.image} alt=""/><div className="coord-event-details"><strong>{event.title}</strong><span className={`coord-event-role ${event.leadCoordinator === user?.id ? "lead" : ""}`}>{event.leadCoordinator === user?.id ? "Lead Coordinator" : "Co-Coordinator"}</span><div className="coord-event-meta"><span><CalendarDays size={15}/>{event.date}</span><span><MapPin size={15}/>{event.venue}</span></div></div><span className={`coord-status ${event.status?.toLowerCase()}`}>{event.status}</span></div>)}{!assigned.length && <p>No events are assigned to you.</p>}</div></div>
        <div className="coord-panel coord-team-panel"><div className="coord-panel-heading"><h2><Users/> {teamEvent ? `Team · ${teamEvent.title}` : "Event Team"}</h2><Link to="/coordinator/teams">View Teams <ArrowRight size={17}/></Link></div><div className="coord-team-list">{teamIds.map((id) => { const person = coordinators.find((item) => item.id === id); if (!person) return null; return <div className="coord-team-member" key={id}><div className="coord-avatar">{person.name.charAt(0)}</div><strong>{person.name}</strong><span className={`coord-member-role ${id === teamEvent?.leadCoordinator ? "lead" : ""}`}>{id === teamEvent?.leadCoordinator ? "Lead Coordinator" : "Co-Coordinator"}</span></div>; })}{!teamIds.length && <p>No team to show until an event is assigned.</p>}</div></div></section>
      <section className="coord-bottom-grid"><div className="coord-panel coord-quick-panel"><div className="coord-panel-heading"><h2><Zap/> Quick Actions</h2></div><div className="coord-quick-actions"><Link to="/coordinator/events"><CalendarDays size={28}/><span>Manage My Events</span></Link><Link to="/coordinator/teams"><Users size={28}/><span>View Event Teams</span></Link><Link to="/coordinator/attendance"><QrCode size={28}/><span>Mark Attendance</span></Link><Link to="/coordinator/certificates"><Award size={28}/><span>Issue Certificates</span></Link></div></div><div className="coord-panel coord-insights-panel"><div className="coord-panel-heading"><h2><ChartNoAxesColumn/> Local Summary</h2><Link to="/coordinator/analytics">Analytics <ArrowRight size={16}/></Link></div><div className="coord-insights"><div className="coord-donut"><div><strong>{ownRegistrations.length}</strong><span>Registrations</span></div></div><div className="coord-legend"><div><i className="registered"/> Registered <strong>{ownRegistrations.length}</strong></div><div><i className="attended"/> Present <strong>{ownAttendance.length}</strong></div><div><i className="absent"/> Not marked present <strong>{Math.max(0, ownRegistrations.length - ownAttendance.length)}</strong></div></div></div></div></section>
    </section>
  </main></div>;
}
