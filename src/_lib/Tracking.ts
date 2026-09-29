import { http } from './http_client';
import { windowConsent } from './consent';

const TRACKING_URL = 'https://api.bukazu.com/tracking';
const SESSION_COOKIE = 'bu_portal_session';
const SESSION_DAYS = 14;
const TOKEN = /^[A-Za-z0-9_.-]{1,64}$/;

type Stay = { arrival: string; departure: string };

export type FilterValue = string | number | (string | number)[];
export type HouseViewEntry = 'search' | 'direct' | 'external';

export type TrackingEvent = {
  portal_code: string;
  locale: string;
  house_code?: string;
} & (
  | { interaction_type: 'search_view'; interaction_info: Record<string, never> }
  | {
      interaction_type: 'search';
      interaction_info: Partial<Stay> & {
        persons?: number;
        filters?: Record<string, FilterValue>;
        result_count: number;
      };
    }
  | {
      interaction_type: 'house_view';
      interaction_info: { entry: HouseViewEntry };
    }
  | {
      interaction_type: 'quote_shown';
      interaction_info: Stay & {
        persons: number;
        total_cents: number;
        currency: string;
      };
    }
  | { interaction_type: 'price_unavailable'; interaction_info: Stay }
  | {
      interaction_type: 'booking_started';
      interaction_info: Stay & { persons: number };
    }
  | {
      interaction_type: 'booking_form_error';
      interaction_info: { fields: string[] };
    }
  | {
      interaction_type: 'booking_failed';
      interaction_info: { error_key: string };
    }
);

type DeviceClass = 'mobile' | 'tablet' | 'desktop';

interface Attribution {
  referrer_host?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_path: string;
  device_class: DeviceClass;
}

let consentFromHost = false;
// Without consent the session lives only as long as this page load.
let memorySessionId = '';
let attribution: Attribution | null = null;
// The cookie is written only once a response arrives, so it cannot tell
// concurrent events that one of them already carries the attribution.
let attributionSent = false;

// The server hands out the session id, so events fired before the first
// response arrives wait for it instead of each starting a session of their own.
let sessionRequest: Promise<void> | null = null;

export function setTrackingConsent(consented: boolean): void {
  consentFromHost = consented;
}

/** Test hook: forget the in-memory session, attribution and host consent. */
export function resetTracking(): void {
  consentFromHost = false;
  memorySessionId = '';
  attribution = null;
  attributionSent = false;
  sessionRequest = null;
}

function consented(): boolean {
  return consentFromHost || windowConsent();
}

function currentSessionId(): string {
  return (consented() && getCookie(SESSION_COOKIE)) || memorySessionId;
}

export function isToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN.test(value);
}

export async function TrackEvent(event: TrackingEvent): Promise<void> {
  try {
    if (!currentSessionId() && sessionRequest) await sessionRequest;

    const request = postEvent(event);
    if (!currentSessionId() && !sessionRequest) {
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

async function postEvent(event: TrackingEvent): Promise<void> {
  const consent = consented();
  const sessionId = currentSessionId();
  const payload: Record<string, unknown> = {
    ...event,
    interaction_info: withoutBlanks(event.interaction_info),
    url: window.location.href,
    consented: consent
  };
  if (sessionId) payload.session_identifier = sessionId;
  const withAttribution =
    consent && !attributionSent && !getCookie(SESSION_COOKIE);
  if (withAttribution) {
    payload.attribution = currentAttribution();
    attributionSent = true;
  }

  let newSessionId = '';
  try {
    const response = await http.post(TRACKING_URL, { json: payload }).text();
    newSessionId = response.trim();
  } finally {
    // A failed request or a 204 (dropped by the server) recorded nothing, so a
    // later event retries the attribution.
    if (!newSessionId && withAttribution) attributionSent = false;
  }
  if (!newSessionId) return;

  memorySessionId = newSessionId;
  if (consented()) setCookie(SESSION_COOKIE, newSessionId, SESSION_DAYS);
}

function withoutBlanks(info: object): Record<string, unknown> {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(info)) {
    if (value !== undefined && value !== null && value !== '')
      kept[key] = value;
  }
  return kept;
}

function currentAttribution(): Attribution {
  if (attribution) return attribution;

  const params = new URLSearchParams(window.location.search);
  const parsed: Attribution = {
    landing_path: window.location.pathname,
    device_class: deviceClass(window.innerWidth)
  };
  const host = externalReferrerHost();
  if (host) parsed.referrer_host = host;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
    const value = params.get(key);
    if (value) parsed[key] = value;
  }

  attribution = parsed;
  return parsed;
}

function deviceClass(width: number): DeviceClass {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function referrerHost(): string {
  try {
    return document.referrer ? new URL(document.referrer).host : '';
  } catch {
    return '';
  }
}

function externalReferrerHost(): string {
  const host = referrerHost();
  return host === window.location.host ? '' : host;
}

export function houseViewEntry(): HouseViewEntry {
  const host = referrerHost();
  if (!host) return 'direct';
  return host === window.location.host ? 'search' : 'external';
}

export function getSessionIdentifier(): string | null {
  return currentSessionId() || null;
}

function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/;SameSite=Lax;Secure`;
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
