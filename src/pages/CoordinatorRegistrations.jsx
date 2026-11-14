import { useState } from "react";
import { Search, Download, Users, CheckCircle, XCircle } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useRegistrations } from "../context/RegistrationContext";
import { toCsv } from "../utils/csv";
import "./CoordinatorRegistrations.css";

const academicFields = ["course", "department", "year", "semester", "section"];

export default function CoordinatorRegistrations() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { registrations: allRegistrations } = useRegistrations();
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [academicFilters, setAcademicFilters] = useState(Object.fromEntries(academicFields.map((key) => [key, "all"])));
  const assignedEvents = events.filter((event) => event.leadCoordinator === user?.id || event.coCoordinators?.includes(user?.id));
  const registrations = allRegistrations.filter((record) => assignedEvents.some((event) => String(event.id) === String(record.eventId)));
  const filteredRegistrations = registrations.filter((record) => {
    const matchesEvent = selectedEvent === "all" || String(record.eventId) === selectedEvent;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesSearch = `${record.studentName || ""} ${record.rollNumber || record.studentId} ${record.studentEmail || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesAcademic = academicFields.every((key) => academicFilters[key] === "all" || String(record[key] || "") === academicFilters[key]);
    return matchesEvent && matchesStatus && matchesSearch && matchesAcademic;
  });
  const confirmedCount = registrations.filter((item) => item.status === "Confirmed").length;
  const cancelledCount = registrations.filter((item) => item.status === "Cancelled").length;
  const academicOptions = Object.fromEntries(academicFields.map((key) => [key, [...new Set(registrations.map((record) => record[key]).filter(Boolean))]]));

  const exportCSV = () => {
    const headers = ["Name", "Roll Number", "Email", "Phone", "Course", "Department", "Academic Year", "Year", "Semester", "Section", "Event", "Registration Status", "Attendance Status", "Registration Date"];
    const rows = filteredRegistrations.map((record) => [record.studentName, record.rollNumber || record.studentId, record.studentEmail, record.phone, record.course, record.department, record.academicYear, record.year, record.semester, record.section, events.find((item) => String(item.id) === String(record.eventId))?.title || record.eventTitle, record.status, record.attendanceStatus || "Not Marked", record.registeredAt]);
    const blob = new Blob([toCsv([headers, ...rows])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "campuspulse-registrations.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="coord-registrations-page">
    <header className="coord-reg-header"><div><span className="coord-reg-eyebrow">EVENT MANAGEMENT</span><h1>Registrations</h1><p>Student registrations for your assigned events.</p></div><button className="coord-reg-export" onClick={exportCSV}><Download size={17} /> Export CSV</button></header>
    <div className="coord-reg-stats"><div className="coord-reg-stat"><Users /><div><span>Total Registrations</span><strong>{registrations.length}</strong></div></div><div className="coord-reg-stat"><CheckCircle /><div><span>Confirmed</span><strong>{confirmedCount}</strong></div></div><div className="coord-reg-stat"><XCircle /><div><span>Cancelled</span><strong>{cancelledCount}</strong></div></div></div>
    <div className="coord-reg-toolbar"><div className="coord-reg-search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, roll number or email..." /></div><select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}><option value="all">All Assigned Events</option>{assignedEvents.map((event) => <option value={String(event.id)} key={event.id}>{event.title}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Statuses</option><option value="Confirmed">Confirmed</option><option value="Cancelled">Cancelled</option></select>{academicFields.map((key) => <select key={key} aria-label={`Filter by ${key}`} value={academicFilters[key]} onChange={(e) => setAcademicFilters((state) => ({ ...state, [key]: e.target.value }))}><option value="all">All {key}</option>{academicOptions[key].map((value) => <option value={value} key={value}>{value}</option>)}</select>)}</div>
    <div className="coord-reg-table-card"><div className="coord-reg-table-heading"><h2>Registered Participants</h2><span>{filteredRegistrations.length} registrations</span></div><div className="coord-reg-table-wrapper"><table className="coord-reg-table"><thead><tr><th>Participant</th><th>Roll Number</th><th>Course / Department</th><th>Year / Sem / Section</th><th>Event</th><th>Registered</th><th>Registration</th><th>Attendance</th></tr></thead><tbody>{filteredRegistrations.map((record) => <tr key={record.registrationId}><td><div className="coord-reg-person"><div className="coord-reg-avatar">{record.studentName?.charAt(0)}</div><div><strong>{record.studentName}</strong><span>{record.studentEmail}</span></div></div></td><td>{record.rollNumber || record.studentId}</td><td>{record.course || "—"} / {record.department || "—"}</td><td>{record.year || "—"} / {record.semester || "—"} / {record.section || "—"}</td><td>{events.find((event) => String(event.id) === String(record.eventId))?.title || record.eventTitle}</td><td>{record.registeredAt ? new Date(record.registeredAt).toLocaleDateString() : "—"}</td><td><span className={`coord-reg-status ${record.status.toLowerCase()}`}>{record.status}</span></td><td>{record.attendanceStatus || "Not Marked"}</td></tr>)}</tbody></table>{!filteredRegistrations.length && <div className="coord-reg-empty"><Users size={35} /><h3>No registrations found</h3><p>Registrations for assigned events will appear here.</p></div>}</div></div>
  </div>;
}
