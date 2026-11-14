function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function normalizeVenue(name, venues) {
  const normalized = typeof name === "string" ? name.trim().toLocaleLowerCase() : "";
  if (!normalized) return "";
  const known = venues.find((venue) => venue?.name?.trim().toLocaleLowerCase() === normalized);
  return known ? known.name.trim().toLocaleLowerCase() : normalized;
}

export function getEventConflicts(events, venues = []) {
  const conflicts = [];
  const activeEvents = events.filter((event) => !["Cancelled", "Archived"].includes(event.status));

  for (let i = 0; i < activeEvents.length; i += 1) {
    for (let j = i + 1; j < activeEvents.length; j += 1) {
      const eventA = activeEvents[i];
      const eventB = activeEvents[j];
      const startA = parseDate(eventA.date);
      const endA = parseDate(eventA.endDate || eventA.date);
      const startB = parseDate(eventB.date);
      const endB = parseDate(eventB.endDate || eventB.date);
      if (!startA || !endA || !startB || !endB || endA < startA || endB < startB) continue;
      if (startA > endB || startB > endA) continue;

      const venueA = normalizeVenue(eventA.venue, venues);
      const venueB = normalizeVenue(eventB.venue, venues);
      const sameVenue = Boolean(venueA && venueB && venueA === venueB);
      conflicts.push({
        id: `${eventA.id}-${eventB.id}`,
        eventA,
        eventB,
        sameVenue,
        overlapStart: startA > startB ? eventA.date : eventB.date,
        overlapEnd: endA < endB ? (eventA.endDate || eventA.date) : (eventB.endDate || eventB.date),
        severity: sameVenue ? "High" : "Warning",
        type: sameVenue ? "Venue Conflict" : "Schedule Overlap",
      });
    }
  }
  return conflicts;
}
