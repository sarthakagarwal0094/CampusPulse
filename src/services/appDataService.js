import { localStorageRepository } from "../repositories/localStorageRepository";

export const appDataService = {
  read: (key, fallback, validate) => localStorageRepository.read(key, fallback, validate),
  write: (key, value) => localStorageRepository.write(key, value),
  remove: (key) => localStorageRepository.remove(key),
  resetLocalWorkspace() {
    return localStorageRepository.clear([
      "campuspulse_demo_session", "campuspulse_demo_students", "campuspulse_demo_coordinators", "campuspulse_demo_coordinator_accounts",
      "campuspulse_registrations", "campuspulse_attendance", "campuspulse_events",
      "campuspulse_venues", "campuspulse_certificates", "campuspulse_admin_settings",
    ], ["campuspulse_demo_profile_"]);
  },
};

// Compatibility names keep existing context APIs stable during the refactor.
export const readStoredValue = appDataService.read;
export const writeStoredValue = appDataService.write;
export const removeStoredValue = appDataService.remove;
