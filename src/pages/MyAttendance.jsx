import { CalendarDays, MapPin, CheckCircle, XCircle, QrCode, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useRegistrations } from '../context/RegistrationContext';
import './MyAttendance.css';

export default function MyAttendance() {
  const { user } = useAuth();
  const { events } = useEvents();
  const { registrations, attendanceRecords } = useRegistrations();
  const studentRegistrations = registrations.filter((item) => item.studentId === user?.id);
  const records = studentRegistrations.map((registration) => {
    const event = events.find((item) => String(item.id) === String(registration.eventId)) || registration.eventSnapshot || {};
    const attendance = attendanceRecords.find((item) => item.registrationId === registration.registrationId);
    return { ...registration, event, attendance };
  }).filter((item) => item.attendance);
  const attended = records.filter((item) => item.attendance.status === 'Present').length;
  const missed = records.filter((item) => item.attendance.status === 'Absent').length;
  const total = records.length;
  const percentage = total ? Math.round((attended / total) * 100) : 0;

  return <div className="attendance-layout"><main className="attendance-main">
    <header className="attendance-header"><div><span className="attendance-eyebrow">STUDENT PORTAL</span><h1>My Attendance</h1><p>Track your participation in registered campus events.</p></div><div className="attendance-header-icon"><ClipboardCheck size={28} /></div></header>
    <div className="attendance-stats">
      <div className="attendance-stat-card"><span>Recorded Events</span><h2>{total}</h2><CalendarDays /></div>
      <div className="attendance-stat-card"><span>Events Attended</span><h2>{attended}</h2><CheckCircle /></div>
      <div className="attendance-stat-card"><span>Events Missed</span><h2>{missed}</h2><XCircle /></div>
    </div>
    <section className="attendance-percentage-card"><div><h2>Overall Event Attendance</h2><p>Your participation across recorded events</p></div><div className="attendance-percentage-value">{percentage}%</div><div className="attendance-progress-track"><div className="attendance-progress-fill" style={{ width: `${percentage}%` }} /></div><small>{attended} out of {total} recorded events attended</small></section>
    <section className="attendance-history"><div className="attendance-section-heading"><h2>Attendance History</h2><span>{total} records</span></div>
      {total ? <div className="attendance-record-list">{records.map((record) => <div className="attendance-record" key={record.registrationId}>
        <div className="attendance-record-icon"><CalendarDays size={22} /></div><div className="attendance-record-info"><span className="attendance-record-category">{record.event.category}</span><h3>{record.event.title}</h3><div className="attendance-record-meta"><span><CalendarDays size={14} /> {record.event.date}</span><span><MapPin size={14} /> {record.event.venue}</span></div></div>
        <div className="attendance-record-status"><span className={`attendance-status-badge ${record.attendance.status.toLowerCase()}`}>{record.attendance.status === 'Present' ? <CheckCircle size={15} /> : <XCircle size={15} />}{record.attendance.status}</span><span className="attendance-verification"><QrCode size={14} /> Coordinator recorded</span></div>
      </div>)}</div> : <div className="attendance-empty"><h3>No attendance records yet</h3><p>Attendance will appear after a coordinator records it for one of your registrations.</p></div>}
    </section>
  </main></div>;
}
