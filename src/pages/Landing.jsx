import technicalImg from '../assets/events/technical.jpg';
import culturalImg from '../assets/events/cultural.jpg';
import sportsImg from '../assets/events/sports.jpg';
import artsImg from '../assets/events/arts.jpg';
import workshopImg from '../assets/events/workshops.jpg';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Code2, Music2, Trophy, Palette,
  Users, CalendarDays, QrCode, Award, ChartNoAxesColumn, BookOpen,
  HeartHandshake, Crown, CheckCircle2, Sparkles, Medal, ShieldCheck,
  GraduationCap, Star, Laptop, Drama, ChevronDown, BadgeCheck, BriefcaseBusiness
} from 'lucide-react';

import Navbar from '../components/Navbar';
import './Landing.css';

import heroImage from '../assets/hero.png';

const categories = [
  {
    name: 'Technical',
    desc: 'Hackathons & Workshops',
    icon: Code2,
    color: 'teal',
    image: technicalImg,
  },
  {
    name: 'Cultural',
    desc: 'Fests, Concerts & Open Mic',
    icon: Music2,
    color: 'purple',
    image: culturalImg,
  },
  {
    name: 'Sports',
    desc: 'Tournaments & Leagues',
    icon: Trophy,
    color: 'orange',
    image: sportsImg,
  },
  {
    name: 'Arts',
    desc: 'Exhibitions & Competitions',
    icon: Palette,
    color: 'green',
    image: artsImg,
  },
  {
    name: 'Workshops',
    desc: 'Skill-building Sessions',
    icon: Users,
    color: 'blue',
    image: workshopImg,
  },
];

const features = [
  { icon: CalendarDays, title: 'Discover & Register', text: 'Find campus events and register in a few clicks.' },
  { icon: QrCode, title: 'Hassle-free Attendance', text: 'Quick QR check-ins for registered participants.' },
  { icon: Award, title: 'Build CampusCred', text: 'Collect verified achievements from your campus journey.' },
  { icon: ChartNoAxesColumn, title: 'Manage Events', text: 'Organizers can manage registrations and attendance.' },
];

function Landing() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-image">
            <img src={heroImage} alt="College students enjoying a campus fest" />
          </div>

          <div className="hero-overlay" />

          <div className="hero-content">
            <span className="hero-tag">
              <span className="live-dot" />
              CAMPUS LIFE, CONNECTED
            </span>

            <h1>
              Your Campus.<br />
              Your Events.<br />
              Your <span>Pulse.</span>
            </h1>

            <p>
              A unified platform to discover, participate,
              and get recognized for every campus event.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">
                Get Started <ArrowRight size={18} />
              </Link>

              <a href="#events" className="btn-outline">
                Explore Events
              </a>
            </div>

            <div className="hero-highlights">
              <span><CalendarDays size={17} /> Campus Events</span>
              <span><QrCode size={17} /> QR Attendance</span>
              <span><Award size={17} /> CampusCred</span>
            </div>
          </div>

          <div className="hero-bottom">
            <span>Discover</span>
            <span>Participate</span>
            <span>Achieve</span>
            <span>Get Recognized</span>
          </div>
        </section>

        {/* EVENT CATEGORIES */}
        <section className="section events-section" id="events">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FIND YOUR THING</span>
                <h2>Explore Campus <span>Experiences</span></h2>
                <p>From technical workshops to cultural nights, there is something for everyone.</p>
              </div>
            </div>

            
<div className="category-grid">
  {categories.map(({ name, desc, icon: Icon, color, image }) => (
    <div className={`category-card ${color}`} key={name}>
      
      {/* Category image */}
      <img
        src={image}
        alt={name}
        className="category-image"
      />

      {/* Existing card content */}
      <div className="category-card-content">
        <div className="category-icon">
          <Icon size={27} />
        </div>

        <h3>{name}</h3>
        <p>{desc}</p>

        <ArrowRight className="category-arrow" size={18} />
      </div>

    </div>
  ))}
</div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="section features-section" id="features">
          <div className="container features-layout">
            <div className="features-intro">
              <span className="eyebrow">MORE THAN EVENTS</span>
              <h2>Why <span>CampusPulse?</span></h2>
              <p>
                Campus life is more than classrooms.
                CampusPulse brings events, participation,
                and achievements together in one place.
              </p>

              <Link to="/register" className="text-link">
                Start your campus journey <ArrowRight size={17} />
              </Link>
            </div>

            <div className="features-grid">
              {features.map(({ icon: Icon, title, text }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPUSCRED */}
        <section className="campuscred-section" id="campuscred">
          <div className="container campuscred-hero-grid">
            <div className="campuscred-hero-copy"><span className="eyebrow">YOUR ACHIEVEMENTS, RECORDED</span><h2>Make Every Campus Experience Count.</h2><p>CampusCred organizes event participation, attendance, certificates, and points configured by campus administrators.</p><div className="campuscred-hero-actions"><a href="#campuscred-overview" className="btn-light">Explore CampusCred <ArrowRight size={17}/></a><a href="#campuscred-how" className="campuscred-secondary-link">How It Works</a></div></div>
            <div className="campuscred-credential" aria-label="Illustrative student achievement profile preview"><div className="credential-top"><span><Award size={17}/> CampusCred</span><span className="illustrative-pill">Illustrative preview</span></div><div className="credential-student"><span className="credential-avatar"><GraduationCap size={25}/></span><div><strong>Student Achievement Profile</strong><small>Campus journey at a glance</small></div><ShieldCheck size={19}/></div><div className="credential-metrics"><div><strong>12</strong><small>Activities</small></div><div><strong>4</strong><small>Certificates</small></div><div><strong>6</strong><small>Skills</small></div></div><div className="credential-tags"><span><Medal size={14}/> Participation</span><span><Star size={14}/> Leadership</span></div><div className="credential-note">Sample UI only Â· not actual or verified student data</div></div>
          </div>
        </section>

        <section className="section campuscred-overview-section" id="campuscred-overview"><div className="container"><div className="campuscred-heading"><span className="eyebrow">ONE ORGANIZED DIGITAL RECORD</span><h2>Your Campus Journey. One Verified Profile.</h2><p>CampusCred brings together your campus participation, achievements, and certifications into one organized digital record.</p></div><div className="campuscred-feature-grid"><article><span className="cc-feature-icon"><CalendarDays/></span><h3>Participation Record</h3><p>Track your participation in campus events, workshops, competitions, and activities.</p></article><article><span className="cc-feature-icon"><BadgeCheck/></span><h3>Achievement Records</h3><p>Keep a structured record of achievements and certificates issued through the institution.</p></article><article><span className="cc-feature-icon"><BriefcaseBusiness/></span><h3>Student Portfolio</h3><p>Showcase your involvement, skills, leadership, and campus experiences.</p></article></div></div></section>

        <section className="section campuscred-how-section" id="campuscred-how"><div className="container"><div className="campuscred-heading"><span className="eyebrow">THREE SIMPLE STEPS</span><h2>How CampusCred Works</h2><p>Make the most of the activities already happening across campus.</p></div><div className="campuscred-steps"><article><span>01</span><div><CalendarDays/><h3>Participate</h3><p>Register for campus events, workshops, and activities.</p></div></article><article><span>02</span><div><CheckCircle2/><h3>Get Recognized</h3><p>Attendance, participation, and eligible achievements can be recorded.</p></div></article><article><span>03</span><div><Award/><h3>Build Your CampusCred</h3><p>Organize your recorded campus experiences in a digital achievement profile.</p></div></article></div></div></section>

        <section className="section campuscred-categories-section"><div className="container"><div className="campuscred-heading"><span className="eyebrow">A FULLER VIEW OF CAMPUS LIFE</span><h2>Every Achievement Has a Story.</h2></div><div className="campuscred-category-grid">{[[Laptop,'Technical Activities','Projects, hackathons, and technology competitions.'],[Drama,'Cultural Activities','Performances, fests, music, and creative expression.'],[Trophy,'Sports','Teamwork and participation across campus sports.'],[BookOpen,'Workshops & Learning','Practical sessions and new skills learned.'],[HeartHandshake,'Volunteering','Service, contribution, and community involvement.'],[Crown,'Leadership','Taking initiative and supporting campus teams.']].map(([Icon,title,description])=><article key={title}><Icon/><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

        <section className="section campuscred-preview-section"><div className="container campuscred-preview-grid"><div><span className="eyebrow">YOUR CAMPUS STORY, ORGANIZED</span><h2>A profile that grows with your experience.</h2><p>See participation, attendance, and certificates together. CampusCred points are set for each event and awarded after finalized attendance confirms successful participation.</p><ul><li><CheckCircle2/> Participation and certificate summary</li><li><CheckCircle2/> Achievement timeline</li><li><CheckCircle2/> Certificate access from one place</li><li><CheckCircle2/> Shareable portfolio preview</li></ul><small>Preview uses illustrative sample values. It does not represent a real student or institutional verification.</small></div><div className="campuscred-profile-preview"><div className="preview-profile-head"><span className="preview-avatar"><GraduationCap/></span><div><small>ILLUSTRATIVE PROFILE</small><strong>Campus Achievement Profile</strong></div><ShieldCheck/></div><div className="preview-score"><span>Participation points</span><strong>850 <small>pts</small></strong><div><i/></div></div><div className="preview-stats"><span><b>8</b> events attended</span><span><b>3</b> certificates earned</span></div><h3>Recent activity</h3><div className="preview-activity"><i/><span><b>Workshop participation</b><small>Activity record Â· sample</small></span></div><div className="preview-activity"><i/><span><b>Certificate issued</b><small>Certificate record Â· sample</small></span></div><p className="preview-disclaimer">Illustrative UI only Â· no real student data</p></div></div></section>

        <section className="section campuscred-benefits-section"><div className="container campuscred-benefits-grid"><div><span className="eyebrow">MORE THAN ATTENDANCE</span><h2>Beyond Attendance. A Record of Your Growth.</h2><p>CampusCred helps students keep the meaningful parts of campus life easy to find and reflect on.</p><ul><li><CheckCircle2/> Organized campus achievement history</li><li><CheckCircle2/> Easy access to earned certificates</li><li><CheckCircle2/> Recognition of participation and leadership</li><li><CheckCircle2/> A structured student activity portfolio</li><li><CheckCircle2/> Better visibility into campus engagement</li></ul></div><div className="benefit-art"><Sparkles/><div><Award/><span>Experiences</span></div><div><Medal/><span>Achievements</span></div><div><BookOpen/><span>Learning</span></div></div></div></section>

        <section className="section campuscred-faq-section"><div className="container campuscred-faq"><div className="campuscred-heading"><span className="eyebrow">GOOD TO KNOW</span><h2>CampusCred FAQs</h2></div><details><summary>What is CampusCred?<ChevronDown/></summary><p>CampusCred is the student portalâ€™s organized view of participation, attendance, certificates, and related achievement records.</p></details><details><summary>How are achievements recorded?<ChevronDown/></summary><p>Event coordinators can record attendance and issue eligible certificates. The portal displays those records for the student.</p></details><details><summary>Are certificates automatically issued?<ChevronDown/></summary><p>No. Certificates are issued by an authorized event coordinator after reviewing attendance and event participation.</p></details><details><summary>Can students edit their achievements?<ChevronDown/></summary><p>Students can update their profile information, but event attendance and issued certificate records are managed through the event administration workflow.</p></details><details><summary>What does verified achievement mean?<ChevronDown/></summary><p>A record in this frontend app is locally stored. It should not be treated as institutionally verified unless the institution has confirmed it through its official process.</p></details></div></section>

        <section className="section cta-section" id="about"><div className="container cta-box"><span className="eyebrow">YOUR CAMPUS STORY STARTS HERE</span><h2>Start Building Your <span>Campus Story.</span></h2><p>Participate, learn, achieve, and keep your campus journey organized.</p><div className="campuscred-final-actions"><Link to="/register" className="btn-primary">Get Started <ArrowRight size={17}/></Link><a href="#events" className="campuscred-final-secondary">Explore Events <ArrowRight size={17}/></a></div></div></section>
      </main>

      <footer className="landing-footer">
        <div className="container footer-inner">
          <span className="footer-brand">CampusPulse</span>
          <p>Built for campus life. Made for students.</p>
          <span>Â© 2026 CampusPulse</span>
        </div>
      </footer>
    </>
  );
}

export default Landing;
