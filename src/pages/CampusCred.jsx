import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Copy, X, Download, Printer, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useCertificates } from '../context/CertificateContext';
import './CampusCred.css';
import CampusCredCard from '../components/CampusCredCard';
import { getCampusCredData } from '../services/campusCredService';

export default function CampusCred() {
  const [shareOpen, setShareOpen] = useState(false);
  const cardRef = useRef(null);
  const { user } = useAuth();
  const { events } = useEvents();
  const { attendanceRecords, campusCredAwards } = useRegistrations();
  const { issuedCertificates } = useCertificates();
  const certificates = issuedCertificates.filter((item) => item.studentId === user?.id);
  const attendance = attendanceRecords.filter((item) => item.studentId === user?.id && item.status === 'Present');
  const cardData = getCampusCredData({ user, events, attendanceRecords, issuedCertificates, campusCredAwards });
  const score = cardData.points;
  const downloadCampusCred = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#fffdfa' });
      const link = document.createElement('a');
      link.download = `CampusCred_${(user.name || 'Student').replace(/[^a-z0-9]+/gi, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      window.alert('Unable to download the CampusCred card image.');
    }
  };
  const copySummary = async () => { const text=`${user.name} · ${score} CampusCred points · ${attendance.length} events attended · ${certificates.length} certificates · ${user.institution || 'KIET Deemed to be University'}. Local record, not institutionally verified.`; try { await navigator.clipboard.writeText(text); window.alert('CampusCred summary copied.'); } catch { window.prompt('Copy your CampusCred summary:',text); } };
  const shareLink = (network) => { const message=encodeURIComponent(`${user.name} has ${score} CampusCred points, ${attendance.length} events attended, and ${certificates.length} certificates at ${user.institution || 'KIET Deemed to be University'}.`); const urls={WhatsApp:`https://wa.me/?text=${message}`,Facebook:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,X:`https://twitter.com/intent/tweet?text=${message}`,LinkedIn:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}; if(urls[network]) window.open(urls[network],'_blank','noopener,noreferrer'); };

  return <div className="campuscred-layout"><main className="campuscred-main">
    <header className="campuscred-header"><div><span className="campuscred-eyebrow">STUDENT PORTAL · CREDENTIAL RECORD</span><h1>CampusCred</h1></div></header>
    <section className="campuscred-card-experience"><div className="campuscred-action-panel"><span className="campuscred-eyebrow">CAMPUSCRED CARD</span><h2>Your CampusCred Card</h2><p>Your campus participation, achievements, and earned points in one institutional student achievement record.</p><div className="campuscred-action-metrics"><span><strong>{score.toLocaleString()}</strong>Points Earned</span><span><strong>{attendance.length}</strong>Events Attended</span><span><strong>{certificates.length}</strong>Certificates</span></div><div className="campuscred-actions"><button onClick={downloadCampusCred}><Download/>Download CampusCred</button><button onClick={()=>window.print()}><Printer/>Print</button><button onClick={()=>setShareOpen(true)}><Share2/>Share</button><Link to="/student/campuscred/share"><Eye/>View</Link></div></div><div className="campuscred-card-preview" ref={cardRef}><CampusCredCard user={user} data={cardData}/></div></section>
    {shareOpen&&<div className="campuscred-share-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setShareOpen(false);}}><section className="campuscred-share-modal" role="dialog" aria-modal="true" aria-labelledby="share-campuscred-title"><button className="campuscred-share-close" onClick={()=>setShareOpen(false)} aria-label="Close sharing options"><X/></button><h2 id="share-campuscred-title">Share CampusCred</h2><p>Share your points and participation summary. This is a locally recorded profile, not an institutional verification.</p><div>{['LinkedIn','WhatsApp','Facebook','X'].map((network)=><button key={network} onClick={()=>shareLink(network)}>{network}</button>)}</div><button className="campuscred-copy-summary" onClick={copySummary}><Copy/>Copy Summary</button><p className="campuscred-instagram-note">For Instagram, download the CampusCred PDF and share a screenshot of the card with your caption.</p></section></div>}
  </main></div>;
}
