const STORAGE_KEY = 'ccdb.oauth.completion';
const MAX_AGE = 15 * 60 * 1000;

type CompletionRecord = {
  state: string;
  clientName: string;
  approved: boolean;
  createdAt: number;
};

export type OAuthCompletion = {
  status: 'success' | 'cancelled' | 'error' | 'unknown';
  clientName: string;
};

/** Presentation context only: never persist codes, tokens, or callback URLs here. */
export function rememberOAuthDecision(
  state: string,
  clientName: string,
  approved: boolean,
) {
  if (!state) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, clientName, approved, createdAt: Date.now() }),
    );
  } catch {
    // Storage restrictions must not interrupt the OAuth callback.
  }
}

/** A result URL alone cannot create a successful consent screen in a fresh tab. */
export function readOAuthCompletion(hash: string): OAuthCompletion | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (!params.has('ccdb_result')) return null;
  const unknown: OAuthCompletion = { status: 'unknown', clientName: '' };
  const status = params.get('ccdb_result');
  if (
    !['success', 'cancelled', 'error'].includes(status || '') ||
    params.getAll('ccdb_result').length !== 1 ||
    params.getAll('state').length !== 1
  )
    return unknown;
  try {
    const record: CompletionRecord = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) || 'null',
    );
    if (
      !record ||
      !record.state ||
      record.state !== params.get('state') ||
      typeof record.clientName !== 'string' ||
      typeof record.approved !== 'boolean' ||
      !Number.isFinite(record.createdAt) ||
      Date.now() < record.createdAt ||
      Date.now() - record.createdAt > MAX_AGE ||
      (status === 'cancelled' ? record.approved : !record.approved)
    )
      return unknown;
    return {
      status: status as OAuthCompletion['status'],
      clientName: record.clientName,
    };
  } catch {
    return unknown;
  }
}
