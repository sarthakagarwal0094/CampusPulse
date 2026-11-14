import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, User, CheckCircle, Award } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';
import AddToCalendarActions from '../components/AddToCalendarActions';
import { categoryClass } from '../utils/eventCategories';

function EventDetails() {
  const { id } = useParams();
  const { events } = useEvents();
  const { registrations, campusCredAwards, registerEvent } = useRegistrations();
  const { user } = useAuth();
  const event = events.find((item) => String(item.id) === String(id) && item.status !== 'Archived');

  if (!event) return (
    <div className="event-details-layout"><main className="event-details-main event-not-found">
      <h1>Event not found</h1>
      <p>This event may have been removed or the link may be invalid.</p>
      <Link to={user?.role === 'coordinator' ? '/coordinator/events' : '/student/events'} className="back-link"><ArrowLeft size={18} /> Back to Events</Link>
    </main></div>
  );

  const registration = registrations.find((item) => item.studentId === user?.id && String(item.eventId) === String(event.id) && item.status === 'Confirmed');
  const registeredCount = registrations.filter((item) => String(item.eventId) === String(event.id) && item.status === 'Confirmed').length;
  const studentAward = campusCredAwards.find((item) => item.studentId === user?.id && String(item.eventId) === String(event.id));
  const remainingCapacity = Math.max(0, Number(event.capacity || 0) - registeredCount);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const unavailable = ['Cancelled', 'Completed', 'Archived'].includes(event.status) || event.date < today || (event.registrationDeadline && event.registrationDeadline < today) || remainingCapacity === 0;
  const backPath = user?.role === 'coordinator' ? '/coordinator/events' : '/student/events';

  const handleRegister = () => {
    const result = registerEvent(event.id);
    if (!result.ok) window.alert(result.message);
  };

  return (
    <div className="event-details-layout">
      <main className="event-details-main">
        <Link to={backPath} className="back-link"><ArrowLeft size={18} /> Back to Events</Link>
        <div className="event-details-banner">
          <img src={event.image} alt={event.title} />
          <div className="event-details-banner-overlay">
            <span className={`event-category category-badge ${categoryClass(event.category)}`}>{event.category || 'Other'}</span>
            <h1>{event.title}</h1>
            <p>{event.status === 'Cancelled' ? 'Event Cancelled' : 'Discover · Participate · Achieve'}</p>
          </div>
        </div>
        <div className="event-details-grid">
          <div className="event-details-content">
            <section className="details-card"><h2>About This Event</h2><p>{event.description || 'Event details will be shared by the organizers.'}</p></section>
            {event.objectives?.length > 0 && <section className="details-card"><h2>Event Objectives</h2><ul>{event.objectives.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            {event.schedule?.length > 0 && <section className="details-card"><h2>Event Schedule</h2>{event.schedule.map((item) => <div className="schedule-item" key={item}><span className="schedule-dot"/><p>{item}</p></div>)}</section>}
            {event.rules?.length > 0 && <section className="details-card"><h2>Rules & Guidelines</h2><ul>{event.rules.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          </div>
          <aside className="event-registration-card">
            <h2>Event Information</h2>
            <div className="event-info-item"><CalendarDays /><div><small>Date</small><p>{event.date}{event.endDate && event.endDate !== event.date ? ` – ${event.endDate}` : ''}</p></div></div>
            <div className="event-info-item"><Clock /><div><small>Time</small><p>{event.time || 'To be announced'}</p></div></div>
            <div className="event-info-item"><MapPin /><div><small>Venue</small><p>{event.venue || 'To be announced'}</p></div></div>
            <div className="event-info-item"><User /><div><small>Organizer</small><p>{event.organizer || 'CampusPulse'}</p></div></div>
            <div className="event-info-item"><Users /><div><small>Available Seats</small><p>{remainingCapacity} of {event.capacity || 0}</p></div></div>
            <div className="registration-deadline">Status<strong>{event.status || 'Upcoming'}</strong></div>
            {Number(event.campusCredPoints) > 0 && <div className="event-campuscred-points"><Award size={20}/><div><strong>{studentAward ? `${studentAward.pointsAwarded} CampusCred points earned` : `Earn ${Number(event.campusCredPoints)} CampusCred Points`}</strong><small>{studentAward ? `Awarded ${new Date(studentAward.awardedAt).toLocaleDateString()}` : 'Points are awarded after confirmed attendance and event completion.'}</small></div></div>}
            <AddToCalendarActions event={event} />
            {user?.role === 'student' && <button className={`register-event-btn ${registration ? 'registered' : ''}`} onClick={handleRegister} disabled={Boolean(registration) || unavailable}>
              {registration ? <><CheckCircle size={18} /> Registered Successfully</> : unavailable ? event.status === 'Cancelled' ? 'Event Cancelled' : event.status === 'Completed' ? 'Event Completed' : 'Registration Closed' : 'Register Now'}
            </button>}
            {registration && <p className="registration-success">Your registration is confirmed. {Number(event.campusCredPoints) > 0 ? `You can earn ${Number(event.campusCredPoints)} CampusCred points after successful attendance and event completion.` : "Your registration will appear in My Registrations."}</p>}
            <p className="registration-note">{event.status === 'Cancelled' ? 'This event is cancelled.' : 'Sign in with your student account to register.'}</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default EventDetails;
