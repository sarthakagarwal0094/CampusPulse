import { useMemo, useState } from "react";
import { CalendarDays, Users, UserCheck, TrendingUp, Download, BarChart3 } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useRegistrations } from "../context/RegistrationContext";
import { toCsv } from "../utils/csv";
import "./CoordinatorAnalytics.css";

export default function CoordinatorAnalytics() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { registrations, attendanceRecords, campusCredAwards } = useRegistrations();
  const [selectedEvent, setSelectedEvent] = useState("all");
  const assignedEvents = events.filter((event) => !["Cancelled", "Archived"].includes(event.status) && (event.leadCoordinator === user?.id || event.coCoordinators?.includes(user?.id)));
  const filteredEvents = selectedEvent === "all" ? assignedEvents : assignedEvents.filter((event) => String(event.id) === selectedEvent);
  const analytics = useMemo(() => filteredEvents.map((event) => {
    const registered = registrations.filter((record) => String(record.eventId) === String(event.id) && record.status === "Confirmed").length;
    const confirmedIds = new Set(registrations.filter((record) => String(record.eventId) === String(event.id) && record.status === "Confirmed").map((record) => String(record.registrationId)));
    const attendees = attendanceRecords.filter((record) => String(record.eventId) === String(event.id) && record.status === "Present" && confirmedIds.has(String(record.registrationId))).length;
    const awards = campusCredAwards.filter((award) => String(award.eventId) === String(event.id));
    return { ...event, registrations: registered, attendees, attendanceRate: registered ? Math.round(attendees / registered * 100) : 0, eligibleParticipants: attendees, awardedParticipants: awards.length, totalPointsAwarded: awards.reduce((sum, award) => sum + Number(award.pointsAwarded || 0), 0) };
  }), [filteredEvents, registrations, attendanceRecords, campusCredAwards]);
  const totalRegistrations = analytics.reduce((sum, event) => sum + event.registrations, 0);
  const totalAttendees = analytics.reduce((sum, event) => sum + event.attendees, 0);
  const averageAttendance = totalRegistrations ? Math.round(totalAttendees / totalRegistrations * 100) : 0;
  const maxRegistrations = Math.max(1, ...analytics.map((event) => event.registrations));
  const exportCSV = () => {
    const rows = analytics.map((event) => [event.title, event.registrations, event.attendees, `${event.attendanceRate}%`, event.campusCredPoints || 0, event.awardedParticipants, event.totalPointsAwarded, event.status]);
    const blob = new Blob([toCsv([["Event", "Confirmed Registrations", "Present", "Attendance Rate", "Points per Eligible Student", "Students Awarded", "Total Points Awarded", "Award Status"], ...rows])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "campuspulse-coordinator-analytics.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="ca-layout"><main className="ca-main">
    <header className="ca-header"><div><p className="ca-eyebrow">PERFORMANCE OVERVIEW</p><h1>Event Analytics</h1><p>Registration and attendance totals for your assigned events.</p></div><button className="ca-export-btn" onClick={exportCSV}><Download size={17} /> Export CSV</button></header>
    <div className="ca-filter"><label htmlFor="eventFilter">Filter by event</label><select id="eventFilter" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}><option value="all">All assigned events</option>{assignedEvents.map((event) => <option key={event.id} value={String(event.id)}>{event.title}</option>)}</select></div>
    <section className="ca-stats"><div className="ca-stat-card"><div className="ca-stat-icon teal"><CalendarDays /></div><p>Assigned Events</p><h2>{analytics.length}</h2><span>Events in this view</span></div><div className="ca-stat-card"><div className="ca-stat-icon blue"><Users /></div><p>Confirmed Registrations</p><h2>{totalRegistrations}</h2><span>Across selected events</span></div><div className="ca-stat-card"><div className="ca-stat-icon green"><UserCheck /></div><p>Present</p><h2>{totalAttendees}</h2><span>Coordinator-marked</span></div><div className="ca-stat-card"><div className="ca-stat-icon amber"><TrendingUp /></div><p>Attendance Rate</p><h2>{averageAttendance}%</h2><span>Present / confirmed registrations</span></div></section>
    <section className="ca-charts"><div className="ca-panel"><div className="ca-panel-heading"><div><h3>Registrations by Event</h3><p>Current local registration records</p></div><BarChart3 size={20} /></div><div className="ca-performance-list">{analytics.map((event) => <div className="ca-performance-item" key={event.id}><div className="ca-performance-title"><span>{event.title}</span><strong>{event.registrations}</strong></div><div className="ca-progress-track"><div className="ca-progress-fill" style={{ width: `${event.registrations / maxRegistrations * 100}%` }} /></div><small>{event.attendees} present · {event.attendanceRate}% attendance</small></div>)}{!analytics.length && <p className="ca-empty">No assigned events found.</p>}</div></div></section>
    <section className="ca-panel ca-table-panel"><div className="ca-panel-heading"><div><h3>Event Summary</h3><p>Configured points, attendance eligibility, and awards for your assigned events</p></div></div><div className="ca-table-wrap"><table className="ca-table"><thead><tr><th>Event</th><th>Points Each</th><th>Eligible</th><th>Awarded</th><th>Total Points</th><th>Status</th></tr></thead><tbody>{analytics.map((event) => <tr key={event.id}><td>{event.title}</td><td>{Number(event.campusCredPoints) || 0}</td><td>{event.eligibleParticipants}</td><td>{event.awardedParticipants}</td><td>{event.totalPointsAwarded}</td><td>{event.status === "Completed" ? "Finalized" : "Open"}</td></tr>)}</tbody></table></div></section>
  </main></div>;
}
