
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import { useCoordinatorProfiles } from "../context/CoordinatorProfileContext";
import {
  Users,
  Search,
  CalendarDays,
  UserCheck,
  UserPlus,
  X,
  ArrowRight,
  Pencil,
  Plus,
} from "lucide-react";
import "./AdminCoordinators.css";

export default function AdminCoordinators() {
  const { events, coordinators, assignCoordinators } = useEvents();
  const { createCoordinator, updateCoordinator } = useCoordinatorProfiles();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [assignmentType, setAssignmentType] = useState("lead");
  const [coordinatorForm, setCoordinatorForm] = useState(null);
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false);
  const [coordinatorDraft, setCoordinatorDraft] = useState({ name: "", employeeId: "", email: "", phone: "", department: "", designation: "", profileImage: "", status: "Active" });
  const [formError, setFormError] = useState("");
  const [coordinatorNotice, setCoordinatorNotice] = useState("");

  const coordinatorData = useMemo(() => {
    return coordinators.map((coordinator) => {
      const assignedEvents = events.filter(
        (event) =>
          event.leadCoordinator === coordinator.id ||
          event.coCoordinators?.includes(coordinator.id)
      );

      const leadEvents = assignedEvents.filter(
        (event) => event.leadCoordinator === coordinator.id
      );

      const assistingEvents = assignedEvents.filter(
        (event) => event.coCoordinators?.includes(coordinator.id)
      );

      return {
        ...coordinator,
        assignedEvents,
        leadEvents,
        assistingEvents,
      };
    });
  }, [events, coordinators]);

  const filteredCoordinators = coordinatorData.filter((coordinator) => {
    const query = search.toLowerCase();
    const matchesSearch = `${coordinator.name} ${coordinator.email} ${coordinator.employeeId || ""} ${coordinator.department || ""}`.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All" || (coordinator.status || "Active") === statusFilter;
    const matchesDepartment = departmentFilter === "All" || coordinator.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const openCoordinatorForm = (coordinator = null) => {
    setCoordinatorNotice("");
    setCoordinatorModalOpen(true);
    setFormError("");
    setCoordinatorForm(coordinator);
    setCoordinatorDraft(coordinator ? { name: "", ...coordinator } : { name: "", employeeId: "", email: "", phone: "", department: "", designation: "", profileImage: "", status: "Active" });
  };

  const saveCoordinator = (event) => {
    event.preventDefault();
    const cleaned = { ...coordinatorDraft, name: coordinatorDraft.name.trim(), employeeId: coordinatorDraft.employeeId.trim(), email: coordinatorDraft.email.trim().toLowerCase(), phone: coordinatorDraft.phone.trim(), department: coordinatorDraft.department.trim(), designation: coordinatorDraft.designation.trim() };
    if (!cleaned.name || !cleaned.employeeId || !cleaned.email || !cleaned.department || !cleaned.designation) { setFormError("Complete all required fields before saving."); return; }
    const result = coordinatorForm ? updateCoordinator(coordinatorForm.id, cleaned) : createCoordinator(cleaned);
    if (!result) { setFormError("Could not save. Check that the email is unique and browser storage is available."); return; }
    if (coordinatorForm && coordinatorForm.status !== "Inactive" && cleaned.status === "Inactive") events.forEach((event) => {
      if (event.date >= new Date().toISOString().slice(0, 10) && !["Cancelled", "Archived", "Completed"].includes(event.status) && (event.leadCoordinator === coordinatorForm.id || event.coCoordinators?.includes(coordinatorForm.id))) {
        assignCoordinators(event.id, event.leadCoordinator === coordinatorForm.id ? "" : event.leadCoordinator, (event.coCoordinators || []).filter((id) => id !== coordinatorForm.id));
      }
    });
    setCoordinatorModalOpen(false);
    setCoordinatorForm(null);
    setCoordinatorNotice(coordinatorForm ? "Coordinator details updated." : "Coordinator account created and available for assignment.");
  };

  const toggleCoordinatorStatus = (coordinator) => {
    const inactive = coordinator.status !== "Inactive";
    if (inactive && !window.confirm(`Deactivate ${coordinator.name}? This removes them from future event assignments and preserves event history.`)) return;
    if (!updateCoordinator(coordinator.id, { status: inactive ? "Inactive" : "Active" })) { window.alert("Unable to update coordinator status."); return; }
    if (inactive) events.forEach((event) => {
      if (event.date >= new Date().toISOString().slice(0, 10) && !["Cancelled", "Archived", "Completed"].includes(event.status) && (event.leadCoordinator === coordinator.id || event.coCoordinators?.includes(coordinator.id))) {
        assignCoordinators(event.id, event.leadCoordinator === coordinator.id ? "" : event.leadCoordinator, (event.coCoordinators || []).filter((id) => id !== coordinator.id));
      }
    });
    setCoordinatorNotice(`${coordinator.name} ${inactive ? "deactivated" : "activated"}.`);
  };

  const openAssignment = (coordinator, type) => {
    setSelectedCoordinator(coordinator);
    setAssignmentType(type);
    setSelectedEvent("");
  };

  const handleAssignment = () => {
    if (!selectedEvent || !selectedCoordinator) {
      alert("Please select an event.");
      return;
    }

    const event = events.find(
      (item) => String(item.id) === selectedEvent
    );

    if (!event) return;

    let lead = event.leadCoordinator || "";
    let coCoordinators = event.coCoordinators || [];

    if (assignmentType === "lead") {
      lead = selectedCoordinator.id;

      // A lead cannot also be a co-coordinator
      coCoordinators = coCoordinators.filter(
        (id) => id !== selectedCoordinator.id
      );
    } else {
      if (lead === selectedCoordinator.id) {
        alert("This coordinator is already the Lead Coordinator.");
        return;
      }

      if (!coCoordinators.includes(selectedCoordinator.id)) {
        coCoordinators = [...coCoordinators, selectedCoordinator.id];
      }
    }

    assignCoordinators(event.id, lead, coCoordinators);

    alert("Coordinator assignment updated!");
    setSelectedCoordinator(null);
  };

  const removeAssignment = (event, coordinatorId) => {
    if (!window.confirm("Remove this coordinator from the event?")) return;

    const lead =
      event.leadCoordinator === coordinatorId
        ? ""
        : event.leadCoordinator;

    const coCoordinators = (event.coCoordinators || []).filter(
      (id) => id !== coordinatorId
    );

    assignCoordinators(event.id, lead, coCoordinators);
  };

  return (
    <div className="ac-layout">
      <aside className="ac-sidebar">
        <div className="ac-brand">
          <span className="ac-brand-icon"><Users /></span>
          <div>
            <h2>CampusPulse</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="ac-nav">
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/events">Event Management</NavLink>
          <NavLink to="/admin/coordinators">Coordinator Management</NavLink>
          <NavLink to="/admin/venues">Venue Management</NavLink>
          <NavLink to="/admin/clashes">Event Clash Management</NavLink>
          <NavLink to="/admin/analytics">Analytics & Reports</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
      </aside>

      <main className="ac-main">
        <header className="ac-header">
          <div>
            <p className="ac-eyebrow">INSTITUTION MANAGEMENT</p>
            <h1>Coordinator Management</h1>
            <p>Manage coordinator assignments and event responsibilities.</p>
          </div>
          <button className="ac-primary-btn" onClick={() => openCoordinatorForm()}><Plus size={17} /> Add Coordinator</button>
        </header>
        {coordinatorNotice && <p className="ac-notice" role="status">{coordinatorNotice}</p>}

        <section className="ac-stats">
          <div>
            <span>Total Coordinators</span>
            <strong>{coordinators.length}</strong>
          </div>
          <div>
            <span>Assigned Coordinators</span>
            <strong>
              {coordinatorData.filter((c) => c.assignedEvents.length > 0).length}
            </strong>
          </div>
          <div>
            <span>Managed Events</span>
            <strong>
              {events.filter((e) => !["Cancelled", "Archived"].includes(e.status)).length}
            </strong>
          </div>
        </section>

        <section className="ac-panel">
          <div className="ac-toolbar">
            <div className="ac-search">
              <Search size={18} />
              <input
                placeholder="Search name, email, employee ID, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ac-filters"><select aria-label="Filter by account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select><select aria-label="Filter by department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option>All</option>{[...new Set(coordinatorData.map((item) => item.department).filter(Boolean))].map((department) => <option key={department}>{department}</option>)}</select></div>
          </div>

          <div className="ac-coordinator-grid">
            {filteredCoordinators.map((coordinator) => (
              <div className="ac-coordinator-card" key={coordinator.id}>
                <div className="ac-coordinator-top">
                  <div className="ac-avatar">
                    {coordinator.profileImage ? <img src={coordinator.profileImage} alt="" /> : coordinator.name.charAt(0)}
                  </div>
                  <span className={`ac-coordinator-badge ${coordinator.status === "Inactive" ? "inactive" : ""}`}>
                    {coordinator.status || "Active"} · {coordinator.assignedEvents.length} assigned
                  </span>
                </div>

                <h3>{coordinator.name}</h3>
                <p className="ac-email">{coordinator.email}</p>
                <p className="ac-email">{coordinator.employeeId} · {coordinator.department} · {coordinator.designation}</p>

                <div className="ac-coordinator-metrics">
                  <div>
                    <CalendarDays size={16} />
                    <span>{coordinator.assignedEvents.length} Events</span>
                  </div>
                  <div>
                    <UserCheck size={16} />
                    <span>{coordinator.leadEvents.length} Lead</span>
                  </div>
                </div>

                <div className="ac-coordinator-actions">
                  <button onClick={() => openCoordinatorForm(coordinator)}><Pencil size={15} /> Edit</button>
                  <button onClick={() => toggleCoordinatorStatus(coordinator)}>{coordinator.status === "Inactive" ? "Activate" : "Deactivate"}</button>
                  <button
                    disabled={coordinator.status === "Inactive"}
                    onClick={() => openAssignment(coordinator, "lead")}
                  >
                    <UserPlus size={16} /> Assign Lead
                  </button>
                  <button
                    disabled={coordinator.status === "Inactive"}
                    onClick={() => openAssignment(coordinator, "co")}
                  >
                    <Users size={16} /> Assign Co-Coordinator
                  </button>
                </div>

                <div className="ac-assigned-events">
                  <h4>Assigned Events</h4>

                  {coordinator.assignedEvents.length === 0 && (
                    <p className="ac-empty">No assigned events.</p>
                  )}

                  {coordinator.assignedEvents.map((event) => (
                    <div className="ac-assigned-event" key={event.id}>
                      <div>
                        <strong>{event.title}</strong>
                        <span>
                          {event.leadCoordinator === coordinator.id
                            ? "Lead Coordinator"
                            : "Co-Coordinator"}
                        </span>
                      </div>
                      <button
                        title="Remove assignment"
                        onClick={() => removeAssignment(event, coordinator.id)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredCoordinators.length === 0 && (
            <p className="ac-empty ac-no-results">
              No coordinators found.
            </p>
          )}
        </section>
      </main>

      {selectedCoordinator && (
        <div className="ac-modal-overlay">
          <div className="ac-modal">
            <div className="ac-modal-header">
              <div>
                <h2>
                  {assignmentType === "lead"
                    ? "Assign Lead Coordinator"
                    : "Assign Co-Coordinator"}
                </h2>
                <p>{selectedCoordinator.name}</p>
              </div>
              <button onClick={() => setSelectedCoordinator(null)}>
                <X />
              </button>
            </div>

            <label className="ac-modal-label">
              Select Event
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">Choose an event</option>
                {events
                  .filter((event) => !["Cancelled", "Archived"].includes(event.status))
                  .map((event) => (
                    <option key={event.id} value={String(event.id)}>
                      {event.title}
                    </option>
                  ))}
              </select>
            </label>

            <div className="ac-modal-footer">
              <button
                className="ac-secondary-btn"
                onClick={() => setSelectedCoordinator(null)}
              >
                Cancel
              </button>
              <button className="ac-primary-btn" onClick={handleAssignment}>
                Confirm Assignment <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {coordinatorModalOpen && (
        <div className="ac-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCoordinatorModalOpen(false); }}>
          <form className="ac-modal ac-coordinator-form" onSubmit={saveCoordinator}>
            <div className="ac-modal-header"><div><h2>{coordinatorForm ? "Edit Coordinator" : "Add Coordinator"}</h2><p>Manage coordinator profile and account status.</p></div><button type="button" onClick={() => setCoordinatorModalOpen(false)} aria-label="Close"><X /></button></div>
            <div className="ac-form-grid">{[["name", "Full Name", "text"], ["employeeId", "Employee ID", "text"], ["email", "Email Address", "email"], ["phone", "Phone Number", "tel"], ["department", "Department", "text"], ["designation", "Designation", "text"], ["profileImage", "Profile Image URL (optional)", "url"]].map(([key, label, type]) => <label key={key}>{label}<input type={type} value={coordinatorDraft[key] || ""} required={key !== "phone" && key !== "profileImage"} onChange={(event) => setCoordinatorDraft((draft) => ({ ...draft, [key]: event.target.value }))} /></label>)}{!coordinatorForm && <label>Account Status<select value={coordinatorDraft.status || "Active"} onChange={(event) => setCoordinatorDraft((draft) => ({ ...draft, status: event.target.value }))}><option>Active</option><option>Inactive</option></select></label>}</div>
            {formError && <p className="ac-form-error" role="alert">{formError}</p>}
            <div className="ac-modal-footer"><button type="button" className="ac-secondary-btn" onClick={() => setCoordinatorModalOpen(false)}>Cancel</button><button className="ac-primary-btn" type="submit">{coordinatorForm ? "Save Changes" : "Create Account"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
