import StudentDashboard from './pages/StudentDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CertificateProvider } from "./context/CertificateContext";
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ExploreEvents from './pages/ExploreEvents';
import MyRegistrations from './pages/MyRegistrations';
import MyAttendance from './pages/MyAttendance';
import CampusCred from './pages/CampusCred';
import Certificates from './pages/Certificates';
import StudentProfile from './pages/StudentProfile';
import EventDetails from './pages/EventDetails';
import { RegistrationProvider } from './context/RegistrationContext';
import AchievementCard from './pages/AchievementCard';
import CertificateVerification from './pages/CertificateVerification';
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import { EventProvider } from "./context/EventContext";
import CoordinatorEvents from "./pages/CoordinatorEvents";
import CoordinatorTeams from "./pages/CoordinatorTeams";
import CoordinatorRegistrations from "./pages/CoordinatorRegistrations";
import CoordinatorAttendance from "./pages/CoordinatorAttendance";
import CoordinatorCertificates from "./pages/CoordinatorCertificates";
import CoordinatorAnalytics from "./pages/CoordinatorAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminCoordinators from "./pages/AdminCoordinators";
import { VenueProvider } from "./context/VenueContext";
import AdminVenues from "./pages/AdminVenues";
import AdminEventClashes from "./pages/AdminEventClashes";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import { AdminLayout, CoordinatorLayout, StudentLayout } from "./layouts/PortalLayouts";
import { AuthProvider, RequireRole } from "./context/AuthContext";
import { AdminSettingsProvider } from "./context/AdminSettingsContext";
import { CoordinatorProfileProvider } from "./context/CoordinatorProfileContext";

function App() {
  return (
    <BrowserRouter>
  <AuthProvider>
  <CoordinatorProfileProvider>
  <AdminSettingsProvider>
  <EventProvider>
    <VenueProvider>
    <RegistrationProvider>
      <CertificateProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:certificateId" element={<CertificateVerification />} />
        <Route path="/student" element={<RequireRole role="student"><StudentLayout /></RequireRole>}>
          <Route index element={<StudentDashboard />} />
          <Route path="events" element={<ExploreEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="registrations" element={<MyRegistrations />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="campuscred" element={<CampusCred />} />
          <Route path="campuscred/share" element={<AchievementCard />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
        <Route path="/coordinator" element={<RequireRole role="coordinator"><CoordinatorLayout /></RequireRole>}>
          <Route index element={<CoordinatorDashboard />} />
          <Route path="events" element={<CoordinatorEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="teams" element={<CoordinatorTeams />} />
          <Route path="registrations" element={<CoordinatorRegistrations />} />
          <Route path="attendance" element={<CoordinatorAttendance />} />
          <Route path="certificates" element={<CoordinatorCertificates />} />
          <Route path="analytics" element={<CoordinatorAnalytics />} />
        </Route>
        <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="coordinators" element={<AdminCoordinators />} />
          <Route path="venues" element={<AdminVenues />} />
          <Route path="clashes" element={<AdminEventClashes />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<div className="route-not-found"><h1>Page not found</h1><p>The page you requested does not exist.</p><a href="/">Return home</a></div>} />
      </Routes>
      </CertificateProvider>
    </RegistrationProvider>
    </VenueProvider>
  </EventProvider>
  </AdminSettingsProvider>
  </CoordinatorProfileProvider>
  </AuthProvider>
</BrowserRouter>
  );
}

export default App;
