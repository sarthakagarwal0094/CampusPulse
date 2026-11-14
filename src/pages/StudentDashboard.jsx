import { Link } from 'react-router-dom';
import { CalendarDays, BookmarkCheck, ClipboardCheck, Award, Bell, ArrowRight, MapPin, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useCertificates } from '../context/CertificateContext';
import AddToCalendarActions from '../components/AddToCalendarActions';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar';
import { categoryClass } from '../utils/eventCategories';
import { getCampusCredData } from '../services/campusCredService';
import './StudentDashboard.css';

const kolkataToday = () => new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());

export default function StudentDashboard() {
  const { user } = useAuth();
  const { events } = useEvents();
  const { registrations, attendanceRecords, campusCredAwards } = useRegistrations();
  const { issuedCertificates } = useCertificates();
  const myRegistrations = registrations.filter((item) => item.studentId === user?.id && item.status === 'Confirmed');
  const myAttendance = attendanceRecords.filter((item) => item.studentId === user?.id && item.status === 'Present');
  const myCertificates = issuedCertificates.filter((item) => item.studentId === user?.id);
  const campusCred = getCampusCredData({ user, events, attendanceRecords, issuedCertificates, campusCredAwards });
  const today = kolkataToday();
  const availableEvents = events.filter((event) => ['Upcoming','Ongoing'].includes(event.status) && event.date >= today).sort((a,b) => a.date.localeCompare(b.date) || String(a.startTime || a.time || '').localeCompare(String(b.startTime || b.time || '')));
  const registeredEventIds = new Set(myRegistrations.map((registration) => String(registration.eventId)));
  const registeredEvents = availableEvents.filter((event) => registeredEventIds.has(String(event.id)) && event.status !== 'Cancelled' && event.status !== 'Archived');
  const recommended = availableEvents.filter((event) => !myRegistrations.some((item) => String(item.eventId) === String(event.id))).slice(0, 3);
  return <div className="student-dashboard"><main className="student-main">
    <header className="student-topbar"><h1>Student Dashboard</h1><div className="student-topbar-actions"><button className="student-notification" type="button" disabled title="Notifications are unavailable" aria-label="Notifications unavailable"><Bell size={21}/></button><Link className="student-profile-button" to="/student/profile" aria-label="Open profile"><span className="student-mini-avatar">{user?.profileImage?<img src={user.profileImage} alt=""/>:user?.name?.split(/\s+/).map((part)=>part[0]).slice(0,2).join('').toUpperCase()}</span></Link></div></header>
    <div className="student-content">
      <section className="student-welcome"><div><h2>Welcome back, <span>{user?.name}!</span></h2><p>Discover campus events and keep track of your participation.</p></div></section>
      <section className="student-stats"><div className="student-stat teal-stat"><div className="stat-icon"><BookmarkCheck/></div><div><p>My Registrations</p><strong>{myRegistrations.length}</strong></div></div><div className="student-stat orange-stat"><div className="stat-icon"><ClipboardCheck/></div><div><p>Events Attended</p><strong>{myAttendance.length}</strong></div></div><div className="student-stat purple-stat"><div className="stat-icon"><Award/></div><div><p>Certificates</p><strong>{myCertificates.length}</strong></div></div><div className="student-stat blue-stat"><div className="stat-icon"><CalendarDays/></div><div><p>Upcoming Events</p><strong>{availableEvents.length}</strong></div></div></section>
    </div>

    <div className="student-dashboard-calendar"><UpcomingEventsCalendar/></div>

    <section className="student-panel dashboard-upcoming-panel">
      <div className="student-panel-heading"><div><h2>My Registered Events</h2><p>Events you've registered for</p></div><Link to="/student/registrations">View All <ArrowRight size={16}/></Link></div>
      {registeredEvents.length ? <div className="upcoming-list">{registeredEvents.map((event) => <article className="upcoming-event-card" key={event.id}>
        {event.image ? <Link to={`/student/events/${event.id}`} className="upcoming-event-image-link" aria-label={`View ${event.title}`}><img src={event.image} alt=""/></Link> : <div className="upcoming-event-image-placeholder" aria-hidden="true"><CalendarDays size={22}/></div>}
        <div className="upcoming-event-info"><div className="event-card-badges"><span className={`event-tag category-badge ${categoryClass(event.category)}`}>{event.category || 'Other'}</span><span className="student-event-badge registered">Registered</span></div><h3><Link to={`/student/events/${event.id}`}>{event.title}</Link></h3><p><CalendarDays size={14}/> {event.date}</p><p><Clock size={14}/> {event.startTime || event.time || 'Time to be announced'}</p><p><MapPin size={14}/> {event.venue || 'Venue to be announced'}</p></div>
        <div className="upcoming-event-actions"><Link className="event-card-details" to={`/student/events/${event.id}`}>View Details</Link><AddToCalendarActions event={event} compact iconOnly/></div>
      </article>)}</div> : <div className="registered-events-empty"><p>You haven't registered for any events yet.</p><Link to="/student/events">Explore Events <ArrowRight size={15}/></Link></div>}
    </section>

    <section className="student-dashboard-grid"><div className="student-column-left">
      <div className="student-panel"><div className="student-panel-heading"><div><h2>Recommended for You</h2><p>Events you have not registered for</p></div></div><div className="recommended-grid">{recommended.map((event) => <article className="recommended-event-card" key={event.id}><Link className="recommended-event" to={`/student/events/${event.id}`}>{event.image && <img src={event.image} alt=""/>}<div className="recommended-event-body"><span className={`event-tag category-badge ${categoryClass(event.category)}`}>{event.category}</span><h3>{event.title}</h3><p>{event.date}</p></div></Link><AddToCalendarActions event={event} compact/></article>)}{!recommended.length && <p>You are registered for all available events.</p>}</div></div>
      <div className="student-panel"><div className="student-panel-heading"><div><h2>My Certificates</h2><p>Certificates issued for your events</p></div><Link to="/student/certificates">View All <ArrowRight size={16}/></Link></div>{myCertificates.slice(0, 3).map((certificate) => <div className="month-event" key={certificate.id}><Award size={17}/><span>{certificate.eventTitle}</span></div>)}{!myCertificates.length && <p>No certificates issued yet.</p>}</div>
    </div><div className="student-column-middle"><div className="student-panel"><div className="student-panel-heading"><div><h2>CampusCred</h2><p>Participation record summary</p></div><Trophy/></div><div className="campuscred-content"><div className="cred-circle"><strong>{campusCred.points}</strong><span>points</span></div><div className="cred-progress"><p>{campusCred.awards.length} event awards · {myAttendance.length} attendance records</p><Link to="/student/campuscred">View CampusCred <ArrowRight size={15}/></Link></div></div></div></div>
    <div className="student-column-right"><div className="student-panel"><div className="calendar-heading"><h2>My Activity</h2></div><div className="student-activity-list"><div className="month-event"><BookmarkCheck size={17}/><span>{myRegistrations.length} active registrations</span></div><div className="month-event"><ClipboardCheck size={17}/><span>{myAttendance.length} events attended</span></div><div className="month-event"><Award size={17}/><span>{myCertificates.length} certificates earned</span></div></div><Link to="/student/attendance">View attendance <ArrowRight size={15}/></Link></div></div></section>
  </main></div>;
}
