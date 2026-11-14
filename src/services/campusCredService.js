const categoryName = (category) => {
  const value = String(category || "Other").trim();
  const known = { technical: "Technical", cultural: "Cultural", sports: "Sports", workshop: "Workshops", workshops: "Workshops", leadership: "Leadership", social: "Social", arts: "Arts" };
  return known[value.toLowerCase()] || value || "Other";
};

export function getCampusCredData({ user, events = [], attendanceRecords = [], issuedCertificates = [], campusCredAwards = [] }) {
  const attendance = attendanceRecords.filter((record) => record.studentId === user?.id && record.status === "Present");
  const certificates = issuedCertificates.filter((record) => record.studentId === user?.id);
  const awards = campusCredAwards.filter((record) => record.studentId === user?.id && record.awardStatus === "Awarded");
  const eventFor = (id) => events.find((event) => String(event.id) === String(id));
  const pointsByCategory = {};
  awards.forEach((award) => {
    const category = categoryName(award.eventCategorySnapshot);
    pointsByCategory[category] = (pointsByCategory[category] || 0) + Math.max(0, Number(award.pointsAwarded) || 0);
  });
  const points = awards.reduce((total, award) => total + Math.max(0, Number(award.pointsAwarded) || 0), 0);
  return { attendance, certificates, awards, points, pointsByCategory, eventFor, recordId: `CC-${user?.rollNo || user?.id || "STUDENT"}`, generatedAt: new Date() };
}

export function getEventAwardStatus({ registration, event, attendance, award }) {
  if (!registration || registration.status !== "Confirmed" || !event || ["Cancelled", "Archived"].includes(event.status)) return "Not eligible";
  if (award?.awardStatus === "Awarded") return "Points awarded";
  if (event.status === "Completed") return "Not eligible";
  if (Number(event.campusCredPoints) <= 0 || attendance?.status === "Absent") return "Not eligible";
  if (attendance?.status === "Present") return event.status === "Completed" ? "Not eligible" : "Eligible";
  return "Not yet earned";
}

export function getEventAwardTotals({ event, registrations = [], attendanceRecords = [], campusCredAwards = [] }) {
  const eventRegistrations = registrations.filter((record) => String(record.eventId) === String(event.id));
  const confirmed = eventRegistrations.filter((record) => record.status === "Confirmed");
  const presentIds = new Set(attendanceRecords.filter((record) => String(record.eventId) === String(event.id) && record.status === "Present").map((record) => String(record.registrationId)));
  const awards = campusCredAwards.filter((record) => String(record.eventId) === String(event.id) && record.awardStatus === "Awarded");
  return {
    eligibleParticipants: confirmed.filter((record) => presentIds.has(String(record.registrationId))).length,
    awardedParticipants: awards.length,
    totalPointsAwarded: awards.reduce((sum, award) => sum + (Number(award.pointsAwarded) || 0), 0),
  };
}
