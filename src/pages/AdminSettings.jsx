
import { useEffect, useState } from "react";
import { useAdminSettings } from "../context/AdminSettingsContext";
import { defaultSettings } from "../data/settings";
import { appDataService } from "../services/appDataService";
import {
  Building2,
  CalendarDays,
  Bell,
  Award,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
} from "lucide-react";
import "./AdminSettings.css";

export default function AdminSettings() {
  const { settings: savedSettings, saveSettings, resetSettings } = useAdminSettings();
  const [settings, setSettings] = useState(savedSettings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!savedMessage) return;

    const timer = setTimeout(() => setSavedMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    setSavedMessage(saveSettings(settings) ? "Settings saved successfully. Registration and certificate preferences have been updated." : "Unable to save settings. Check browser storage settings.");
  };

  const handleReset = () => {
    if (!window.confirm("Reset all settings to default values?")) return;

    if (!resetSettings()) {
      setSavedMessage("Unable to reset settings. Check browser storage settings.");
      return;
    }
    setSettings(defaultSettings);
    setSavedMessage("Settings reset successfully.");
  };

  const handleResetWorkspace = () => {
    if (!window.confirm("Reset this browser's CampusPulse data to its original sample state? This removes locally created events, accounts, registrations, attendance, certificates, and settings. This cannot be undone.")) return;
    if (!appDataService.resetLocalWorkspace()) { setSavedMessage("Unable to reset local data. Check browser storage settings."); return; }
    window.location.assign("/login");
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h1>Institutional Settings</h1>
          <p>Configure CampusPulse institutional preferences.</p>
        </div>

        <div className="settings-header-actions">
          <button className="settings-reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="settings-save-btn"
            onClick={handleSave}
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="settings-message">{savedMessage}</div>
      )}

      <form onSubmit={handleSave}>
        {/* Institution Information */}
        <section className="settings-card">
          <div className="settings-section-title">
            <Building2 size={20} />
            <div>
              <h2>Institution Information</h2>
              <p>Basic institutional details.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Institution Name</label>
              <input
                name="institutionName"
                value={settings.institutionName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label>Institution Email</label>
              <input
                type="email"
                name="institutionEmail"
                value={settings.institutionEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label>Contact Phone</label>
              <input
                name="institutionPhone"
                value={settings.institutionPhone}
                onChange={handleChange}
                placeholder="Enter contact number"
              />
            </div>
          </div>
        </section>

        {/* Academic Session */}
        <section className="settings-card">
          <div className="settings-section-title">
            <CalendarDays size={20} />
            <div>
              <h2>Academic Session</h2>
              <p>Configure the current academic year.</p>
            </div>
          </div>

          <div className="settings-field">
            <label>Academic Session</label>
            <select
              name="academicSession"
              value={settings.academicSession}
              onChange={handleChange}
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
            </select>
          </div>
        </section>

        {/* Registration Settings */}
        <section className="settings-card">
          <div className="settings-section-title">
            <SettingsIcon size={20} />
            <div>
              <h2>Event Registration</h2>
              <p>Control student event registration preferences.</p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <div>
                <strong>Enable Registrations</strong>
                <p>Allow students to register for events.</p>
              </div>
              <input
                type="checkbox"
                name="registrationEnabled"
                checked={settings.registrationEnabled}
                onChange={handleChange}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Allow Registration Cancellation</strong>
                <p>Allow students to cancel their registrations.</p>
              </div>
              <input
                type="checkbox"
                name="allowCancellation"
                checked={settings.allowCancellation}
                onChange={handleChange}
              />
            </label>

            <div className="settings-field">
              <label>Maximum Events Per Student</label>
              <input
                type="number"
                name="maxEventsPerStudent"
                min="1"
                max="20"
                value={settings.maxEventsPerStudent}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Certificate Settings */}
        <section className="settings-card">
          <div className="settings-section-title">
            <Award size={20} />
            <div>
              <h2>Certificate Configuration</h2>
              <p>Configure institutional certificate details.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Certificate Prefix</label>
              <input
                name="certificatePrefix"
                value={settings.certificatePrefix}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label>Certificate Issuer</label>
              <input
                name="certificateIssuer"
                value={settings.certificateIssuer}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-section-title">
            <Bell size={20} />
            <div>
              <h2>Notification Preferences</h2>
              <p>Configure institutional notification preferences.</p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <div>
                <strong>Email Notifications</strong>
                <p>Enable institutional email notification preference.</p>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Registration Notifications</strong>
                <p>Enable registration notification preference.</p>
              </div>
              <input
                type="checkbox"
                name="registrationNotifications"
                checked={settings.registrationNotifications}
                onChange={handleChange}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Event Clash Notifications</strong>
                <p>Enable event clash notification preference.</p>
              </div>
              <input
                type="checkbox"
                name="clashNotifications"
                checked={settings.clashNotifications}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>

        <div className="settings-bottom-actions">
          <button type="submit" className="settings-save-btn">
            <Save size={16} />
            Save All Settings
          </button>
        </div>
      </form>
      <section className="settings-card settings-workspace-reset">
        <div className="settings-section-title"><RotateCcw size={20} /><div><h2>Reset Local Workspace</h2><p>Restore the original sample state in this browser. Locally created records will be removed.</p></div></div>
        <button type="button" className="settings-reset-btn" onClick={handleResetWorkspace}>Reset Workspace Data</button>
      </section>
    </div>
  );
}
