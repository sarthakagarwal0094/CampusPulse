import { createContext, useContext, useState } from "react";
import { readStoredValue, writeStoredValue } from "../services/appDataService";
import { SETTINGS_STORAGE_KEY, defaultSettings } from "../data/settings";

const SettingsContext = createContext(null);
const validSettings = (value) => value && typeof value === "object" && !Array.isArray(value);

export function AdminSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...sanitizeSettings(readStoredValue(SETTINGS_STORAGE_KEY, {}, validSettings)),
  }));

  const saveSettings = (next) => {
    const normalized = {
      ...defaultSettings,
      ...next,
      maxEventsPerStudent: Math.max(1, Number(next.maxEventsPerStudent) || defaultSettings.maxEventsPerStudent),
    };
    if (!writeStoredValue(SETTINGS_STORAGE_KEY, normalized)) return false;
    setSettings(normalized);
    return true;
  };

  const resetSettings = () => {
    if (!writeStoredValue(SETTINGS_STORAGE_KEY, defaultSettings)) return false;
    setSettings(defaultSettings);
    return true;
  };

  return <SettingsContext.Provider value={{ settings, saveSettings, resetSettings }}>{children}</SettingsContext.Provider>;
}

function sanitizeSettings(value) {
  const stored = value && typeof value === "object" ? value : {};
  const strings = ["institutionName", "institutionEmail", "institutionPhone", "academicSession", "certificatePrefix", "certificateIssuer"];
  const booleans = ["registrationEnabled", "allowCancellation", "emailNotifications", "registrationNotifications", "clashNotifications"];
  const safe = {};
  strings.forEach((key) => { if (typeof stored[key] === "string") safe[key] = stored[key]; });
  booleans.forEach((key) => { if (typeof stored[key] === "boolean") safe[key] = stored[key]; });
  if (Number.isFinite(Number(stored.maxEventsPerStudent))) safe.maxEventsPerStudent = Math.max(1, Math.min(20, Number(stored.maxEventsPerStudent)));
  return safe;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useAdminSettings must be used inside AdminSettingsProvider");
  return context;
}
