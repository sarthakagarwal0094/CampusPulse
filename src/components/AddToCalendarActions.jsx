import { useState } from "react";
import { CalendarPlus, Download } from "lucide-react";
import { downloadEventIcs, getGoogleCalendarUrl } from "../utils/calendar";
import "./AddToCalendarActions.css";

export default function AddToCalendarActions({ event, compact = false, iconOnly = false }) {
  const [message, setMessage] = useState("");
  const url = getGoogleCalendarUrl(event || {});
  if (!url) return null;
  return <div className={`calendar-actions${compact ? " compact" : ""}${iconOnly ? " icon-only" : ""}`}>
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => setMessage("Google Calendar opened. Review and save the event there.")} aria-label={`Add ${event.title} to Google Calendar`} title="Add to Google Calendar"><CalendarPlus size={16}/>{!iconOnly && (compact ? "Add to Calendar" : "Add to Google Calendar")}</a>
    <button type="button" onClick={() => { if (downloadEventIcs(event)) setMessage("Calendar file downloaded."); }} aria-label={`Download calendar file for ${event.title}`} title="Download calendar file"><Download size={16}/>{!iconOnly && (compact ? "ICS" : "Download .ics")}</button>
    {message && <span role="status">{message}</span>}
  </div>;
}
