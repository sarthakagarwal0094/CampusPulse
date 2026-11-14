import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useEvents } from "./EventContext";
import { useRegistrations } from "./RegistrationContext";
import { useAuth } from "./AuthContext";
import { useAdminSettings } from "./AdminSettingsContext";
import { readStoredValue, writeStoredValue } from "../services/appDataService";
import { sampleCertificates } from "../data/demoData";

const CertificateContext = createContext(null);
const CERTIFICATES_KEY = "campuspulse_certificates";
const validCertificateList = (value) => Array.isArray(value) && value.every((item) => item && typeof item === "object" && item.id && item.studentId && item.eventId && typeof item.issueDate === "string");

export function CertificateProvider({ children }) {
  const { events } = useEvents();
  const { registrations, attendanceRecords } = useRegistrations();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const [issuedCertificates, setIssuedCertificates] = useState(() => readStoredValue(CERTIFICATES_KEY, sampleCertificates.filter((certificate) => events.some((event) => String(event.id) === String(certificate.eventId))), validCertificateList));
  const certificatesRef = useRef(issuedCertificates);

  useEffect(() => { writeStoredValue(CERTIFICATES_KEY, issuedCertificates); }, [issuedCertificates]);

  const issueCertificates = (students, eventId, certificateText) => {
    const event = events.find((item) => String(item.id) === String(eventId));
    if (!event || event.status === "Archived" || event.status === "Cancelled") return [];
    if (user?.role !== "coordinator" && user?.role !== "admin") return [];
    if (user.role === "coordinator" && event.leadCoordinator !== user.id && !event.coCoordinators?.includes(user.id)) return [];
    const currentCertificates = certificatesRef.current;
    const generated = students.flatMap((student) => {
      const registration = registrations.find((item) => item.studentId === student.id && String(item.eventId) === String(event.id) && item.status === "Confirmed");
      const present = registration && attendanceRecords.some((item) => item.registrationId === registration.registrationId && item.status === "Present");
      const alreadyIssued = currentCertificates.some((item) => item.studentId === student.id && String(item.eventId) === String(event.id));
      if (!present || alreadyIssued) return [];
      const id = `${settings.certificatePrefix || "CP"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [{
        id, studentId: student.id, studentName: student.name, rollNo: student.rollNo || student.id,
        eventId: event.id, eventTitle: event.title, certificateType: "Participation",
        issueDate: new Date().toISOString(), organization: settings.certificateIssuer || settings.institutionName,
        title: certificateText.heading, description: certificateText.description,
        certificateEventName: certificateText.eventName || event.title,
        certificateEventDate: certificateText.eventDate || event.date,
        signatoryName: certificateText.signatoryName, signatoryDesignation: certificateText.signatoryDesignation,
        issuedBy: user.id, demoRecord: true,
      }];
    });
    if (generated.length) {
      const next = [...currentCertificates, ...generated];
      certificatesRef.current = next;
      setIssuedCertificates(next);
    }
    return generated;
  };

  return <CertificateContext.Provider value={{ issuedCertificates, issueCertificates }}>{children}</CertificateContext.Provider>;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCertificates() {
  const context = useContext(CertificateContext);
  if (!context) throw new Error("useCertificates must be used inside CertificateProvider");
  return context;
}
