const TIME_ZONE = "Asia/Kolkata";

function timeParts(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (match[3]) {
    const meridiem = match[3].toUpperCase();
    hour = hour % 12 + (meridiem === "PM" ? 12 : 0);
  }
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

function dateTime(date, value, fallback) {
  const parsed = timeParts(value) || fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || !parsed) return null;
  return `${date.replaceAll("-", "") }T${String(parsed.hour).padStart(2, "0")}${String(parsed.minute).padStart(2, "0")}00`;
}

function eventTimes(event) {
  const start = dateTime(event.date, event.startTime || event.time, { hour: 9, minute: 0 });
  const end = dateTime(event.endDate || event.date, event.endTime, { hour: 10, minute: 0 });
  return start && end ? `${start}/${end}` : null;
}

export function getGoogleCalendarUrl(event) {
  const dates = eventTimes(event);
  if (!dates) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "Campus event",
    dates,
    details: event.description || "",
    location: event.venue || "",
    ctz: event.timeZone || TIME_ZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapeIcs = (value = "") => String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function downloadEventIcs(event) {
  const dates = eventTimes(event);
  if (!dates || typeof document === "undefined") return false;
  const [start, end] = dates.split("/");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CampusPulse//Events//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:campuspulse-${event.id}@campuspulse`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;TZID=${TIME_ZONE}:${start}`, `DTEND;TZID=${TIME_ZONE}:${end}`, `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`, `LOCATION:${escapeIcs(event.venue)}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${String(event.title || "campus-event").replace(/[^\w-]+/g, "-")}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
