import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Search, Download, QrCode, Users, UserCheck, UserX, Award } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useRegistrations } from "../context/RegistrationContext";
import { toCsv } from "../utils/csv";
import "./CoordinatorAttendance.css";

export default function CoordinatorAttendance() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { registrations: allRegistrations, attendanceRecords, campusCredAwards, markAttendance, finalizeEventAttendance } = useRegistrations();
  const assignedEvents = events.filter((event) => !["Cancelled", "Archived"].includes(event.status) && (event.leadCoordinator === user?.id || event.coCoordinators?.includes(user?.id)));
  const [selectedEvent, setSelectedEvent] = useState("");
  const [search, setSearch] = useState("");
  const [academicFilters, setAcademicFilters] = useState({ course: "all", department: "all", year: "all", semester: "all", section: "all" });
  const [showQR, setShowQR] = useState(false);
  const eventId = selectedEvent || String(assignedEvents[0]?.id || "");
  const event = assignedEvents.find((item) => String(item.id) === eventId);
  const records = useMemo(() => allRegistrations.filter((record) => String(record.eventId) === eventId && record.status === "Confirmed"), [allRegistrations, eventId]);
  const rows = records.map((registration) => ({ registration, attendance: attendanceRecords.find((item) => item.registrationId === registration.registrationId) }));
  const filteredRows = rows.filter(({ registration }) => `${registration.studentName || ""} ${registration.rollNumber || registration.studentId} ${registration.studentEmail || ""}`.toLowerCase().includes(search.toLowerCase()) && Object.entries(academicFilters).every(([key, value]) => value === "all" || String(registration[key] || "") === value));
  const presentCount = rows.filter((row) => row.attendance?.status === "Present").length;
  const absentCount = rows.filter((row) => row.attendance?.status === "Absent").length;
  const attendancePercentage = rows.length ? Math.round((presentCount / rows.length) * 100) : 0;
  const eventAwards = campusCredAwards.filter((award) => String(award.eventId) === String(event?.id));

  const exportCSV = () => {
    const data = filteredRows.map(({ registration, attendance }) => [registration.studentName, registration.rollNumber || registration.studentId, registration.studentEmail, registration.phone, registration.course, registration.department, registration.academicYear, registration.year, registration.semester, registration.section, event?.title, attendance?.status || "Not Marked", attendance?.timestamp || ""]);
    const blob = new Blob([toCsv([["Name", "Roll Number", "Email", "Phone", "Course", "Department", "Academic Year", "Year", "Semester", "Section", "Event", "Attendance", "Timestamp"], ...data])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "campuspulse-attendance.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="coord-attendance-page">
    <header className="coord-att-header"><div><span className="coord-att-eyebrow">EVENT MANAGEMENT</span><h1>Attendance</h1><p>Record attendance for confirmed registrations.</p></div><button className="coord-att-export" onClick={exportCSV}><Download size={17} /> Export CSV</button></header>
    <div className="coord-att-event-select"><label htmlFor="assigned-attendance-event">Select Assigned Event</label><select id="assigned-attendance-event" value={eventId} onChange={(e) => { setSelectedEvent(e.target.value); setShowQR(false); }}><option value="">No assigned events</option>{assignedEvents.map((item) => <option key={item.id} value={String(item.id)}>{item.title}</option>)}</select></div>
    {event && <>
      <div className="coord-att-stats"><div className="coord-att-stat"><Users /><div><span>Registrations</span><strong>{rows.length}</strong></div></div><div className="coord-att-stat"><UserCheck /><div><span>Present</span><strong>{presentCount}</strong></div></div><div className="coord-att-stat"><UserX /><div><span>Absent</span><strong>{absentCount}</strong></div></div><div className="coord-att-stat"><QrCode /><div><span>Attendance Rate</span><strong>{attendancePercentage}%</strong></div></div></div>
      <div className="coord-att-qr-card"><div><h2><Award size={18}/> CampusCred Awards</h2><p>{Number(event.campusCredPoints) || 0} points per eligible participant · {eventAwards.length} awarded · {eventAwards.reduce((sum, item) => sum + Number(item.pointsAwarded || 0), 0)} total points · {event.status === "Completed" ? "Attendance finalized" : "Attendance not finalized"}</p><small>Students awarded: {eventAwards.map((award) => rows.find(({ registration }) => registration.studentId === award.studentId)?.registration.studentName || award.studentId).join(", ") || "None yet"}</small></div>{event.status !== "Completed" && <button disabled={rows.some(({ attendance }) => !attendance)} onClick={() => { const result = finalizeEventAttendance(event.id); if (result.ok) window.alert(`Attendance finalized. ${result.awardsCreated} CampusCred awards created.`); else window.alert(result.message); }}>Finalize Attendance &amp; Award Points</button>}</div>
      <div className="coord-att-qr-card"><div><h2>QR Check-in</h2><p>Illustrative code only; use the attendance controls below to record check-in.</p></div><button onClick={() => setShowQR(!showQR)}><QrCode size={17} />{showQR ? "Hide QR Code" : "Show QR Code"}</button></div>
      {showQR && <div className="coord-att-qr-display"><QRCodeSVG value={`CampusPulse event ${event.id}`} size={200} level="H" /><h3>{event.title}</h3><p>Use the attendance controls below to record student check-in.</p></div>}
      <div className="coord-att-table-card"><div className="coord-att-table-heading"><h2>Participant Attendance</h2><div className="coord-att-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, roll number, email..." /></div></div><div className="coord-att-academic-filters">{Object.entries({ course: "Course", department: "Department", year: "Year", semester: "Semester", section: "Section" }).map(([key, label]) => <select key={key} aria-label={`Filter by ${label}`} value={academicFilters[key]} onChange={(e) => setAcademicFilters((state) => ({ ...state, [key]: e.target.value }))}><option value="all">All {label}</option>{[...new Set(rows.map(({ registration }) => registration[key]).filter(Boolean))].map((value) => <option value={value} key={value}>{value}</option>)}</select>)}</div><div className="coord-att-table-wrapper"><table className="coord-att-table"><thead><tr><th>Participant</th><th>Roll Number</th><th>Course / Department</th><th>Year / Semester / Section</th><th>Status</th><th>Mark Attendance</th></tr></thead><tbody>{filteredRows.map(({ registration, attendance }) => <tr key={registration.registrationId}><td>{registration.studentName}<small>{registration.studentEmail}</small></td><td>{registration.rollNumber || registration.studentId}</td><td>{registration.course || "—"} / {registration.department || "—"}</td><td>{registration.year || "—"} / {registration.semester || "—"} / {registration.section || "—"}</td><td><span className={`coord-att-status ${(attendance?.status || 'unmarked').toLowerCase()}`}>{attendance?.status || "Not Marked"}</span></td><td><div className="coord-att-actions"><button className="present-btn" disabled={attendance?.status === "Present"} onClick={() => markAttendance(registration.registrationId, "Present")}>Present</button><button className="absent-btn" disabled={attendance?.status === "Absent"} onClick={() => markAttendance(registration.registrationId, "Absent")}>Absent</button></div></td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="coord-att-empty"><Users size={35} /><h3>No registered participants</h3><p>Only confirmed registrations for assigned events appear here.</p></div>}</div></div>
    </>}
  </div>;
}
