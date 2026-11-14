export const coordinators = [
  { id: "coord-001", employeeId: "EMP-001", name: "Sarthak Agarwal", email: "coordinator@campuspulse.demo", department: "Computer Applications", designation: "Event Coordinator", phone: "", status: "Active" },
  { id: "coord-002", employeeId: "EMP-002", name: "Aarav Sharma", email: "coordinator-b@campuspulse.demo", department: "Computer Science", designation: "Faculty Coordinator", phone: "", status: "Active" },
  { id: "coord-003", employeeId: "EMP-003", name: "Diya Verma", email: "coordinator-c@campuspulse.demo", department: "Cultural Affairs", designation: "Program Coordinator", phone: "", status: "Active" },
];

export const sampleStudents = [
  { id: "student-bca-001", role: "student", name: "Aditi Singh", email: "aditi.student@campuspulse.demo", phone: "", enrollment: "BCA24018", rollNo: "BCA24018", course: "BCA", program: "Bachelor of Computer Applications", department: "Computer Applications", academicYear: "2026-27", year: "3rd Year", currentSemester: "5", semester: "Semester 5", section: "A", institution: "KIET Deemed to be University", skills: [], interests: [] },
  { id: "student-btech-001", role: "student", name: "Rohan Gupta", email: "rohan.student@campuspulse.demo", phone: "", enrollment: "BTECH23042", rollNo: "BTECH23042", course: "B.Tech", program: "Bachelor of Technology", department: "Computer Science and Engineering", academicYear: "2026-27", year: "4th Year", currentSemester: "7", semester: "Semester 7", section: "B", institution: "KIET Deemed to be University", skills: [], interests: [] },
  { id: "student-mca-002", role: "student", name: "Meera Khan", email: "meera.student@campuspulse.demo", phone: "", enrollment: "MCA25027", rollNo: "MCA25027", course: "MCA", program: "Master of Computer Applications", department: "Computer Applications", academicYear: "2026-27", year: "2nd Year", currentSemester: "3", semester: "Semester 3", section: "D", institution: "KIET Deemed to be University", skills: [], interests: [] },
];

export const sampleRegistrations = [
  { id: "REG-SEED-001", registrationId: "REG-SEED-001", studentId: "student-bca-001", studentName: "Aditi Singh", rollNumber: "BCA24018", studentEmail: "aditi.student@campuspulse.demo", phone: "", course: "BCA", department: "Computer Applications", academicYear: "2026-27", year: "3rd Year", semester: "5", section: "A", eventId: 1, eventTitle: "InnoTech26 – Tech Hackathon", status: "Confirmed", registeredAt: "2026-11-10T10:00:00.000Z", attendanceStatus: "Not Marked" },
  { id: "REG-SEED-002", registrationId: "REG-SEED-002", studentId: "student-btech-001", studentName: "Rohan Gupta", rollNumber: "BTECH23042", studentEmail: "rohan.student@campuspulse.demo", phone: "", course: "B.Tech", department: "Computer Science and Engineering", academicYear: "2026-27", year: "4th Year", semester: "7", section: "B", eventId: 2, eventTitle: "Echoes – Cultural Night", status: "Confirmed", registeredAt: "2026-11-11T11:00:00.000Z", attendanceStatus: "Not Marked" },
  { id: "REG-SEED-003", registrationId: "REG-SEED-003", studentId: "student-mca-002", studentName: "Meera Khan", rollNumber: "MCA25027", studentEmail: "meera.student@campuspulse.demo", phone: "", course: "MCA", department: "Computer Applications", academicYear: "2026-27", year: "2nd Year", semester: "3", section: "D", eventId: 4, eventTitle: "Campus Athletics & Sports Meet", status: "Confirmed", registeredAt: "2027-01-28T08:00:00.000Z", attendanceStatus: "Present" },
];

export const sampleAttendance = [
  { id: "ATT-REG-SEED-003", registrationId: "REG-SEED-003", studentId: "student-mca-002", eventId: 4, status: "Present", timestamp: "2027-01-30T10:15:00.000Z" },
];

export const sampleCertificates = [
  { id: "CP-2026-SEED-001", studentId: "student-mca-002", studentName: "Meera Khan", rollNo: "MCA25027", eventId: 4, eventTitle: "Campus Athletics & Sports Meet", certificateType: "Participation", issueDate: "2027-01-31T09:00:00.000Z", organization: "CampusPulse Administration", title: "CERTIFICATE OF PARTICIPATION", description: "for participating in this event", certificateEventName: "Campus Athletics & Sports Meet", certificateEventDate: "2027-01-30", signatoryName: "Event Coordinator", signatoryDesignation: "CampusPulse Administration", issuedBy: "coord-003" },
];
