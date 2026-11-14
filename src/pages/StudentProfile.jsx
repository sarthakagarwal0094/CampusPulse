
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound,
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  MapPin,
  Edit3,
  Save,
  X,
  Award,
  BookOpen,
  Camera,
  Trash2,
} from 'lucide-react';
import './StudentProfile.css';
import { useAuth } from '../context/AuthContext';

function StudentProfile() {
  const { user: profile, updateStudentProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [statusMessage, setStatusMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef(null);

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setPhotoError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image. SVG and other formats are not supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('The selected image is larger than 5 MB.');
      return;
    }
    try {
      const preview = await optimizeProfilePhoto(file);
      setPhotoPreview(preview);
    } catch {
      setPhotoError('This image could not be read. Please choose another photo.');
    }
  };

  const savePhoto = () => {
    if (!updateStudentProfile({ profileImage: photoPreview })) {
      setPhotoError('Photo could not be saved. Try a smaller image or check available browser storage.');
      return;
    }
    setPhotoPreview('');
    setStatusMessage('Profile photo updated.');
  };

  const removePhoto = () => {
    if (!updateStudentProfile({ profileImage: '' })) {
      setPhotoError('Photo could not be removed from browser storage.');
      return;
    }
    setPhotoPreview('');
    setPhotoError('');
    setStatusMessage('Profile photo removed.');
  };

  const handleEdit = () => {
    setStatusMessage("");
    setFormData(profile);
    setEditing(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "") || (formData.phone && !/^[+\d() .-]{7,20}$/.test(formData.phone))) {
      window.alert('Enter a name, valid email, and a valid phone number.');
      return;
    }
    const academicRequired = [formData.rollNo || formData.enrollment, formData.course, formData.academicYear, formData.year, formData.currentSemester, formData.section, formData.department, formData.institution];
    if (academicRequired.some((value) => !String(value || "").trim())) {
      window.alert('Complete all required academic details before saving.');
      return;
    }
    if (!updateStudentProfile({ ...formData, profileImage: profile.profileImage || '' })) {
      window.alert('Profile could not be saved. Check that the roll number and email are unique and browser storage is available.');
      return;
    }
    setEditing(false);
    setStatusMessage("Your profile has been updated.");
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  return (
    <div className="student-profile-layout">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-brand">
          <UserRound size={25} />
          <span>CampusPulse</span>
        </div>

        <Link to="/student" className="profile-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </aside>

      {/* Main Content */}
      <main className="student-profile-main">
        <header className="student-profile-header">
          <div>
            <span className="profile-eyebrow">ACCOUNT • PROFILE</span>
            <h1>My Profile</h1>
            <p>Manage your personal and academic information.</p>
          </div>

          {!editing ? (
            <button className="profile-edit-btn" onClick={handleEdit}>
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="profile-header-actions">
              <button className="profile-cancel-btn" onClick={handleCancel}>
                <X size={17} />
                Cancel
              </button>

              <button className="profile-save-btn" onClick={handleSave}>
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </header>
        {statusMessage && <p className="profile-save-message" role="status">{statusMessage}</p>}

        <section className="profile-photo-section" aria-labelledby="profile-photo-title">
          <div className="profile-photo-avatar">{(photoPreview || profile.profileImage) ? <img src={photoPreview || profile.profileImage} alt="Profile preview"/> : <span>{profile.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'ST'}</span>}</div>
          <div className="profile-photo-copy"><h2 id="profile-photo-title">Profile Photo</h2><p>Use a clear photo so your profile and CampusCred card share the same student avatar.</p><small>JPG, PNG, or WebP · Maximum 5 MB. Images are resized and optimized before saving.</small>
            <div className="profile-photo-actions"><input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} aria-label="Select profile photo" hidden/>{photoPreview ? <><button type="button" className="profile-save-btn" onClick={savePhoto}><Save size={16}/>Save Photo</button><button type="button" className="profile-cancel-btn" onClick={()=>{setPhotoPreview('');setPhotoError('');}}>Cancel</button></> : <button type="button" className="profile-edit-btn" onClick={()=>photoInputRef.current?.click()}><Camera size={16}/>{profile.profileImage?'Change Photo':'Upload Photo'}</button>}{profile.profileImage&&!photoPreview&&<button type="button" className="profile-remove-photo" onClick={removePhoto}><Trash2 size={16}/>Remove Photo</button>}</div>
            {photoError&&<p className="profile-photo-error" role="alert">{photoError}</p>}
          </div>
        </section>

        {/* Profile Hero */}
        <section className="profile-hero-card">
          <div className="profile-avatar">
            {profile.profileImage ? <img src={profile.profileImage} alt={`${profile.name} profile`} /> : profile.name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-hero-info">
            <h2>{profile.name}</h2>
            <p>{profile.program}</p>
            <span className="profile-semester-badge">
              {profile.semester}
            </span>
          </div>

          <div className="profile-member-badge">
            <Award size={17} />
            CampusPulse Student
          </div>
        </section>

        {/* Personal Information */}
        <section className="profile-section-card">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <UserRound size={20} />
            </div>
            <div>
              <h3>Personal Information</h3>
              <p>Your basic profile details</p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <ProfileField
              label="Full Name"
              value={editing ? formData.name : profile.name}
              editing={editing}
              onChange={(value) => handleChange('name', value)}
            />

            <ProfileField
              label="Email Address"
              value={editing ? formData.email : profile.email}
              editing={editing}
              onChange={(value) => handleChange('email', value)}
              icon={<Mail size={16} />}
            />

            <ProfileField
              label="Phone Number"
              value={editing ? formData.phone : profile.phone}
              editing={editing}
              onChange={(value) => handleChange('phone', value)}
              icon={<Phone size={16} />}
              placeholder="Add phone number"
            />

            <ProfileField
              label="Location"
              value={editing ? formData.location : profile.location}
              editing={editing}
              onChange={(value) => handleChange('location', value)}
              icon={<MapPin size={16} />}
            />
          </div>

          <div className="profile-bio-field">
            <label>About Me</label>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                placeholder="Write something about yourself..."
              />
            ) : (
              <p>{profile.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </section>

        {/* Academic Details */}
        <section className="profile-section-card">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3>Academic Information</h3>
              <p>Your institutional details</p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <ProfileField
              label="Student Roll Number"
              value={editing ? (formData.rollNo || formData.enrollment) : (profile.rollNo || profile.enrollment)}
              editing={editing}
              onChange={(value) => { handleChange('rollNo', value); handleChange('enrollment', value); }}
              icon={<BookOpen size={16} />}
            />

            <ProfileField
              label="Course"
              value={editing ? formData.course : (profile.course || profile.program)}
              editing={editing}
              onChange={(value) => handleChange('course', value)}
              icon={<GraduationCap size={16} />}
            />

            <ProfileField
              label="Academic Year"
              value={editing ? formData.academicYear : profile.academicYear}
              editing={editing}
              onChange={(value) => handleChange('academicYear', value)}
              icon={<CalendarDays size={16} />}
            />

            <ProfileField label="Current Year" value={editing ? formData.year : profile.year} editing={editing} onChange={(value) => handleChange('year', value)} />
            <ProfileField label="Current Semester" value={editing ? formData.currentSemester : (profile.currentSemester || profile.semester)} editing={editing} onChange={(value) => handleChange('currentSemester', value)} />
            <ProfileField label="Section" value={editing ? formData.section : profile.section} editing={editing} onChange={(value) => handleChange('section', value)} />

            <ProfileField
              label="Department"
              value={editing ? formData.department : profile.department}
              editing={editing}
              onChange={(value) => handleChange('department', value)}
            />

            <ProfileField
              label="Institution"
              value={editing ? formData.institution : profile.institution}
              editing={editing}
              onChange={(value) => handleChange('institution', value)}
            />
          </div>

        </section>

        <div className="profile-completion" role="status"><strong>Profile completion</strong><span>{Math.round(([profile.name, profile.email, profile.phone, profile.rollNo || profile.enrollment, profile.course || profile.program, profile.department, profile.academicYear, profile.year, profile.currentSemester || profile.semester, profile.section, profile.institution].filter(Boolean).length / 11) * 100)}% complete</span><div><i style={{ width: `${Math.round(([profile.name, profile.email, profile.phone, profile.rollNo || profile.enrollment, profile.course || profile.program, profile.department, profile.academicYear, profile.year, profile.currentSemester || profile.semester, profile.section, profile.institution].filter(Boolean).length / 11) * 100)}%` }} /></div></div>

        {/* Skills */}
        <section className="profile-section-card">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <Award size={20} />
            </div>
            <div>
              <h3>Skills & Interests</h3>
              <p>Your technical skills and areas of interest</p>
            </div>
          </div>

          <div className="profile-tags-section">
            <label>Technical Skills</label>
            <div className="profile-tags">
              {profile.skills.map((skill) => (
                <span className="profile-tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="profile-tags-section">
            <label>Interests</label>
            <div className="profile-tags">
              {profile.interests.map((interest) => (
                <span className="profile-interest-tag" key={interest}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom save actions */}
        {editing && (
          <div className="profile-bottom-actions">
            <button className="profile-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="profile-save-btn" onClick={handleSave}>
              <Save size={17} />
              Save Changes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing = false,
  onChange,
  icon,
  placeholder = 'Not provided',
}) {
  return (
    <div className="profile-field">
      <label>{label}</label>

      {editing && onChange ? (
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="profile-field-value">
          {icon && <span className="profile-field-icon">{icon}</span>}
          <span>{value || placeholder}</span>
        </div>
      )}
    </div>
  );
}

function optimizeProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const sx = Math.round((image.naturalWidth - side) / 2);
      const sy = Math.round((image.naturalHeight - side) / 2);
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      if (!context) { reject(new Error('Canvas is unavailable')); return; }
      context.drawImage(image, sx, sy, side, side, 0, 0, 400, 400);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Image compression failed')); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Image read failed'));
        reader.readAsDataURL(blob);
      }, 'image/webp', 0.82);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Invalid image')); };
    image.src = objectUrl;
  });
}

export default StudentProfile;
