import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCertificates } from '../context/CertificateContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useEvents } from '../context/EventContext';
import CampusCredCard from '../components/CampusCredCard';
import { getCampusCredData } from '../services/campusCredService';
import './AchievementCard.css';

export default function AchievementCard() {
  const cardRef=useRef(null);const {user}=useAuth();const {issuedCertificates}=useCertificates();const {attendanceRecords,campusCredAwards}=useRegistrations();const {events}=useEvents();
  const data=getCampusCredData({user,events,attendanceRecords,issuedCertificates,campusCredAwards});
  const download=async()=>{if(!cardRef.current)return;try{const url=await toPng(cardRef.current,{pixelRatio:2,cacheBust:true,backgroundColor:'#fffdfa'});const a=document.createElement('a');a.href=url;a.download='CampusCred-Share-Card.png';a.click();}catch{window.alert('Could not create the CampusCred share image.');}};
  const share=async()=>{const summary=`${user.name}: ${data.points} CampusCred points, ${data.attendance.length} events attended, ${data.certificates.length} certificates at ${user.institution||'KIET Deemed to be University'}. Locally recorded, not institutionally verified.`;try{if(navigator.share)await navigator.share({title:'My CampusCred',text:summary,url:window.location.origin});else await navigator.clipboard.writeText(summary);}catch{/* User cancelled native share. */}};
  return <div className="achievement-card-layout"><main className="achievement-card-main"><Link to="/student/campuscred" className="achievement-back-link"><ArrowLeft size={18}/> Back to CampusCred</Link><header className="achievement-page-header"><span>CAMPUSCRED · STUDENT ACHIEVEMENT CARD</span><h1>Your CampusCred</h1></header><div className="achievement-full-card" ref={cardRef}><CampusCredCard user={user} data={data} large/></div><div className="achievement-actions"><button onClick={download}><Download/>Download Share Card</button><button onClick={()=>window.print()}><Printer/>Print</button><button onClick={share}><Share2/>Share</button></div><p className="achievement-tip">Instagram tip: download the share card image, then upload it with your caption.</p></main></div>;
}
