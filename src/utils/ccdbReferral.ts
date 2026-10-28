const STORAGE_KEY = 'carbon-agent:ccdb-referral';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Keeps attribution while the anonymous draft becomes a real conversation.
 * This is only an opaque share identifier, never an OAuth/device code or token.
 * The backend validates the share and awards only first-time Agent registrations.
 */
export const getAgentInviteCode = (
  search = window.location.search,
): string | undefined => {
  const code = new URLSearchParams(search).get('agentInviteCode') || undefined;
  try {
    if (code) {
      if (/^fsh_[A-Za-z0-9_-]{16,64}$/.test(code)) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ code, createdAt: Date.now() }),
        );
      }
      return code;
    }
    const cached = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (
      cached &&
      /^fsh_[A-Za-z0-9_-]{16,64}$/.test(cached.code) &&
      Number.isFinite(cached.createdAt) &&
      Date.now() - cached.createdAt < MAX_AGE_MS
    )
      return cached.code;
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage can be disabled; query attribution still works. */
  }
  return code;
};

export const clearCcdbReferral = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
};
