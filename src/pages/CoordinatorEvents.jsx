
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Clock, Users, Eye } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import "./CoordinatorEvents.css";
import { categoryClass } from "../utils/eventCategories";

function CoordinatorEvents() {
  const { events } = useEvents();
  const { user } = useAuth();

  const myEvents = events
    .map((event) => ({
      ...event,
      myRole:
        event.leadCoordinator === user?.id
          ? "Lead Coordinator"
          : event.coCoordinators?.includes(user?.id)
          ? "Co-Coordinator"
          : null,
    }))
    .filter((event) => event.myRole && event.status !== "Archived");

  return (
    <div className="coord-events-page">
      <div className="coord-events-header">
        <div>
          <span className="coord-eyebrow">EVENT MANAGEMENT</span>
          <h1>My Events</h1>
          <p>Manage events assigned to you and track their progress.</p>
        </div>

        <span className="coord-create-btn">Admin-managed events</span>
      </div>

      <div className="coord-events-summary">
        <div>
          <span>Total Assigned</span>
          <strong>{myEvents.length}</strong>
        </div>
        <div>
          <span>Lead Events</span>
          <strong>
            {myEvents.filter((event) => event.myRole === "Lead Coordinator").length}
          </strong>
        </div>
        <div>
          <span>Coordinated Events</span>
          <strong>
            {myEvents.filter((event) => event.myRole === "Co-Coordinator").length}
          </strong>
        </div>
      </div>

      <div className="coord-events-grid">
        {myEvents.map((event) => {
          const isLead = event.myRole === "Lead Coordinator";

          return (
            <article className="coord-managed-event" key={event.id}>
              <div className="coord-managed-event-image">
                <img src={event.image} alt={event.title} />

                <span className={`coord-managed-status ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </div>

              <div className="coord-managed-event-body">
                <span className={`coord-event-category category-badge ${categoryClass(event.category)}`}>{event.category || "Other"}</span>
                <span className={`coord-managed-role ${isLead ? "lead" : ""}`}>
                  {isLead ? "★ Lead Coordinator" : "Co-Coordinator"}
                </span>

                <h2>{event.title}</h2>
                {Number(event.campusCredPoints) > 0 && <p className="coord-campuscred-points">CampusCred: {Number(event.campusCredPoints)} points per eligible student</p>}

                <div className="coord-managed-meta">
                  <span><CalendarDays size={16} /> {event.date}</span>
                  <span><Clock size={16} /> {event.time}</span>
                  <span><MapPin size={16} /> {event.venue}</span>
                </div>

                <div className="coord-managed-team">
                  <Users size={16} />
                  <span>
                    {1 + event.coCoordinators.length} Team Members
                  </span>
                </div>

                <div className="coord-managed-actions">
                  <Link to={`/coordinator/events/${event.id}`} className="coord-view-event">
                    <Eye size={16} /> View
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {myEvents.length === 0 && (
        <div className="coord-events-empty">
          <CalendarDays size={45} />
          <h2>No assigned events yet</h2>
          <p>Events assigned to you will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default CoordinatorEvents;
