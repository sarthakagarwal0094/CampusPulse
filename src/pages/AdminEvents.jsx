
import { useEffect, useState } from "react";
import { useEvents } from "../context/EventContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useVenues } from "../context/VenueContext";
import { useRegistrations } from "../context/RegistrationContext";
import technicalImage from "../assets/events/technical.jpg";
import {
  CalendarDays,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  MapPin,
  Ban,
  Download,
} from "lucide-react";
import { toCsv } from "../utils/csv";
import "./AdminEvents.css";
import { categoryClass, normalizeEventCategory } from "../utils/eventCategories";

const emptyForm = {
  title: "",
  category: "Technical",
  description: "",
  date: "",
  endDate: "",
  time: "",
  venue: "",
  capacity: 100,
  campusCredPoints: 0,
  achievementCategory: "",
  achievementDescription: "",
  image: technicalImage,
  leadCoordinator: "",
  coCoordinators: [],
};

export default function AdminEvents() {
  const {
    events,
    coordinators,
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    assignCoordinators,
  } = useEvents();
  const availableCoordinators = coordinators.filter((person) => person.status !== "Inactive");
  const { venues } = useVenues();
  const { registrations, attendanceRecords, campusCredAwards, finalizeEventAttendance } = useRegistrations();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [participantsEventId, setParticipantsEventId] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilters, setParticipantFilters] = useState({ course: "All", department: "All", year: "All", semester: "All", section: "All" });
  const requestedEvent = events.find((item) => String(item.id) === String(location.state?.editEventId));
  const [modalOpen, setModalOpen] = useState(Boolean(requestedEvent));
  const [editingEvent, setEditingEvent] = useState(requestedEvent || null);
  const [form, setForm] = useState(() => requestedEvent ? { ...emptyForm, ...requestedEvent, capacity: requestedEvent.capacity || 100, leadCoordinator: requestedEvent.leadCoordinator || "", coCoordinators: requestedEvent.coCoordinators || [] } : emptyForm);

  useEffect(() => {
    if (location.state?.editEventId == null) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || normalizeEventCategory(event.category) === normalizeEventCategory(categoryFilter);

    const matchesStatus =
      statusFilter === "All" || event.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });
  const participantEvent = events.find((event) => String(event.id) === participantsEventId);
  const participantRecords = registrations.filter((record) => String(record.eventId) === participantsEventId);
  const filteredParticipants = participantRecords.filter((record) => `${record.studentName || ""} ${record.rollNumber || record.studentId || ""} ${record.studentEmail || ""}`.toLowerCase().includes(participantSearch.toLowerCase()) && Object.entries(participantFilters).every(([key, value]) => value === "All" || String(record[key] || "") === value));
  const exportParticipants = () => {
    const rows = filteredParticipants.map((record) => [record.studentName, record.rollNumber || record.studentId, record.studentEmail, record.phone, record.course, record.department, record.academicYear, record.year, record.semester, record.section, record.status, attendanceRecords.find((item) => item.registrationId === record.registrationId)?.status || record.attendanceStatus || "Not Marked"]);
    const blob = new Blob([toCsv([["Name", "Roll Number", "Email", "Phone", "Course", "Department", "Academic Year", "Year", "Semester", "Section", "Registration Status", "Attendance Status"], ...rows])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${participantEvent?.title || "event"}-participants.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setForm({
      ...emptyForm,
      ...event,
      capacity: event.capacity || 100,
      leadCoordinator: event.leadCoordinator || "",
      coCoordinators: event.coCoordinators || [],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCoCoordinatorChange = (id) => {
    setForm((previous) => ({
      ...previous,
      coCoordinators: previous.coCoordinators.includes(id)
        ? previous.coCoordinators.filter((item) => item !== id)
        : [...previous.coCoordinators, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.date || !form.venue.trim()) {
      alert("Please fill in the event title, date, and venue.");
      return;
    }
    if (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1 || !Number.isFinite(Date.parse(form.date))) {
      alert("Enter a valid event date and a whole-number capacity greater than zero.");
      return;
    }
    if (!Number.isInteger(Number(form.campusCredPoints)) || Number(form.campusCredPoints) < 0) {
      alert("CampusCred points must be a whole number of zero or more.");
      return;
    }
    const selectedVenue = venues.find((venue) => venue.name.trim().toLowerCase() === form.venue.trim().toLowerCase());
    if (selectedVenue && Number(form.capacity) > Number(selectedVenue.capacity)) {
      alert(`Event capacity cannot exceed the selected venue capacity (${selectedVenue.capacity}).`);
      return;
    }
    if (form.endDate && form.endDate < form.date) {
      alert("The event end date cannot be before its start date.");
      return;
    }

    const eventData = {
      ...form,
      capacity: Number(form.capacity),
      campusCredPoints: Number(form.campusCredPoints),
      coCoordinators: form.coCoordinators.filter(
        (id) => id !== form.leadCoordinator
      ),
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      assignCoordinators(
        editingEvent.id,
        eventData.leadCoordinator,
        eventData.coCoordinators
      );
      alert("Event updated successfully!");
    } else {
      createEvent(eventData);
      alert("Event created successfully!");
    }

    closeModal();
  };

  const handleCancelEvent = (event) => {
    if (window.confirm(`Cancel "${event.title}"?`)) {
      cancelEvent(event.id);
    }
  };

  const handleDeleteEvent = (event) => {
    if (
      window.confirm(
        `Archive "${event.title}"? Existing registrations and certificates will be retained.`
      )
    ) {
      deleteEvent(event.id);
    }
  };

  return (
    <div className="ae-layout">
      <aside className="ae-sidebar">
        <div className="ae-brand">
          <span className="ae-brand-icon"><CalendarDays /></span>
          <div>
            <h2>CampusPulse</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="ae-nav">
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/events">Event Management</NavLink>
          <NavLink to="/admin/coordinators">Coordinator Management</NavLink>
          <NavLink to="/admin/venues">Venue Management</NavLink>
          <NavLink to="/admin/clashes">Event Clash Management</NavLink>
          <NavLink to="/admin/analytics">Analytics & Reports</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
      </aside>

      <main className="ae-main">
        <header className="ae-header">
          <div>
            <p className="ae-eyebrow">INSTITUTION MANAGEMENT</p>
            <h1>Event Management</h1>
            <p>Create, manage, and assign coordinators to campus events.</p>
          </div>
          <button className="ae-primary-btn" onClick={openCreateModal}>
            <Plus size={18} /> Create Event
          </button>
        </header>

        <section className="ae-summary">
          <div><span>Total Events</span><strong>{events.filter(e => e.status !== "Archived").length}</strong></div>
          <div><span>Upcoming</span><strong>{events.filter(e => e.status === "Upcoming").length}</strong></div>
          <div><span>Cancelled</span><strong>{events.filter(e => e.status === "Cancelled").length}</strong></div>
        </section>

        <section className="ae-panel">
          <div className="ae-toolbar">
            <div className="ae-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events or venues..."
              />
            </div>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option>All</option>
              <option>Technical</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Arts</option>
              <option>Workshop</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Upcoming</option>
              <option>Cancelled</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>
          </div>

          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Venue</th>
                  <th>Lead Coordinator</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const lead = coordinators.find(
                    (c) => c.id === event.leadCoordinator
                  );

                  return (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.title}</strong>
                        <small className={`category-badge ${categoryClass(event.category)}`}>{event.category || "Other"}</small>
                        <small>{Number(event.campusCredPoints) || 0} CampusCred pts</small>
                      </td>
                      <td>
                        <span className="ae-detail"><CalendarDays size={14} /> {event.date}</span>
                        <span className="ae-detail"><MapPin size={14} /> {event.venue}</span>
                      </td>
                      <td>{lead?.name || "Unassigned"}</td>
                      <td>{1 + (event.coCoordinators?.length || 0)} members</td>
                      <td>
                        <span className={`ae-status ${event.status?.toLowerCase()}`}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <div className="ae-actions">
                          <button title="View event participants" onClick={() => setParticipantsEventId(String(event.id))}><Users size={16} /></button>
                          <button title="Edit event" onClick={() => openEditModal(event)}><Pencil size={16} /></button>
                          {!['Cancelled', 'Archived'].includes(event.status) && (
                            <button title="Cancel event" onClick={() => handleCancelEvent(event)}><Ban size={16} /></button>
                          )}
                          {event.status !== "Archived" && <button className="ae-delete" title="Archive event" onClick={() => handleDeleteEvent(event)}><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredEvents.length === 0 && (
              <div className="ae-empty">No events match your filters.</div>
            )}
          </div>
        </section>

        {participantEvent && <section className="ae-panel ae-participants-panel">
          <header className="ae-participants-header"><div><p className="ae-eyebrow">EVENT PARTICIPANTS</p><h2>{participantEvent.title}</h2><p>{participantRecords.length} total registrations · {participantRecords.filter((item) => item.status === "Confirmed").length} confirmed</p></div><div><button className="ae-secondary-btn" onClick={exportParticipants}><Download size={16} /> Export CSV</button><button className="ae-icon-btn" onClick={() => setParticipantsEventId("")} aria-label="Close participants">×</button></div></header>
          <p className="ae-event-award-summary">CampusCred: {Number(participantEvent.campusCredPoints) || 0} points per eligible student · {participantRecords.filter((record) => record.status === "Confirmed" && attendanceRecords.some((attendance) => attendance.registrationId === record.registrationId && attendance.status === "Present")).length} eligible · {campusCredAwards.filter((item) => String(item.eventId) === String(participantEvent.id)).length} students awarded · {campusCredAwards.filter((item) => String(item.eventId) === String(participantEvent.id)).reduce((sum, item) => sum + Number(item.pointsAwarded || 0), 0)} total points · {participantEvent.status === "Completed" ? "Finalized" : "Attendance open"} {participantEvent.status !== "Completed" && <button className="ae-secondary-btn" onClick={() => { const result = finalizeEventAttendance(participantEvent.id); if (result.ok) window.alert(`Attendance finalized. ${result.awardsCreated} CampusCred awards created.`); else window.alert(result.message); }}>Finalize Attendance &amp; Award Points</button>}</p>
          <small>Students awarded: {campusCredAwards.filter((item) => String(item.eventId) === String(participantEvent.id)).map((award) => participantRecords.find((record) => record.studentId === award.studentId)?.studentName || award.studentId).join(", ") || "None yet"}</small>
          <div className="ae-toolbar"><div className="ae-search"><Search size={18} /><input value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} placeholder="Search name, roll number, or email" /></div>{Object.entries({ course: "Course", department: "Department", year: "Year", semester: "Semester", section: "Section" }).map(([key, label]) => <select key={key} aria-label={`Filter by ${label}`} value={participantFilters[key]} onChange={(e) => setParticipantFilters((state) => ({ ...state, [key]: e.target.value }))}><option value="All">All {label}</option>{[...new Set(participantRecords.map((record) => record[key]).filter(Boolean))].map((value) => <option key={value}>{value}</option>)}</select>)}</div>
          <div className="ae-table-wrap"><table className="ae-table"><thead><tr><th>Student</th><th>Roll Number</th><th>Course / Department</th><th>Year / Sem / Section</th><th>Email / Phone</th><th>Registration</th><th>Attendance</th></tr></thead><tbody>{filteredParticipants.map((record) => <tr key={record.registrationId}><td>{record.studentName}</td><td>{record.rollNumber || record.studentId}</td><td>{record.course || "—"} / {record.department || "—"}</td><td>{record.year || "—"} / {record.semester || "—"} / {record.section || "—"}</td><td>{record.studentEmail}<small>{record.phone || ""}</small></td><td>{record.status}</td><td>{attendanceRecords.find((item) => item.registrationId === record.registrationId)?.status || record.attendanceStatus || "Not Marked"}</td></tr>)}</tbody></table>{!filteredParticipants.length && <div className="ae-empty">No participants match these filters.</div>}</div>
        </section>}
      </main>

      {modalOpen && (
        <div className="ae-modal-overlay">
          <div className="ae-modal">
            <div className="ae-modal-header">
              <div>
                <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
                <p>Event details and coordinator assignments</p>
              </div>
              <button onClick={closeModal}><X /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ae-form-grid">
                <label className="ae-full">
                  Event Title *
                  <input name="title" value={form.title} onChange={handleChange} required />
                </label>

                <label>
                  Category *
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option>Technical</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                    <option>Arts</option>
                    <option>Workshop</option>
                  </select>
                </label>

                <label>
                  Capacity *
                  <input type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
                </label>

                <label className="ae-full">
                  CampusCred Points Awarded on Successful Participation
                  <input type="number" min="0" step="1" name="campusCredPoints" value={form.campusCredPoints ?? 0} onChange={handleChange} required />
                  <small>Students earn these points after successful attendance and event completion.</small>
                </label>

                <label>
                  Achievement Category
                  <select name="achievementCategory" value={form.achievementCategory || ""} onChange={handleChange}><option value="">Use event category ({form.category})</option><option>Technical</option><option>Cultural</option><option>Sports</option><option>Arts</option><option>Workshop</option></select>
                </label>

                <label>
                  Achievement Description
                  <input name="achievementDescription" value={form.achievementDescription || ""} onChange={handleChange} placeholder="Optional" />
                </label>

                <label>
                  Start Date *
                  <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </label>

                <label>
                  End Date
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </label>

                <label>
                  Start Time
                  <input name="time" value={form.time} onChange={handleChange} placeholder="09:00 AM" />
                </label>

                <label>
                  Venue *
                  <input name="venue" list="campuspulse-venues" value={form.venue} onChange={handleChange} required />
                  <datalist id="campuspulse-venues">{venues.map((venue) => <option value={venue.name} key={venue.id} />)}</datalist>
                </label>

                <label className="ae-full">
                  Description
                  <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
                </label>

                <label className="ae-full">
                  Lead Coordinator
                  <select name="leadCoordinator" value={form.leadCoordinator} onChange={handleChange}>
                    <option value="">Unassigned</option>
                    {availableCoordinators.map((coordinator) => (
                      <option key={coordinator.id} value={coordinator.id}>{coordinator.name}</option>
                    ))}
                  </select>
                </label>

                <div className="ae-full ae-coordinator-select">
                  <span><Users size={16} /> Co-Coordinators</span>
                  {availableCoordinators.filter(c => c.id !== form.leadCoordinator).map((coordinator) => (
                    <label className="ae-checkbox" key={coordinator.id}>
                      <input
                        type="checkbox"
                        checked={form.coCoordinators.includes(coordinator.id)}
                        onChange={() => handleCoCoordinatorChange(coordinator.id)}
                      />
                      {coordinator.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="ae-modal-footer">
                <button type="button" className="ae-secondary-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ae-primary-btn">
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
