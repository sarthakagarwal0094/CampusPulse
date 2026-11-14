
import { useMemo } from "react";
import { useEvents } from "../context/EventContext";
import { useVenues } from "../context/VenueContext";
import { useRegistrations } from "../context/RegistrationContext";
import { useCoordinatorProfiles } from "../context/CoordinatorProfileContext";
import { toCsv } from "../utils/csv";
import {
  BarChart3,
  CalendarDays,
  MapPin,
  Users,
  Download,
  TrendingUp,
} from "lucide-react";
import "./AdminAnalytics.css";

export default function AdminAnalytics() {
  const { events } = useEvents();
  const { venues } = useVenues();
  const { registrations, attendanceRecords, campusCredAwards } = useRegistrations();
  const { coordinatorProfiles: coordinators } = useCoordinatorProfiles();

  const activeEvents = events.filter(
    (event) => !["Cancelled", "Archived", "Completed"].includes(event.status)
  );

  const cancelledEvents = events.filter(
    (event) => event.status === "Cancelled"
  );

  const categories = ["Technical", "Cultural", "Sports", "Arts", "Workshop"];

  const categoryData = categories.map((category) => ({
    category,
    count: activeEvents.filter((event) => event.category === category).length,
  }));

  const venueData = useMemo(() => {
    return venues.map((venue) => ({
      name: venue.name,
      capacity: Number(venue.capacity || 0),
      events: activeEvents.filter(
        (event) =>
          event.venue?.trim().toLowerCase() ===
          venue.name.trim().toLowerCase()
      ).length,
    }));
  }, [venues, activeEvents]);

  const totalCapacity = venues.reduce(
    (sum, venue) => sum + Number(venue.capacity || 0),
    0
  );

  const coordinatorAssignments = useMemo(() => {
    const result = {};

    activeEvents.forEach((event) => {
      const lead = event.leadCoordinator;
      const coCoordinators = event.coCoordinators || [];

      if (lead) {
        result[lead] = result[lead] || { lead: 0, support: 0 };
        result[lead].lead += 1;
      }

      coCoordinators.forEach((id) => {
        result[id] = result[id] || { lead: 0, support: 0 };
        result[id].support += 1;
      });
    });

    return result;
  }, [activeEvents]);

  const confirmedRegistrations = registrations.filter((record) => record.status === "Confirmed" && activeEvents.some((event) => String(event.id) === String(record.eventId)));
  const presentRecords = attendanceRecords.filter((record) => record.status === "Present" && activeEvents.some((event) => String(event.id) === String(record.eventId)));
  const eventRegistrationStats = events.map((event) => {
    const eventRegistrations = registrations.filter((record) => String(record.eventId) === String(event.id) && record.status === "Confirmed");
    const present = eventRegistrations.filter((record) => attendanceRecords.some((attendance) => attendance.registrationId === record.registrationId && attendance.status === "Present")).length;
    const awards = campusCredAwards.filter((award) => String(award.eventId) === String(event.id));
    return { event, registered: eventRegistrations.length, present, rate: eventRegistrations.length ? Math.round((present / eventRegistrations.length) * 100) : 0, awarded: awards.length, pointsAwarded: awards.reduce((sum, award) => sum + Number(award.pointsAwarded || 0), 0) };
  });

  const exportCSV = () => {
    const rows = [
      ["CampusPulse Institutional Analytics"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["EVENT SUMMARY"],
      ["Total Events", events.length],
      ["Active Events", activeEvents.length],
      ["Cancelled Events", cancelledEvents.length],
      [],
      ["CATEGORY", "EVENT COUNT"],
      ...categoryData.map((item) => [item.category, item.count]),
      [],
      ["VENUE", "CAPACITY", "ASSIGNED EVENTS"],
      ...venueData.map((item) => [
        item.name,
        item.capacity,
        item.events,
      ]),
      [],
      ["COORDINATOR ID", "LEAD EVENTS", "SUPPORT EVENTS"],
              ...Object.entries(coordinatorAssignments).map(([id, value]) => [
        coordinators.find((person) => person.id === id)?.name || id,
        value.lead,
        value.support,
      ]),
      [],
      [],
      ["CONFIRMED REGISTRATIONS", confirmedRegistrations.length],
      ["PRESENT ATTENDANCE RECORDS", presentRecords.length],
      ["CAMPUSCRED POINTS AWARDED", campusCredAwards.reduce((sum, award) => sum + Number(award.pointsAwarded || 0), 0)],
    ];

    const csv = toCsv(rows);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campuspulse-institutional-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxCategory = Math.max(
    1,
    ...categoryData.map((item) => item.count)
  );

  const maxVenueEvents = Math.max(
    1,
    ...venueData.map((item) => item.events)
  );

  return (
    <div className="admin-analytics">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">ADMINISTRATION</span>
          <h1>Institutional Analytics</h1>
          <p>Campus-wide event performance and resource overview.</p>
        </div>

        <button className="analytics-export-btn" onClick={exportCSV}>
          <Download size={17} /> Export CSV
        </button>
      </header>

      <div className="analytics-notice">
        <TrendingUp size={18} />
        <span>
          Event, registration, and attendance figures are calculated from this browser's saved records and are not institutionally verified.
        </span>
      </div>

      <section className="analytics-kpis">
        <div className="analytics-kpi">
          <div className="analytics-icon teal"><CalendarDays /></div>
          <div>
            <span>Total Events</span>
            <h2>{events.length}</h2>
            <small>{activeEvents.length} active</small>
          </div>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-icon amber"><BarChart3 /></div>
          <div>
            <span>Cancelled Events</span>
            <h2>{cancelledEvents.length}</h2>
            <small>Across all categories</small>
          </div>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-icon mint"><MapPin /></div>
          <div>
            <span>Campus Venues</span>
            <h2>{venues.length}</h2>
            <small>{totalCapacity.toLocaleString()} total capacity</small>
          </div>
        </div>

        <div className="analytics-kpi">
          <div className="analytics-icon blue"><Users /></div>
          <div>
            <span>Coordinator Assignments</span>
            <h2>{Object.keys(coordinatorAssignments).length}</h2>
            <small>Coordinators assigned to events</small>
          </div>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Events by Category</h3>
              <p>Active event distribution</p>
            </div>
          </div>

          <div className="analytics-bars">
            {categoryData.map((item) => (
              <div className="analytics-bar-row" key={item.category}>
                <div className="analytics-bar-label">
                  <span>{item.category}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{
                      width: `${(item.count / maxCategory) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Venue Utilization</h3>
              <p>Events assigned to each venue</p>
            </div>
          </div>

          <div className="analytics-bars">
            {venueData.map((item) => (
              <div className="analytics-bar-row" key={item.name}>
                <div className="analytics-bar-label">
                  <span>{item.name}</span>
                  <strong>{item.events} events</strong>
                </div>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill venue-fill"
                    style={{
                      width: `${(item.events / maxVenueEvents) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {venueData.length === 0 && (
              <p className="analytics-empty">No venues available.</p>
            )}
          </div>
        </div>
      </section>

      <section className="analytics-panel analytics-table-panel">
        <div className="analytics-panel-heading">
          <div>
            <h3>Coordinator Workload</h3>
            <p>Lead and support assignments across active events</p>
          </div>
        </div>

        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Coordinator</th>
                <th>Lead Events</th>
                <th>Support Events</th>
                <th>Total Assignments</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(coordinatorAssignments).map(([id, value]) => (
                <tr key={id}>
                  <td>{coordinators.find((person) => person.id === id)?.name || id}</td>
                  <td>{value.lead}</td>
                  <td>{value.support}</td>
                  <td>{value.lead + value.support}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {Object.keys(coordinatorAssignments).length === 0 && (
            <p className="analytics-empty">No coordinator assignments found.</p>
          )}
        </div>
      </section>

      <section className="analytics-panel analytics-table-panel">
        <div className="analytics-panel-heading"><div><h3>Event Registration & Attendance</h3><p>Confirmed participants and marked attendance by event</p></div></div>
        <div className="analytics-table-wrapper"><table className="analytics-table"><thead><tr><th>Event</th><th>Status</th><th>Registrations</th><th>Present / Eligible</th><th>Attendance Rate</th><th>Points Each</th><th>Students Awarded</th><th>Total Awarded</th></tr></thead><tbody>{eventRegistrationStats.map(({ event, registered, present, rate, awarded, pointsAwarded }) => <tr key={event.id}><td>{event.title}</td><td>{event.status === "Completed" ? "Finalized" : event.status}</td><td>{registered}</td><td>{present}</td><td>{rate}%</td><td>{Number(event.campusCredPoints) || 0}</td><td>{awarded}</td><td>{pointsAwarded}</td></tr>)}</tbody></table>{!events.length && <p className="analytics-empty">No events available.</p>}</div>
      </section>

      <p className="analytics-footer">
        CampusPulse Institutional Reports · Locally saved records
      </p>
    </div>
  );
}
