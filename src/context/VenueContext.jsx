
import { createContext, useContext, useEffect, useState } from "react";
import { readStoredValue, writeStoredValue } from "../services/appDataService";

const VenueContext = createContext();
const VENUES_STORAGE_KEY = "campuspulse_venues";
const isVenueList = (value) => Array.isArray(value) && value.every((venue) => venue && typeof venue.name === "string");

const initialVenues = [
  {
    id: 1,
    name: "Main Auditorium",
    location: "Block A",
    capacity: 500,
    type: "Auditorium",
    facilities: "Projector, Sound System, AC",
    status: "Available",
  },
  {
    id: 2,
    name: "KIET Auditorium",
    location: "Block B",
    capacity: 300,
    type: "Auditorium",
    facilities: "Projector, Sound System",
    status: "Available",
  },
  {
    id: 3,
    name: "Seminar Hall",
    location: "Block C",
    capacity: 100,
    type: "Seminar Hall",
    facilities: "Projector, AC",
    status: "Available",
  },
  {
    id: 4,
    name: "Sports Ground",
    location: "Sports Complex",
    capacity: 1000,
    type: "Outdoor",
    facilities: "Lighting, Seating",
    status: "Available",
  },
];

export function VenueProvider({ children }) {
  const [venues, setVenues] = useState(() => readStoredValue(VENUES_STORAGE_KEY, initialVenues, isVenueList));

  useEffect(() => { writeStoredValue(VENUES_STORAGE_KEY, venues); }, [venues]);

  const addVenue = (venue) => {
    setVenues((prev) => [
      ...prev,
      { ...venue, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, status: "Available" },
    ]);
  };

  const updateVenue = (id, updatedVenue) => {
    setVenues((prev) =>
      prev.map((venue) =>
        String(venue.id) === String(id) ? { ...venue, ...updatedVenue } : venue
      )
    );
  };

  const deleteVenue = (id) => {
    setVenues((prev) => prev.filter((venue) => String(venue.id) !== String(id)));
  };

  return (
    <VenueContext.Provider
      value={{ venues, addVenue, updateVenue, deleteVenue }}
    >
      {children}
    </VenueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVenues = () => useContext(VenueContext);
