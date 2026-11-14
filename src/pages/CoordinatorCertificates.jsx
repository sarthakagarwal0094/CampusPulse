
import { useState } from "react";
import { Award, Users, CheckCircle, FileText } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useRegistrations } from "../context/RegistrationContext";
import { useAdminSettings } from "../context/AdminSettingsContext";
import { useCertificates } from "../context/CertificateContext";
import { jsPDF } from "jspdf";
import "./CoordinatorCertificates.css";

export default function CoordinatorCertificates() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { registrations, attendanceRecords } = useRegistrations();
  const { settings } = useAdminSettings();
  const { issuedCertificates, issueCertificates } = useCertificates();

  const assignedEvents = events.filter(
    (event) =>
      !["Cancelled", "Archived"].includes(event.status) && (event.leadCoordinator === user?.id ||
      event.coCoordinators?.includes(user?.id))
  );

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [certificateText, setCertificateText] = useState({
    heading: "CERTIFICATE OF PARTICIPATION",
    description: "for participating in this event",
    eventName: "",
    eventDate: "",
    signatoryName: "Event Coordinator",
    signatoryDesignation: settings.certificateIssuer,
  });

  const event = assignedEvents.find(
    (item) => String(item.id) === String(selectedEvent)
  );

  const eligibleStudents = registrations.filter((registration) =>
    String(registration.eventId) === String(selectedEvent) && registration.status === "Confirmed" &&
    attendanceRecords.some((record) => record.registrationId === registration.registrationId && record.status === "Present") &&
    !issuedCertificates.some((certificate) => certificate.studentId === registration.studentId && String(certificate.eventId) === String(selectedEvent))
  ).map((registration) => ({ id: registration.studentId, name: registration.studentName, rollNo: registration.rollNumber || registration.studentId }));

  const updateText = (field, value) => {
    setCertificateText((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((previous) =>
      previous.includes(studentId)
        ? previous.filter((id) => id !== studentId)
        : [...previous, studentId]
    );
  };

  const selectAll = () => {
    setSelectedStudents(
      selectedStudents.length === eligibleStudents.length
        ? []
        : eligibleStudents.map((student) => student.id)
    );
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setSelectedStudents([]);

    const selected = assignedEvents.find(
      (item) => String(item.id) === String(eventId)
    );

    setCertificateText((previous) => ({
      ...previous,
      eventName: selected?.title || "",
      eventDate: selected?.date || "",
    }));
  };

  const handleIssue = () => {
    if (!event || selectedStudents.length === 0) {
      alert("Please select an event and students.");
      return;
    }

    const students = eligibleStudents.filter((student) =>
      selectedStudents.includes(student.id)
    );

    const generated = issueCertificates(
      students,
      event.id,
      certificateText
    );

    alert(generated.length ? `${generated.length} certificates issued successfully!` : "No eligible certificates could be issued. Check attendance and duplicate certificates.");
    setSelectedStudents([]);
  };

  const downloadCertificate = (certificate) => {
    const pdf = new jsPDF("landscape", "mm", "a4");

    pdf.setDrawColor(15, 118, 110);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, 277, 190);

    pdf.setTextColor(15, 118, 110);
    pdf.setFontSize(25);
    pdf.text(certificate.title, 148.5, 45, {
      align: "center",
    });

    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(16);
    pdf.text("This certificate is proudly presented to", 148.5, 75, {
      align: "center",
    });

    pdf.setFontSize(30);
    pdf.text(certificate.studentName, 148.5, 100, {
      align: "center",
    });

    pdf.setFontSize(16);
    pdf.text(certificate.description, 148.5, 120, {
      align: "center",
    });

    pdf.setFontSize(20);
    pdf.text(certificate.certificateEventName, 148.5, 140, {
      align: "center",
    });

    pdf.setFontSize(13);
    pdf.text(`Date: ${certificate.certificateEventDate}`, 148.5, 155, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.text(certificate.signatoryName, 148.5, 175, {
      align: "center",
    });
    pdf.text(certificate.signatoryDesignation, 148.5, 182, {
      align: "center",
    });

    pdf.setFontSize(9);
    pdf.text(`Certificate ID: ${certificate.id}`, 148.5, 192, {
      align: "center",
    });

    pdf.save(`${certificate.studentName}-certificate.pdf`);
  };

  return (
    <div className="coordinator-certificates">
      <div className="cert-page-header">
        <div>
          <h1>Certificates</h1>
          <p>Generate and issue certificates to event participants.</p>
        </div>
        <div className="cert-header-icon">
          <Award size={28} />
        </div>
      </div>

      <div className="cert-stats">
        <div className="cert-stat-card">
          <FileText />
          <div>
            <h3>{issuedCertificates.length}</h3>
            <p>Certificates Issued</p>
          </div>
        </div>

        <div className="cert-stat-card">
          <Users />
          <div>
            <h3>{eligibleStudents.length}</h3>
            <p>Eligible Students</p>
          </div>
        </div>

        <div className="cert-stat-card">
          <CheckCircle />
          <div>
            <h3>{selectedStudents.length}</h3>
            <p>Selected Students</p>
          </div>
        </div>
      </div>

      <section className="cert-section">
        <h2>1. Select Event</h2>

        <select
          value={selectedEvent}
          onChange={(e) => handleEventChange(e.target.value)}
        >
          <option value="">Choose an event</option>
          {assignedEvents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </section>

      {event && (
        <>
          <section className="cert-section">
            <div className="cert-section-title">
              <h2>2. Eligible Students</h2>
              <button onClick={selectAll}>
                {selectedStudents.length === eligibleStudents.length
                  ? "Deselect All"
                  : "Select All Present"}
              </button>
            </div>

            <p className="cert-help">
              Only students marked Present are eligible.
            </p>

            {eligibleStudents.map((student) => (
              <label className="cert-student-row" key={student.id}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
                <div>
                  <strong>{student.name}</strong>
                  <span>{student.rollNo}</span>
                </div>
                <span className="cert-present">Present</span>
              </label>
            ))}

            {eligibleStudents.length === 0 && (
              <p>No eligible students found.</p>
            )}
          </section>

          <section className="cert-section">
            <h2>3. Edit Certificate Text</h2>
            <p className="cert-help">
              Customize the wording and event details before issuing.
            </p>

            <label>Certificate Heading</label>
            <input
              value={certificateText.heading}
              onChange={(e) => updateText("heading", e.target.value)}
            />

            <label>Certificate Description</label>
            <textarea
              rows="3"
              value={certificateText.description}
              onChange={(e) => updateText("description", e.target.value)}
            />

            <label>Event Name on Certificate</label>
            <input
              value={certificateText.eventName}
              onChange={(e) => updateText("eventName", e.target.value)}
            />

            <label>Event Date on Certificate</label>
            <input
              value={certificateText.eventDate}
              onChange={(e) => updateText("eventDate", e.target.value)}
            />

            <label>Signatory Name</label>
            <input
              value={certificateText.signatoryName}
              onChange={(e) => updateText("signatoryName", e.target.value)}
            />

            <label>Signatory Designation</label>
            <input
              value={certificateText.signatoryDesignation}
              onChange={(e) =>
                updateText("signatoryDesignation", e.target.value)
              }
            />
          </section>

          <button
            className="cert-issue-button"
            disabled={selectedStudents.length === 0}
            onClick={handleIssue}
          >
            <Award size={18} />
            Issue {selectedStudents.length} Certificates
          </button>
        </>
      )}

      <section className="cert-section">
        <h2>4. Issued Certificates</h2>

        {issuedCertificates.length === 0 ? (
          <p>No certificates issued yet.</p>
        ) : (
          issuedCertificates.map((certificate) => (
            <div className="issued-cert-row" key={certificate.id}>
              <div>
                <strong>{certificate.studentName}</strong>
                <p>{certificate.eventTitle}</p>
                <small>{certificate.id}</small>
              </div>
              <button onClick={() => downloadCertificate(certificate)}>
                Download PDF
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
