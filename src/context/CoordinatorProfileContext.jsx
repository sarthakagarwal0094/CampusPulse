import { createContext, useContext, useState } from "react";
import { coordinators as initialCoordinators } from "../data/demoData";
import { readStoredValue, writeStoredValue } from "../services/appDataService";
import { useAuth } from "./AuthContext";

const CoordinatorProfileContext = createContext(null);
const COORDINATOR_PROFILES_KEY = "campuspulse_demo_coordinators";

export function CoordinatorProfileProvider({ children }) {
  const { user, createCoordinatorAccount, updateCoordinatorAccount, removeCoordinatorAccount } = useAuth();
  const [coordinatorProfiles, setCoordinatorProfiles] = useState(() => readStoredValue(COORDINATOR_PROFILES_KEY, initialCoordinators, (value) => Array.isArray(value) && value.every((item) => item && typeof item.id === "string" && typeof item.email === "string")));

  const persist = (next) => {
    if (!writeStoredValue(COORDINATOR_PROFILES_KEY, next)) return false;
    setCoordinatorProfiles(next);
    return true;
  };

  const createCoordinator = (profile) => {
    if (user?.role !== "admin") return null;
    const normalizedEmail = profile.email.trim().toLowerCase();
    if (coordinatorProfiles.some((item) => item.email.toLowerCase() === normalizedEmail) || coordinatorProfiles.some((item) => item.employeeId?.toLowerCase() === profile.employeeId?.trim().toLowerCase())) return null;
    const coordinator = { ...profile, email: normalizedEmail, employeeId: profile.employeeId.trim(), id: `coord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() };
    if (!createCoordinatorAccount({ id: coordinator.id, email: coordinator.email, status: coordinator.status })) return null;
    if (!persist([...coordinatorProfiles, coordinator])) { removeCoordinatorAccount(coordinator.id); return null; }
    return coordinator;
  };

  const updateCoordinator = (id, changes) => {
    if (user?.role !== "admin") return false;
    const current = coordinatorProfiles.find((item) => item.id === id);
    if (!current) return false;
    const email = changes.email?.trim().toLowerCase();
    if (email && coordinatorProfiles.some((item) => item.id !== id && item.email.toLowerCase() === email)) return false;
    if (changes.employeeId && coordinatorProfiles.some((item) => item.id !== id && item.employeeId?.toLowerCase() === changes.employeeId.trim().toLowerCase())) return false;
    const normalizedChanges = { ...changes, ...(email ? { email } : {}) };
    if ((email && email !== current.email) || changes.status) {
      const accountChanges = {};
      if (email) accountChanges.email = email;
      if (changes.status) accountChanges.status = changes.status;
      if (!updateCoordinatorAccount(id, accountChanges)) return false;
    }
    const next = coordinatorProfiles.map((item) => item.id === id ? { ...item, ...normalizedChanges, id } : item);
    if (!persist(next)) {
      updateCoordinatorAccount(id, { email: current.email, status: current.status || "Active" });
      return false;
    }
    return true;
  };

  return <CoordinatorProfileContext.Provider value={{ coordinatorProfiles, createCoordinator, updateCoordinator }}>{children}</CoordinatorProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCoordinatorProfiles() {
  const context = useContext(CoordinatorProfileContext);
  if (!context) throw new Error("useCoordinatorProfiles must be used inside CoordinatorProfileProvider");
  return context;
}
