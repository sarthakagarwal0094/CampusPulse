import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, ArrowRight, Mail, Lock, User, GraduationCap, IdCard, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const initialValues = { fullName:'', email:'', phone:'', rollNo:'', course:'', department:'', academicYear:'', year:'', currentSemester:'', section:'', institution:'', password:'', confirmPassword:'' };

function Register() {
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const update = (event) => setValues((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match. Please check both password fields.');
      return;
    }
    setSubmitting(true);
    const registered = registerStudent({
      name: values.fullName.trim(), email: values.email.trim().toLowerCase(), phone: values.phone.trim(),
      institution: values.institution.trim(), enrollment: values.rollNo.trim(), rollNo: values.rollNo.trim(),
      course: values.course, department: values.department.trim(), academicYear: values.academicYear.trim(),
      year: values.year, currentSemester: values.currentSemester, section: values.section.trim(),
    });
    setSubmitting(false);
    if (!registered) {
      setError('That email or student roll number is already registered, or browser storage is unavailable.');
      return;
    }
    navigate('/student', { replace: true, state: { registrationSuccess: true } });
  };

  const input = (name, label, placeholder, Icon, type = 'text') => <Field label={label} name={name} icon={Icon} required>
    <input id={name} name={name} type={type} value={values[name]} onChange={update} placeholder={placeholder} required />
  </Field>;
  const select = (name, label, Icon, children) => <Field label={label} name={name} icon={Icon} required>
    <select id={name} name={name} value={values[name]} onChange={update} required><option value="" disabled>Select {label.toLowerCase()}</option>{children}</select>
  </Field>;

  return <main className="register-page">
    <header className="register-page-header"><Link to="/" className="register-brand" aria-label="CampusPulse home"><Activity size={27}/><span>Campus<span>Pulse</span></span></Link><Link to="/" className="register-back-home">← Back to Home</Link></header>
    <section className="register-card" aria-labelledby="register-title">
      <div className="register-card-heading"><span className="register-eyebrow">STUDENT PORTAL</span><h1 id="register-title">Create your account</h1><p>Enter your details to join your campus community.</p></div>
      <form onSubmit={handleSubmit} className="register-form">
        <fieldset className="register-section"><legend>Personal Information</legend><div className="register-field-grid">
          {input('fullName','Full Name','Your full name',User)}
          {input('email','Email Address','you@college.edu',Mail,'email')}
          <Field label="Password" name="password" icon={Lock} required><input id="password" name="password" type={showPassword?'text':'password'} value={values.password} onChange={update} placeholder="At least 8 characters" minLength={8} required/><button className="register-password-toggle" type="button" onClick={()=>setShowPassword((visible)=>!visible)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></Field>
          <Field label="Confirm Password" name="confirmPassword" icon={Lock} required><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword?'text':'password'} value={values.confirmPassword} onChange={update} placeholder="Re-enter your password" minLength={8} required/><button className="register-password-toggle" type="button" onClick={()=>setShowConfirmPassword((visible)=>!visible)} aria-label={showConfirmPassword?'Hide confirm password':'Show confirm password'}>{showConfirmPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></Field>
        </div></fieldset>
        <fieldset className="register-section"><legend>Academic Information</legend><div className="register-field-grid">
          {input('rollNo','Student Roll Number','e.g. BCA24018',IdCard)}
          {select('course','Course',GraduationCap,<><option>BCA</option><option>MCA</option><option>B.Tech</option><option>BBA</option><option>MBA</option><option>Other</option></>)}
          {input('department','Department','Your department',GraduationCap)}
          {input('academicYear','Academic Year','2026-27',null)}
          {select('year','Current Year',null,[1,2,3,4,5].map((value)=><option key={value}>{value}{value===1?'st':value===2?'nd':value===3?'rd':'th'} Year</option>))}
          {select('currentSemester','Current Semester',null,[1,2,3,4,5,6,7,8,9,10].map((value)=><option key={value} value={value}>{value}</option>))}
          {input('section','Section','e.g. A',null)}
          {input('institution','Institution','College or university name',GraduationCap)}
        </div></fieldset>
        <fieldset className="register-section"><legend>Contact Information</legend><div className="register-field-grid register-field-grid-single">
          <Field label="Mobile Number" name="phone" icon={Phone} optional><input id="phone" name="phone" type="tel" value={values.phone} onChange={update} placeholder="Add a contact number (optional)"/></Field>
        </div></fieldset>
        <label className="register-terms"><input type="checkbox" required/><span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</span></label>
        {error && <p className="register-error" role="alert">{error}</p>}
        <button type="submit" className="register-submit" disabled={submitting}>{submitting?'Creating account…':'Create Account'}{!submitting&&<ArrowRight size={18}/>}</button>
      </form>
      <p className="register-login-link">Already have an account? <Link to="/login">Log in</Link></p>
    </section>
    <footer className="register-footer">© {new Date().getFullYear()} CampusPulse · Campus Event Management</footer>
  </main>;
}

function Field({ label, name, icon: Icon, required = false, optional = false, children }) {
  return <div className="register-field"><label htmlFor={name}>{label}<span>{required?' *':optional?' (optional)':''}</span></label><div className="register-control">{Icon&&<Icon size={17} aria-hidden="true"/>}{children}</div></div>;
}

export default Register;
