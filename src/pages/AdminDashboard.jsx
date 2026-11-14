
import { useEvents } from "../context/EventContext";
import { useRegistrations } from "../context/RegistrationContext";
import { useCertificates } from "../context/CertificateContext";
import { useCoordinatorProfiles } from "../context/CoordinatorProfileContext";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  UserCheck,
  Award,
  BarChart3,
  MapPin,
  Layers,
  Settings,
  Bell,
  Plus,
  UserPlus,
  MapPinned,
  ArrowRight,
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { events } = useEvents();
  const { coordinatorProfiles: coordinators } = useCoordinatorProfiles();
  const { registrations } = useRegistrations();
  const { issuedCertificates } = useCertificates();
  const navigate = useNavigate();

  const upcomingEvents = events
    .filter((event) => !["Cancelled", "Archived", "Completed"].includes(event.status))
    .filter((event) => event.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const activeEvents = events.filter(
    (event) => !["Cancelled", "Archived", "Completed"].includes(event.status)
  ).length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">
            <CalendarDays size={25} />
          </span>
          <div>
            <h2>CampusPulse</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <BarChart3 /> Dashboard
          </NavLink>
          <NavLink to="/admin/events">
            <CalendarDays /> Event Management
          </NavLink>
          <NavLink to="/admin/coordinators">
            <Users /> Coordinator Management
          </NavLink>
          <NavLink to="/admin/venues">
            <MapPin /> Venue Management
          </NavLink>
          <NavLink to="/admin/clashes">
            <Layers /> Event Clash Management
          </NavLink>
          <NavLink to="/admin/analytics">
            <BarChart3 /> Analytics & Reports
          </NavLink>
          <NavLink to="/admin/settings">
            <Settings /> Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <strong>KIET</strong>
          <span>Campus Event Management</span>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage events, coordinators, venues, and monitor campus activities.</p>
          </div>

          <div className="admin-header-profile">
            <button className="admin-notification" type="button" disabled title="Notifications are unavailable" aria-label="Notifications unavailable">
              <Bell size={20} />
            </button>
            <span className="admin-avatar">A</span>
            <strong>Admin</strong>
          </div>
        </header>

        <section className="admin-kpis">
          <div className="admin-kpi">
            <div className="admin-kpi-icon teal"><CalendarDays /></div>
            <div>
              <p>Total Events</p>
              <h2>{events.length}</h2>
              <span>{activeEvents} active events</span>
            </div>
          </div>

          <div className="admin-kpi">
            <div className="admin-kpi-icon blue"><Users /></div>
            <div>
              <p>Coordinators</p>
              <h2>{coordinators.length}</h2>
              <span>Registered coordinators</span>
            </div>
          </div>

          <div className="admin-kpi">
            <div className="admin-kpi-icon green"><UserCheck /></div>
            <div>
              <p>Total Registrations</p>
              <h2>{registrations.filter((registration) => registration.status === "Confirmed").length}</h2>
              <span>Confirmed registrations</span>
            </div>
          </div>

          <div className="admin-kpi">
            <div className="admin-kpi-icon amber"><Award /></div>
            <div>
              <p>Certificates Issued</p>
              <h2>{issuedCertificates.length}</h2>
              <span>Certificates issued</span>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-panel admin-event-overview">
            <div className="admin-panel-heading">
              <div>
                <h3>Event Overview</h3>
                <p>Events by category</p>
              </div>
            </div>

            <div className="admin-category-list">
              {["Technical", "Cultural", "Sports", "Arts", "Workshop"].map(
                (category) => {
                  const count = events.filter(
                    (event) => event.category === category
                  ).length;

                  return (
                    <div className="admin-category-row" key={category}>
                      <span>{category}</span>
                      <strong>{count}</strong>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="admin-panel admin-event-list">
            <div className="admin-panel-heading">
              <div>
                <h3>Upcoming Events</h3>
                <p>Scheduled campus events</p>
              </div>
              <NavLink to="/admin/events">
                View All <ArrowRight size={15} />
              </NavLink>
            </div>

            {upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <div className="admin-upcoming-event" key={event.id}>
                  <div className="admin-event-icon">
                    <CalendarDays size={19} />
                  </div>
                  <div className="admin-event-info">
                    <strong>{event.title}</strong>
                    <span>
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {event.venue}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-empty">No upcoming events available.</p>
            )}
          </div>
        </section>

        <section className="admin-panel admin-quick-actions">
          <div className="admin-panel-heading">
            <div>
              <h3>Quick Actions</h3>
              <p>Frequently used administrative tasks</p>
            </div>
          </div>

          <div className="admin-actions-grid">
            <button onClick={() => navigate("/admin/events")}>
              <span className="admin-action-icon teal"><Plus /></span>
              <strong>Create Event</strong>
            </button>

            <button onClick={() => navigate("/admin/coordinators")}>
              <span className="admin-action-icon blue"><UserPlus /></span>
              <strong>Assign Coordinator</strong>
            </button>

            <button onClick={() => navigate("/admin/venues")}>
              <span className="admin-action-icon amber"><MapPinned /></span>
              <strong>Add Venue</strong>
            </button>

            <button onClick={() => navigate("/admin/clashes")}>
              <span className="admin-action-icon purple"><Layers /></span>
              <strong>Check Event Clash</strong>
            </button>
          </div>
        </section>

        <p className="admin-footer-note">
          CampusPulse Admin Workspace · KIET
        </p>
      </main>
    </div>
  );
}
