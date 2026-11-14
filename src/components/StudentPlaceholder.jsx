
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function StudentPlaceholder({ title, description }) {
  return (
    <div style={{ padding: '40px' }}>
      <Link to="/student" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#0F766E',
        marginBottom: '25px'
      }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
        {title}
      </h1>

      <p style={{ color: '#64748B' }}>
        {description}
      </p>

      <div style={{
        marginTop: '30px',
        padding: '30px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #E2E8F0'
      }}>
        <h3>Coming Soon</h3>
        <p style={{ marginTop: '10px', color: '#64748B' }}>
          This section will be implemented next.
        </p>
      </div>
    </div>
  );
}

export default StudentPlaceholder;
