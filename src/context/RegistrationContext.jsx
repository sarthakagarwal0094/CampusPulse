import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAdminSettings } from "./AdminSettingsContext";
import { useEvents } from "./EventContext";
import { readStoredValue, writeStoredValue } from "../services/appDataService";
import { sampleRegistrations, sampleAttendance } from "../data/demoData";

const RegistrationContext = createContext(null);
const REGISTRATIONS_KEY = "campuspulse_registrations";
const ATTENDANCE_KEY = "campuspulse_attendance";
const CAMPUSCRED_AWARDS_KEY = "campuspulse_campuscred_awards";
const validRecords = (value) => Array.isArray(value) && value.every((record) => record && typeof record === "object" && (typeof record.id === "string" || typeof record.id === "number") && (typeof record.eventId === "string" || typeof record.eventId === "number"));
const validAwards = (value) => Array.isArray(value) && value.every((record) => record && typeof record === "object" && typeof record.awardId === "string" && (typeof record.eventId === "string" || typeof record.eventId === "number") && (typeof record.studentId === "string" || typeof record.studentId === "number") && Number.isFinite(Number(record.pointsAwarded)));
const toId = (value) => String(value);

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function RegistrationProvider({ children }) {
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const { events, updateEvent } = useEvents();
  const sampleEventsExist = (eventId) => events.some((event) => toId(event.id) === toId(eventId));
  const seededRegistrations = sampleRegistrations.filter((record) => sampleEventsExist(record.eventId));
  const seededRegistrationIds = new Set(seededRegistrations.map((record) => record.registrationId));
  const seededAttendance = sampleAttendance.filter((record) => seededRegistrationIds.has(record.registrationId));
  const [registrations, setRegistrations] = useState(() => readStoredValue(REGISTRATIONS_KEY, seededRegistrations, validRecords));
  const [attendanceRecords, setAttendanceRecords] = useState(() => readStoredValue(ATTENDANCE_KEY, seededAttendance, validRecords));
  const [campusCredAwards, setCampusCredAwards] = useState(() => readStoredValue(CAMPUSCRED_AWARDS_KEY, [], validAwards));
  const registrationsRef = useRef(registrations);
  const attendanceRef = useRef(attendanceRecords);
  const awardsRef = useRef(campusCredAwards);

  const replaceRegistrations = (next) => { registrationsRef.current = next; setRegistrations(next); };
  const replaceAttendance = (next) => { attendanceRef.current = next; setAttendanceRecords(next); };
  const replaceAwards = (next) => { awardsRef.current = next; setCampusCredAwards(next); };

  useEffect(() => { writeStoredValue(REGISTRATIONS_KEY, registrations); }, [registrations]);
  useEffect(() => { writeStoredValue(ATTENDANCE_KEY, attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { writeStoredValue(CAMPUSCRED_AWARDS_KEY, campusCredAwards); }, [campusCredAwards]);

  const registerEvent = (eventId) => {
    if (user?.role !== "student") return { ok: false, message: "Sign in with a student account to register." };
    if (!settings.registrationEnabled) return { ok: false, message: "Event registration is currently disabled." };
    const event = events.find((item) => toId(item.id) === toId(eventId));
    if (!event || ["Archived", "Completed"].includes(event.status)) return { ok: false, message: "This event is no longer available." };
    if (event.status === "Cancelled") return { ok: false, message: "Registration is unavailable for cancelled events." };
    if (!event.date || event.date < todayISO()) return { ok: false, message: "Registration is unavailable for past events." };
    if (event.registrationDeadline && event.registrationDeadline < todayISO()) return { ok: false, message: "The registration deadline for this event has passed." };

    const currentRegistrations = registrationsRef.current;
    const activeForEvent = currentRegistrations.filter((record) =>
      toId(record.eventId) === toId(event.id) && record.status === "Confirmed"
    );
    if (activeForEvent.some((record) => record.studentId === user.id)) return { ok: false, message: "You are already registered for this event." };
    if (Number.isFinite(Number(event.capacity)) && activeForEvent.length >= Number(event.capacity)) return { ok: false, message: "This event has reached capacity." };
    const activeForStudent = currentRegistrations.filter((record) => record.studentId === user.id && record.status === "Confirmed");
    if (activeForStudent.length >= Number(settings.maxEventsPerStudent)) return { ok: false, message: "You have reached the maximum number of event registrations." };

    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record = {
      id: registrationId,
      registrationId,
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.rollNo || user.enrollment || user.id,
      studentRollNumber: user.rollNo || user.enrollment || user.id,
      studentEmail: user.email,
      email: user.email,
      phone: user.phone || "",
      course: user.course || (user.program === "Not verified" ? "" : user.program || ""),
      department: user.department || "",
      academicYear: user.academicYear || "",
      year: user.year || "",
      semester: user.currentSemester || user.semester || "",
      section: user.section || "",
      eventId: event.id,
      eventTitle: event.title,
      eventSnapshot: { ...event },
      status: "Confirmed",
      registeredAt: new Date().toISOString(),
      attendanceStatus: "Not Marked",
    };
    replaceRegistrations([...currentRegistrations, record]);
    return { ok: true, registration: record };
  };

  const cancelRegistration = (registrationId) => {
    if (user?.role !== "student" || !settings.allowCancellation) return false;
    const currentRegistrations = registrationsRef.current;
    const record = currentRegistrations.find((item) => item.registrationId === registrationId || item.id === registrationId);
    if (!record || record.studentId !== user.id || record.status !== "Confirmed") return false;
    const event = events.find((item) => toId(item.id) === toId(record.eventId));
    if (!event || event.status === "Completed" || awardsRef.current.some((award) => award.studentId === record.studentId && toId(award.eventId) === toId(record.eventId))) return false;
    replaceRegistrations(currentRegistrations.map((item) =>
      item.registrationId === record.registrationId ? { ...item, status: "Cancelled", cancelledAt: new Date().toISOString() } : item
    ));
    return true;
  };

  const markAttendance = (registrationId, status) => {
    if (!["Present", "Absent"].includes(status)) return false;
    const registration = registrationsRef.current.find((item) => item.registrationId === registrationId && item.status === "Confirmed");
    if (!registration) return false;
    const event = events.find((item) => toId(item.id) === toId(registration.eventId));
    if (!event || ["Archived", "Cancelled", "Completed"].includes(event.status)) return false;
    if (user?.role === "coordinator" && event.leadCoordinator !== user.id && !event.coCoordinators?.includes(user.id)) return false;
    if (user?.role !== "coordinator" && user?.role !== "admin") return false;
    const previousAttendance = attendanceRef.current;
    const existing = previousAttendance.find((item) => item.registrationId === registrationId);
    const updated = { id: existing?.id || `ATT-${registrationId}`, studentId: registration.studentId, eventId: registration.eventId, registrationId, status, timestamp: new Date().toISOString() };
    replaceAttendance(existing ? previousAttendance.map((item) => item.registrationId === registrationId ? updated : item) : [...previousAttendance, updated]);
    replaceRegistrations(registrationsRef.current.map((item) => item.registrationId === registrationId ? { ...item, attendanceStatus: status } : item));
    return true;
  };

  const finalizeEventAttendance = (eventId) => {
    const event = events.find((item) => toId(item.id) === toId(eventId));
    if (!event || ["Archived", "Cancelled"].includes(event.status)) return { ok: false, message: "This event cannot be finalized." };
    if (user?.role === "coordinator" && event.leadCoordinator !== user.id && !event.coCoordinators?.includes(user.id)) return { ok: false, message: "You are not assigned to this event." };
    if (user?.role !== "coordinator" && user?.role !== "admin") return { ok: false, message: "Only an assigned coordinator or admin can finalize attendance." };
    if (event.status === "Completed") return { ok: true, awardsCreated: 0, alreadyFinalized: true };

    const registrationsForEvent = registrationsRef.current.filter((record) => toId(record.eventId) === toId(event.id) && record.status === "Confirmed");
    const attendanceByRegistration = new Map(attendanceRef.current.map((record) => [String(record.registrationId), record]));
    if (registrationsForEvent.some((record) => !attendanceByRegistration.has(String(record.registrationId)))) return { ok: false, message: "Mark every confirmed registration Present or Absent before finalizing attendance." };
    const existingKeys = new Set(awardsRef.current.map((award) => `${award.studentId}:${toId(award.eventId)}`));
    const points = Math.max(0, Math.floor(Number(event.campusCredPoints) || 0));
    const now = new Date().toISOString();
    const newAwards = points > 0 ? registrationsForEvent.flatMap((registration) => {
      const attendance = attendanceByRegistration.get(String(registration.registrationId));
      const uniqueKey = `${registration.studentId}:${toId(event.id)}`;
      if (!attendance || attendance.status !== "Present" || !registration.studentId || existingKeys.has(uniqueKey)) return [];
      existingKeys.add(uniqueKey);
      return [{
        awardId: `CCA-${encodeURIComponent(registration.studentId)}-${encodeURIComponent(event.id)}`,
        studentId: registration.studentId,
        eventId: event.id,
        eventNameSnapshot: event.title,
        eventCategorySnapshot: event.achievementCategory || event.category || "Other",
        achievementDescription: event.achievementDescription || "",
        pointsAwarded: points,
        attendanceRecordId: attendance.id,
        awardedAt: now,
        awardStatus: "Awarded",
      }];
    }) : [];

    replaceAwards([...awardsRef.current, ...newAwards]);
    updateEvent(event.id, { status: "Completed", attendanceFinalizedAt: now });
    return { ok: true, awardsCreated: newAwards.length, eligibleParticipants: registrationsForEvent.filter((record) => attendanceByRegistration.get(String(record.registrationId))?.status === "Present").length };
  };

  return <RegistrationContext.Provider value={{ registrations, attendanceRecords, campusCredAwards, registerEvent, cancelRegistration, markAttendance, finalizeEventAttendance }}>{children}</RegistrationContext.Provider>;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useRegistrations() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error("useRegistrations must be used inside RegistrationProvider");
  return context;
}
