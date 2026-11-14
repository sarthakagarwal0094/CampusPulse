import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight, Search, SlidersHorizontal, Award } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { categoryClass, normalizeEventCategory } from '../utils/eventCategories';
import './ExploreEvents.css';

const categories = ['All Events', 'Technical', 'Cultural', 'Sports', 'Arts', 'Workshop'];

function ExploreEvents() {
  const { events: allEvents } = useEvents();
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [search, setSearch] = useState('');
  const events = allEvents.filter((event) => event.status !== 'Archived');
  const featuredEvent = events.find((event) => event.status !== 'Cancelled') || events[0];
  const filteredEvents = useMemo(() => events.filter((event) => {
    const category = normalizeEventCategory(event.category);
    const selected = normalizeEventCategory(activeCategory);
    return (activeCategory === 'All Events' || category === selected) &&
      (`${event.title} ${event.venue || ''}`.toLowerCase().includes(search.toLowerCase()));
  }), [events, activeCategory, search]);

  return (
    <div className="student-dashboard explore-page">
      <main className="student-main">
        <header className="student-topbar">
          <h1>Explore Events</h1>
        </header>
        <div className="explore-content">
          <div className="explore-heading"><div>
            <span className="explore-eyebrow">YOUR CAMPUS, YOUR EXPERIENCES</span>
            <h2>Find your next <span>experience.</span></h2>
            <p>Discover workshops, fests, competitions and more.</p>
          </div></div>

          {featuredEvent && <section className="explore-featured">
            <img src={featuredEvent.image} alt={featuredEvent.title} />
            <div className="featured-overlay">
              <span className="featured-tag">FEATURED EVENT</span>
              <h2>{featuredEvent.title}</h2>
              <p>{featuredEvent.description}</p>
              <div className="featured-meta">
                <span><CalendarDays size={16} /> {featuredEvent.date}{featuredEvent.endDate && featuredEvent.endDate !== featuredEvent.date ? ` – ${featuredEvent.endDate}` : ''}</span>
                <span><MapPin size={16} /> {featuredEvent.venue}</span>
              </div>
              <Link to={`/student/events/${featuredEvent.id}`} className="featured-button">Explore Event <ArrowRight size={18} /></Link>
            </div>
          </section>}

          <div className="explore-search-row">
            <div className="explore-search"><Search size={20} /><input type="search" placeholder="Search events by name or venue..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <span className="explore-filter-button"><SlidersHorizontal size={18} /> Filter by category</span>
          </div>

          <div className="explore-categories">
            {categories.map((category) => <button key={category} className={`category-filter ${activeCategory === category ? 'selected' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>

          <div className="explore-results-heading"><h2>{activeCategory === 'All Events' ? 'All Events' : activeCategory}</h2><span>{filteredEvents.length} events found</span></div>
          <div className="explore-event-grid">
            {filteredEvents.map((event) => <article className="explore-event-card" key={event.id}>
              <div className="explore-event-image">
                {event.image && <img src={event.image} alt={event.title} />}
                <span className={`explore-event-tag category-badge ${categoryClass(event.category)}`}>{event.category || 'Other'}</span>
                {event.status === 'Cancelled' && <span className="explore-event-tag cancelled">Cancelled</span>}
              </div>
              <div className="explore-event-body">
                <h3>{event.title}</h3><p className="explore-event-description">{event.description}</p>
                {Number(event.campusCredPoints) > 0 && <span className="explore-campuscred-points"><Award size={15}/> Earn {Number(event.campusCredPoints)} CampusCred points</span>}
                <div className="explore-event-meta"><span><CalendarDays size={15} /> {event.date}{event.endDate && event.endDate !== event.date ? ` – ${event.endDate}` : ''}</span><span><MapPin size={15} /> {event.venue}</span></div>
                <Link to={`/student/events/${event.id}`} className="explore-event-button">View Details <ArrowRight size={17} /></Link>
              </div>
            </article>)}
          </div>
          {filteredEvents.length === 0 && <div className="explore-empty"><Search size={35} /><h3>No events found</h3><p>Try another search or category.</p></div>}
        </div>
      </main>
    </div>
  );
}

export default ExploreEvents;
