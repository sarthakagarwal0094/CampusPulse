import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { categoryClass } from "../utils/eventCategories";
import "./UpcomingEventsCalendar.css";

const todayInKolkata = () => new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Kolkata", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());

export default function UpcomingEventsCalendar() {
  const { events } = useEvents();
  const today = todayInKolkata();
  const [month, setMonth] = useState(() => { const [y,m] = today.split("-").map(Number); return new Date(y, m - 1, 1); });
  const [selected, setSelected] = useState(today);
  const liveEvents = events.filter((event) => event.status !== "Archived" && event.status !== "Cancelled");
  const monthEvents = liveEvents.filter((event) => event.date?.slice(0, 7) === `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}`);
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({length:count},(_,i)=>i+1)];
  }, [month]);
  const selectedEvents = liveEvents.filter((event) => event.date === selected).sort((a,b)=>(a.startTime||a.time||"").localeCompare(b.startTime||b.time||""));
  const changeMonth = (delta) => setMonth((current) => new Date(current.getFullYear(), current.getMonth()+delta, 1));
  return <section className="student-panel events-calendar-panel">
    <div className="student-panel-heading"><div><h2>Upcoming Events Calendar</h2><p>Explore campus events by date</p></div><CalendarDays size={21}/></div>
    <div className="events-calendar-toolbar"><button type="button" onClick={()=>changeMonth(-1)} aria-label="Previous month"><ChevronLeft/></button><h3>{month.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</h3><button type="button" onClick={()=>changeMonth(1)} aria-label="Next month"><ChevronRight/></button></div>
    <div className="events-calendar-grid" role="grid" aria-label="Monthly events calendar">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span className="calendar-weekday" key={day}>{day}</span>)}
      {days.map((day,index)=>{ if(!day) return <span className="calendar-empty" key={`blank-${index}`}/>; const date=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const onDate=monthEvents.filter((event)=>event.date===date); return <button type="button" key={date} className={`calendar-date${date===today?' today':''}${date===selected?' selected':''}${onDate.length?' has-events':''}`} onClick={()=>setSelected(date)} aria-label={`${date}${onDate.length?`: ${onDate.map(e=>e.title).join(', ')}`:''}`} title={onDate.map(e=>e.title).join(', ')}><span>{day}</span>{onDate.length>0&&<i className="calendar-event-dots">{onDate.slice(0,3).map((event)=><b className={categoryClass(event.category)} key={event.id}/>)}</i>}</button>; })}
    </div>
    <div className="calendar-legend">{[['Technical','Technical'],['Cultural','Cultural'],['Sports','Sports'],['Arts','Arts'],['Workshop','Workshop']].map(([label,category])=><span key={category}><i className={categoryClass(category)}/>{label}</span>)}</div>
    <div className="calendar-selected-events"><h3>{new Date(`${selected}T12:00:00`).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</h3>{selectedEvents.length ? selectedEvents.map(event=><Link to={`/student/events/${event.id}`} className="calendar-event-link" key={event.id}><i className={categoryClass(event.category)}/><span><strong>{event.title}</strong><small>{event.startTime || event.time || "Time to be announced"} · {event.venue || "Venue to be announced"}</small></span><ChevronRight size={16}/></Link>) : <p>No events scheduled for this date.</p>}</div>
  </section>;
}
