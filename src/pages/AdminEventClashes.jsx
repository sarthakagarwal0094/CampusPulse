
import { useEffect, useMemo } from "react";
import { useEvents } from "../context/EventContext";
import { useVenues } from "../context/VenueContext";
import { getEventConflicts } from "../utils/eventConflicts";
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminEventClashes.css";

export default function AdminEventClashes() {
  const { events } = useEvents();
  const { venues } = useVenues();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.editEventId == null) return;
    navigate("/admin/events", { state: { editEventId: location.state.editEventId } });
  }, [location.state, navigate]);

  const conflicts = useMemo(
    () => getEventConflicts(events, venues),
    [events, venues]
  );

  const venueConflicts = conflicts.filter((c) => c.sameVenue);
  const scheduleWarnings = conflicts.filter((c) => !c.sameVenue);

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="admin-clashes">
      <div className="clashes-header">
        <div>
          <span className="clashes-eyebrow">ADMINISTRATION</span>
          <h1>Event Clash Management</h1>
          <p>Identify overlapping campus events and venue bookings.</p>
        </div>
        <button
          className="clashes-manage-btn"
          onClick={() => navigate("/admin/events")}
        >
          Manage Events <ArrowRight size={17} />
        </button>
      </div>

      <div className="clashes-stats">
        <div className="clash-stat">
          <div className="clash-stat-icon red">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>Venue Conflicts</span>
            <h2>{venueConflicts.length}</h2>
          </div>
        </div>

        <div className="clash-stat">
          <div className="clash-stat-icon amber">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Schedule Overlaps</span>
            <h2>{scheduleWarnings.length}</h2>
          </div>
        </div>

        <div className="clash-stat">
          <div className="clash-stat-icon green">
            <ShieldCheck size={21} />
          </div>
          <div>
            <span>Conflict Status</span>
            <h2>{conflicts.length === 0 ? "Clear" : "Review"}</h2>
          </div>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="clashes-empty">
          <ShieldCheck size={48} />
          <h2>No Event Clashes Found</h2>
          <p>There are no overlapping event date ranges currently detected.</p>
        </div>
      ) : (
        <div className="clashes-list">
          <div className="clashes-list-header">
            <h2>Detected Conflicts</h2>
            <span>{conflicts.length} issues</span>
          </div>

          {conflicts.map((conflict) => (
            <div
              className={`clash-card ${
                conflict.sameVenue ? "high" : "warning"
              }`}
              key={conflict.id}
            >
              <div className="clash-card-top">
                <span
                  className={`clash-badge ${
                    conflict.sameVenue ? "high" : "warning"
                  }`}
                >
                  <AlertTriangle size={14} />
                  {conflict.type}
                </span>
                <span className="clash-severity">
                  {conflict.severity} Priority
                </span>
              </div>

              <div className="clash-events">
                <div className="clash-event">
                  <h3>{conflict.eventA.title}</h3>
                  <p>
                    <CalendarDays size={15} />
                    {formatDate(conflict.eventA.date)} –{" "}
                    {formatDate(
                      conflict.eventA.endDate || conflict.eventA.date
                    )}
                  </p>
                  <p>
                    <MapPin size={15} />
                    {conflict.eventA.venue}
                  </p>
                </div>

                <div className="clash-vs">VS</div>

                <div className="clash-event">
                  <h3>{conflict.eventB.title}</h3>
                  <p>
                    <CalendarDays size={15} />
                    {formatDate(conflict.eventB.date)} –{" "}
                    {formatDate(
                      conflict.eventB.endDate || conflict.eventB.date
                    )}
                  </p>
                  <p>
                    <MapPin size={15} />
                    {conflict.eventB.venue}
                  </p>
                </div>
              </div>

              <div className="clash-card-footer">
                <span>
                  Overlap: {formatDate(conflict.overlapStart)} –{" "}
                  {formatDate(conflict.overlapEnd)}
                </span>
                <button
                  onClick={() =>
                    navigate("/admin/events", {
                      state: { editEventId: conflict.eventA.id },
                    })
                  }
                >
                  Review Event <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
