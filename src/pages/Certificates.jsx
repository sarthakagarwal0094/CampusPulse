
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  Award,
  Download,
  ArrowLeft,
  ShieldCheck,
  FileBadge,
} from 'lucide-react';
import './Certificates.css';
import { useCertificates } from '../context/CertificateContext';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';

function Certificates() {
  const { issuedCertificates } = useCertificates();
  const { user } = useAuth();
  const { events } = useEvents();

  // Show only certificates issued to this student
  const certificates = issuedCertificates.filter(
    (certificate) => certificate.studentId === user?.id && events.some((event) => String(event.id) === String(certificate.eventId))
  );

 
  const downloadCertificate = (certificate) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const width = 297;
    const height = 210;

    // Background
    pdf.setFillColor(248, 247, 242);
    pdf.rect(0, 0, width, height, 'F');

    // Teal border
    pdf.setDrawColor(15, 118, 110);
    pdf.setLineWidth(2);
    pdf.rect(7, 7, width - 14, height - 14);

    // Gold inner border
    pdf.setDrawColor(217, 119, 6);
    pdf.setLineWidth(0.6);
    pdf.rect(12, 12, width - 24, height - 24);

    // CampusCred branding
    pdf.setTextColor(15, 118, 110);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('CAMPUSCRED', width / 2, 32, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('STUDENT ACHIEVEMENT PORTFOLIO', width / 2, 40, {
      align: 'center',
    });

    // Certificate heading
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(29);
    pdf.text(
      certificate.title || 'Certificate of Achievement',
      width / 2,
      62,
      { align: 'center' }
    );

    pdf.setFont('times', 'normal');
    pdf.setFontSize(14);
    pdf.text('This certificate is proudly presented to', width / 2, 79, {
      align: 'center',
    });

    // Student name
    pdf.setTextColor(15, 118, 110);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(27);
    pdf.text(certificate.studentName, width / 2, 100, {
      align: 'center',
    });

    // Certificate description
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(13);

    const description = certificate.description ||
      'For participating in and contributing to';

    pdf.text(description, width / 2, 116, {
      align: 'center',
      maxWidth: 240,
    });

    // Event name
    pdf.setFont('times', 'bold');
    pdf.setFontSize(20);
    pdf.text(
      certificate.certificateEventName || certificate.eventTitle,
      width / 2,
      135,
      { align: 'center', maxWidth: 240 }
    );

    // Organization
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      certificate.organization || 'CampusPulse',
      width / 2,
      151,
      { align: 'center' }
    );

    // Event date
    pdf.text(
      certificate.certificateEventDate || '',
      width / 2,
      160,
      { align: 'center' }
    );

    // Signatory
    pdf.setDrawColor(15, 118, 110);
    pdf.line(45, 178, 100, 178);
    pdf.line(197, 178, 252, 178);

    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(10);

    pdf.text(
      certificate.signatoryName || 'Faculty Coordinator',
      72.5,
      184,
      { align: 'center' }
    );

    pdf.text(
      certificate.signatoryDesignation || 'Institution Authority',
      224.5,
      184,
      { align: 'center' }
    );

    // Credential ID
    pdf.setTextColor(15, 118, 110);
    pdf.setFontSize(9);
    pdf.text(`Credential ID: ${certificate.id}`, width / 2, 193, {
      align: 'center',
    });

    pdf.save(`CampusCred-${certificate.id}.pdf`);
  };

  return (
    <div className="certificates-layout">
      {/* Sidebar */}
      <aside className="certificates-sidebar">
        <div className="certificates-brand">
          <Award size={25} />
          <span>CampusPulse</span>
        </div>

        <Link to="/student" className="certificates-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </aside>

      {/* Main Content */}
      <main className="certificates-main">
        <header className="certificates-header">
          <div>
            <span className="certificates-eyebrow">
              CAMPUSCRED • ACHIEVEMENTS
            </span>
            <h1>My Certificates</h1>
            <p>Your achievements, recognized and ready to share.</p>
          </div>

          <div className="certificates-count">
            <FileBadge size={20} />
            <span>
              {certificates.length} Certificate
              {certificates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        {/* Certificate Stats */}
        <section className="certificate-stats">
          <div className="certificate-stat-card">
            <div className="certificate-stat-icon">
              <Award size={22} />
            </div>
            <div>
              <h3>{certificates.length}</h3>
              <p>Total Certificates</p>
            </div>
          </div>

          <div className="certificate-stat-card">
            <div className="certificate-stat-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3>
                {new Set(certificates.map((cert) => cert.eventId)).size}
              </h3>
              <p>Achievement Category</p>
            </div>
          </div>
        </section>

        {/* Certificate List */}
        <section className="certificates-section">
          <h2>Available Certificates</h2>

          {certificates.length === 0 ? (
            <div className="certificates-empty">
              <Award size={42} />
              <h3>No certificates yet</h3>
              <p>
                Certificates issued by your event coordinators will
                appear here automatically.
              </p>
              <Link to="/student/events" className="certificates-explore-btn">
                Explore Events
              </Link>
            </div>
          ) : (
            <div className="certificates-grid">
              {certificates.map((certificate) => (
                <article className="certificate-card" key={certificate.id}>
                  <div className="certificate-card-top">
                    <div className="certificate-card-icon">
                      <Award size={28} />
                    </div>
                    <span className="certificate-status">
                      <ShieldCheck size={14} />
                      Achievement
                    </span>
                  </div>

                  <div className="certificate-card-content">
                    <span className="certificate-category">
                      {certificate.certificateType || 'Participation'}
                    </span>

                    <h3>{certificate.title}</h3>

                    <p className="certificate-event">
                      {certificate.certificateEventName ||
                        certificate.eventTitle}
                    </p>

                    <div className="certificate-details">
                      <p>
                        <span>Organization</span>
                        {certificate.organization || 'CampusPulse'}
                      </p>

                      <p>
                        <span>Event Date</span>
                        {certificate.certificateEventDate || 'Not specified'}
                      </p>

                      <p>
                        <span>Credential ID</span>
                        {certificate.id}
                      </p>
                    </div>
                  </div>

                  <button
                    className="certificate-download-btn"
                    onClick={() => downloadCertificate(certificate)}
                  >
                    <Download size={17} />
                    Download PDF
                  </button>
                  <Link className="certificate-verify-link" to={`/verify/${encodeURIComponent(certificate.id)}`}>Verify record ID</Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Information */}
        <div className="certificates-note">
          <ShieldCheck size={22} />
          <div>
            <h3>CampusCred Achievement Records</h3>
            <p>
              Certificates issued by event coordinators are displayed
              here. Local record lookup is available by credential ID. Official verification, QR validation, and
              institutional signatures can be integrated with Supabase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Certificates;
