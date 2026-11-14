import { Link, useParams } from "react-router-dom";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { useCertificates } from "../context/CertificateContext";
import "./CertificateVerification.css";

export default function CertificateVerification() {
  const { certificateId } = useParams();
  const { issuedCertificates } = useCertificates();
  const certificate = issuedCertificates.find((item) => item.id === certificateId);

  return <main className="certificate-verification">
    <Link to="/" className="certificate-verify-brand">Campus<span>Pulse</span></Link>
    {certificate ? <section className="certificate-verify-card"><BadgeCheck size={36} /><p className="certificate-verify-eyebrow">LOCAL RECORD MATCH</p><h1>Certificate record found</h1><dl><div><dt>Certificate ID</dt><dd>{certificate.id}</dd></div><div><dt>Student</dt><dd>{certificate.studentName}</dd></div><div><dt>Event</dt><dd>{certificate.certificateEventName || certificate.eventTitle}</dd></div><div><dt>Issue date</dt><dd>{new Date(certificate.issueDate).toLocaleDateString()}</dd></div><div><dt>Issuer</dt><dd>{certificate.organization}</dd></div></dl><p className="certificate-verify-notice">This confirms a matching record in this browser only. It is not institutionally verified.</p></section> : <section className="certificate-verify-card missing"><CircleAlert size={36} /><p className="certificate-verify-eyebrow">NO LOCAL MATCH</p><h1>Certificate not found</h1><p>No certificate with ID <strong>{certificateId}</strong> exists in this browser's saved records.</p></section>}
  </main>;
}
