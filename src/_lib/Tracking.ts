import { http } from './http_client';

interface TrackEventData {
  portal_code: string;
  interaction_type: string;
  locale: string;
  house_code?: string;
  interaction_info?: Record<string, unknown>;
}

const SESSION_COOKIE = 'bu_portal_session';

// The server hands out the session id, so events fired before the first
// response arrives wait for it instead of each starting a session of their own.
let sessionRequest: Promise<void> | null = null;

export async function TrackEvent(data: TrackEventData): Promise<void> {
  try {
    if (!getCookie(SESSION_COOKIE) && sessionRequest) await sessionRequest;

    const request = postEvent(data);
    if (!getCookie(SESSION_COOKIE) && !sessionRequest) {
      const clear = () => {
        sessionRequest = null;
      };
      sessionRequest = request.then(clear, clear);
    }
    await request;
  } catch {
    // Tracking must never break the portal.
  }
}

async function postEvent(data: TrackEventData) {
  const all_data = {
    ...data,
    url: window.location.href,
    session_identifier: getCookie(SESSION_COOKIE)
  };

  const sessionId = await http
    .post('https://api.bukazu.com/tracking', { json: all_data })
    .text();
  setCookie(SESSION_COOKIE, sessionId, 14);
}

export function getSessionIdentifier() {
  const sessionIdentifier = getCookie(SESSION_COOKIE);
  if (sessionIdentifier === '') {
    return null;
  } else {
    return sessionIdentifier;
  }
}

function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname: string) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
