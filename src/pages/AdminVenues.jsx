
import { useState } from "react";
import { useVenues } from "../context/VenueContext";
import {
  MapPin,
  Users,
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import "./AdminVenues.css";

const emptyForm = {
  name: "",
  location: "",
  capacity: "",
  type: "Auditorium",
  facilities: "",
};

const venueTypes = ["Auditorium", "Seminar Hall", "Classroom", "Outdoor", "Other"];

export default function AdminVenues() {
  const { venues, addVenue, updateVenue, deleteVenue } = useVenues();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.location.toLowerCase().includes(search.toLowerCase());

    const matchesType = filter === "All" || venue.type === filter;

    return matchesSearch && matchesType;
  });

  const totalCapacity = venues.reduce(
    (sum, venue) => sum + Number(venue.capacity || 0),
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      type: venue.type,
      facilities: venue.facilities,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const venueData = {
      ...form,
      capacity: Number(form.capacity),
    };

    if (editingId !== null) {
      updateVenue(editingId, venueData);
    } else {
      addVenue(venueData);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (venue) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${venue.name}"?`
    );

    if (confirmed) {
      deleteVenue(venue.id);
    }
  };

  return (
    <div className="admin-venues">
      <div className="venues-header">
        <div>
          <span className="venues-eyebrow">ADMINISTRATION</span>
          <h1>Venue Management</h1>
          <p>Manage campus venues and their availability.</p>
        </div>

        <button className="venue-primary-btn" onClick={openAddModal}>
          <Plus size={18} /> Add Venue
        </button>
      </div>

      <div className="venue-stats">
        <div className="venue-stat-card">
          <div className="venue-stat-icon teal">
            <Building2 size={22} />
          </div>
          <div>
            <span>Total Venues</span>
            <h2>{venues.length}</h2>
          </div>
        </div>

        <div className="venue-stat-card">
          <div className="venue-stat-icon amber">
            <Users size={22} />
          </div>
          <div>
            <span>Total Capacity</span>
            <h2>{totalCapacity.toLocaleString()}</h2>
          </div>
        </div>

        <div className="venue-stat-card">
          <div className="venue-stat-icon mint">
            <MapPin size={22} />
          </div>
          <div>
            <span>Venue Types</span>
            <h2>{new Set(venues.map((v) => v.type)).size}</h2>
          </div>
        </div>
      </div>

      <div className="venue-toolbar">
        <div className="venue-search">
          <Search size={18} />
          <input
            placeholder="Search venue or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Types</option>
          {venueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="venue-grid">
        {filteredVenues.map((venue) => (
          <div className="venue-card" key={venue.id}>
            <div className="venue-card-top">
              <div className="venue-card-icon">
                <Building2 size={24} />
              </div>
              <span className="venue-status">{venue.status || "Available"}</span>
            </div>

            <h3>{venue.name}</h3>
            <span className="venue-type-label">{venue.type}</span>

            <div className="venue-detail">
              <MapPin size={16} />
              <span>{venue.location}</span>
            </div>

            <div className="venue-detail">
              <Users size={16} />
              <span>Capacity: {Number(venue.capacity).toLocaleString()}</span>
            </div>

            <div className="venue-facilities">
              <span>Facilities</span>
              <p>{venue.facilities || "No facilities listed"}</p>
            </div>

            <div className="venue-card-actions">
              <button onClick={() => openEditModal(venue)}>
                <Pencil size={15} /> Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(venue)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="venue-empty">
          <Building2 size={35} />
          <h3>No venues found</h3>
          <p>Try another search or add a new venue.</p>
        </div>
      )}

      {modalOpen && (
        <div className="venue-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="venue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="venue-modal-header">
              <div>
                <h2>{editingId !== null ? "Edit Venue" : "Add New Venue"}</h2>
                <p>Enter the venue details below.</p>
              </div>
              <button
                className="venue-close-btn"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Venue Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Central Auditorium"
              />

              <label>Location / Block *</label>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="e.g. Block A"
              />

              <label>Capacity *</label>
              <input
                required
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                placeholder="Maximum people"
              />

              <label>Venue Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {venueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label>Facilities</label>
              <textarea
                rows="3"
                value={form.facilities}
                onChange={(e) =>
                  setForm({ ...form, facilities: e.target.value })
                }
                placeholder="Projector, AC, sound system..."
              />

              <div className="venue-modal-actions">
                <button
                  type="button"
                  className="venue-secondary-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="venue-primary-btn">
                  {editingId !== null ? "Save Changes" : "Add Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
