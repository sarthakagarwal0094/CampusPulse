
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  XCircle,
  Ticket
} from 'lucide-react';
import { useRegistrations } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useAdminSettings } from '../context/AdminSettingsContext';
import './MyRegistrations.css';
import AddToCalendarActions from '../components/AddToCalendarActions';
import { getEventAwardStatus } from '../services/campusCredService';

function MyRegistrations() {
  const { registrations: allRegistrations, attendanceRecords, campusCredAwards, cancelRegistration } = useRegistrations();
  const { user } = useAuth();
  const { events } = useEvents();
  const { settings } = useAdminSettings();
  const registrations = allRegistrations.filter((item) => item.studentId === user?.id);

  return (
    <div className="registrations-layout">
      <aside className="student-sidebar">
        <h2 className="sidebar-brand">CampusPulse</h2>
        <p className="sidebar-subtitle">STUDENT PORTAL</p>

        <nav className="student-sidebar-nav">
          <Link to="/student">Dashboard</Link>
          <Link to="/student/events">Explore Events</Link>
          <Link to="/student/registrations" className="active">
            My Registrations
          </Link>
          <Link to="/student/attendance">My Attendance</Link>
          <Link to="/student/campuscred">CampusCred</Link>
          <Link to="/student/certificates">Certificates</Link>
          <Link to="/student/profile">Profile</Link>
        </nav>

        <div className="sidebar-bottom">
          <p>Sarthak Agarwal</p>
          <small>MCA • Semester 1</small>
        </div>
      </aside>

      <main className="registrations-main">
        <header className="registrations-header">
          <div>
            <span className="registrations-eyebrow">STUDENT PORTAL</span>
            <h1>My Registrations</h1>
            <p>Manage your registered campus events.</p>
          </div>

          <Link to="/student/events" className="browse-events-btn">
            Explore Events <ArrowRight size={17} />
          </Link>
        </header>

        <div className="registrations-stats">
          <div className="registration-stat-card">
            <Ticket />
            <div>
              <span>Total Registrations</span>
              <h2>{registrations.length}</h2>
            </div>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="registrations-empty">
            <div className="empty-icon">
              <Ticket size={35} />
            </div>
            <h2>No registrations yet</h2>
            <p>
              You haven't registered for any events.
              Discover exciting events happening on campus!
            </p>
            <Link to="/student/events" className="browse-events-btn">
              Explore Events <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="registrations-list">
            {registrations.map((registration) => {
              const event = events.find((item) => String(item.id) === String(registration.eventId)) || registration.eventSnapshot || {};
              const attendance = attendanceRecords.find((item) => item.registrationId === registration.registrationId);
              const award = campusCredAwards.find((item) => item.studentId === user?.id && String(item.eventId) === String(event.id));
              const awardStatus = getEventAwardStatus({ registration, event, attendance, award });
              return <div className="registration-card" key={registration.registrationId}>
                <img
                  src={event.image}
                  alt={event.title}
                  className="registration-image"
                />

                <div className="registration-card-content">
                  <div className="registration-card-top">
                    <span className="registration-category">
                      {event.category}
                    </span>
                    <span className={`registration-status ${registration.status.toLowerCase()}`}>
                      {registration.status}
                    </span>
                  </div>

                  <h2>{event.title}</h2>
                  {Number(event.campusCredPoints) > 0 && <p className="registration-campuscred-status">{award ? `${award.pointsAwarded} CampusCred points awarded` : `Earn ${Number(event.campusCredPoints)} CampusCred points`} · {awardStatus}</p>}

                  <div className="registration-meta">
                    <span>
                      <CalendarDays size={16} /> {event.date}
                    </span>
                    <span>
                      <Clock size={16} /> {event.time}
                    </span>
                    <span>
                      <MapPin size={16} /> {event.venue}
                    </span>
                  </div>

                  <div className="registration-actions">
                    {event.status !== 'Archived' ? <Link
                      to={`/student/events/${event.id}`}
                      className="registration-details-btn"
                    >
                      View Details <ArrowRight size={16} />
                    </Link> : <span className="registration-details-btn">Event Archived</span>}

                    {registration.status === 'Confirmed' && settings.allowCancellation && <button
                      className="cancel-registration-btn"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to cancel this registration?'
                          )
                        ) {
                          if (!cancelRegistration(registration.registrationId)) window.alert('This registration cannot be cancelled.');
                        }
                      }}
                    >
                      <XCircle size={16} /> Cancel Registration
                    </button>}
                  </div>
                  <AddToCalendarActions event={event} compact />
                </div>
              </div>;
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyRegistrations;
