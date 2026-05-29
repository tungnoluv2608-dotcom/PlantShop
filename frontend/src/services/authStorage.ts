const AUTH_STORAGE_KEY = "plantweb-auth";
const ADMIN_AUTH_STORAGE_KEY = "pap-admin-auth";
const LEGACY_USER_TOKEN_KEY = "token";

function readPersistedToken(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function getUserToken() {
  return readPersistedToken(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_USER_TOKEN_KEY);
}

export function getAdminToken() {
  return readPersistedToken(ADMIN_AUTH_STORAGE_KEY);
}

export function isAdminApiRequest(url?: string) {
  return (url || "").startsWith("/admin");
}

export function isUploadApiRequest(url?: string) {
  return (url || "").startsWith("/upload");
}

export function clearUserSessionStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_TOKEN_KEY);
}

export function clearAdminSessionStorage() {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}
