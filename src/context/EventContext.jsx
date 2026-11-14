
import { createContext, useContext, useEffect, useState } from "react";
import { readStoredValue, writeStoredValue } from "../services/appDataService";
import { useCoordinatorProfiles } from "./CoordinatorProfileContext";
import { sampleEvents } from "../data/sampleEvents";
const EventContext = createContext(null);

const initialEvents = sampleEvents.map((event) => ({
  ...event,
  campusCredPoints: Number.isInteger(Number(event.campusCredPoints)) && Number(event.campusCredPoints) >= 0 ? Number(event.campusCredPoints) : 0,
  achievementCategory: event.achievementCategory || event.category || "Other",
  achievementDescription: event.achievementDescription || "",
}));

const EVENTS_STORAGE_KEY = "campuspulse_events";
const validEvents = (value) => Array.isArray(value) && value.every((event) =>
  event && (typeof event.id === "number" || typeof event.id === "string") &&
  typeof event.title === "string" && typeof event.date === "string"
);

export function EventProvider({ children }) {
  const { coordinatorProfiles: coordinators } = useCoordinatorProfiles();
  const [events, setEvents] = useState(() => {
    const saved = readStoredValue(EVENTS_STORAGE_KEY, null, validEvents);
    if (!saved) return initialEvents;
    const knownIds = new Set(saved.map((event) => String(event.id)));
    const knownKeys = new Set(saved.map((event) => event.seedKey).filter(Boolean));
    const migrated = saved.map((event) => ({
      ...event,
      campusCredPoints: Number.isInteger(Number(event.campusCredPoints)) && Number(event.campusCredPoints) >= 0 ? Number(event.campusCredPoints) : 0,
      achievementCategory: event.achievementCategory || event.category || "Other",
      achievementDescription: event.achievementDescription || "",
    }));
    return [...migrated, ...initialEvents.filter((event) =>
      !knownIds.has(String(event.id)) && !knownKeys.has(event.seedKey) &&
      !saved.some((stored) => stored.title.trim().toLowerCase() === event.title.trim().toLowerCase() && stored.date === event.date)
    )];
  });

  useEffect(() => {
    writeStoredValue(EVENTS_STORAGE_KEY, events);
  }, [events]);

  const createEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      campusCredPoints: Math.max(0, Math.floor(Number(eventData.campusCredPoints) || 0)),
      achievementCategory: eventData.achievementCategory || eventData.category || "Other",
      achievementDescription: eventData.achievementDescription || "",
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "Upcoming",
      leadCoordinator: eventData.leadCoordinator,
      coCoordinators: eventData.coCoordinators || [],
    };

    setEvents((previous) => [...previous, newEvent]);
    return newEvent;
  };

  const updateEvent = (eventId, updatedData) => {
    setEvents((previous) =>
      previous.map((event) =>
        String(event.id) === String(eventId)
          ? { ...event, ...updatedData, campusCredPoints: Math.max(0, Math.floor(Number(updatedData.campusCredPoints ?? event.campusCredPoints) || 0)), achievementCategory: updatedData.achievementCategory || updatedData.category || event.category || "Other", achievementDescription: updatedData.achievementDescription ?? event.achievementDescription ?? "" }
          : event
      )
    );
  };

  const cancelEvent = (eventId) => {
    updateEvent(eventId, { status: "Cancelled" });
  };

  const deleteEvent = (eventId) => {
    updateEvent(eventId, { status: "Archived" });
  };

  const assignCoordinators = (eventId, leadCoordinator, coCoordinators) => {
    updateEvent(eventId, {
      leadCoordinator,
      coCoordinators: coCoordinators.filter(
        (id) => id !== leadCoordinator
      ),
    });
  };

  return (
    <EventContext.Provider
      value={{
        events,
        coordinators,
        createEvent,
        updateEvent,
        cancelEvent,
        deleteEvent,
        assignCoordinators,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEvents() {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEvents must be used inside EventProvider");
  }

  return context;
}
