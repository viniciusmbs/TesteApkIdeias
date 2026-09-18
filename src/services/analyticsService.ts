import { AnalyticsSummary, ClickEventLog } from '../types';

export interface UserGeoInfo {
  ip?: string;
  city: string;
  state?: string;
  region?: string;
  country?: string;
}

const STORAGE_KEY_GA_ID = 'satv_ga4_measurement_id';
const DEFAULT_GA_ID = 'G-XXXXXXXXXX';

let cachedGeo: UserGeoInfo | null = null;

export function getStoredMeasurementId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_GA_ID) || import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_ID;
  } catch {
    return DEFAULT_GA_ID;
  }
}

export function setStoredMeasurementId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_GA_ID, id);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', id);
    }
  } catch {}
}

export function initGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  const measurementId = getStoredMeasurementId();
  if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
    const existingScript = document.getElementById('ga4-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', measurementId);
    }
  }
}

export function initGlobalClickTracker() {
  if (typeof window === 'undefined') return;
  // Observa cliques em links de streaming para auditoria e tracking
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a[href*=".m3u8"], a[href*="rdcanais"], a[href*="http"]');
    if (target && target instanceof HTMLAnchorElement) {
      const url = target.href;
      const text = target.innerText || target.getAttribute('title') || 'Link Externo';
      trackLinkClick({
        linkId: `link-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        linkName: text,
        linkUrl: url,
        category: 'Navegação',
      });
    }
  });
}

export async function detectUserLocation(): Promise<UserGeoInfo> {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      cachedGeo = {
        ip: data.ip,
        city: data.city || 'São Paulo',
        state: data.region_code || 'SP',
        region: data.region || 'Sudeste',
        country: data.country_name || 'Brasil',
      };
      return cachedGeo;
    }
  } catch {}

  cachedGeo = {
    ip: '189.40.12.88',
    city: 'São Paulo',
    state: 'SP',
    region: 'Sudeste',
    country: 'Brasil',
  };
  return cachedGeo;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const res = await fetch(`/api/analytics?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}

  // Fallback em caso de offline
  try {
    const local = localStorage.getItem('satv_analytics_cache');
    if (local) return JSON.parse(local);
  } catch {}

  return {
    totalClicks: 0,
    lastUpdate: new Date().toISOString(),
    ga4EventsFired: 0,
    clicksByCity: [],
    clicksByLink: [],
    clicksByRegion: [],
    recentClicks: [],
  };
}

export async function trackLinkClick(params: {
  linkId: string;
  linkName: string;
  linkUrl: string;
  category?: string;
  city?: string;
}): Promise<ClickEventLog> {
  const geo = await detectUserLocation();
  const eventLog: ClickEventLog = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    linkId: params.linkId,
    linkName: params.linkName,
    linkUrl: params.linkUrl,
    category: params.category || 'Geral',
    city: params.city || geo.city,
    state: geo.state,
    region: geo.region,
    country: geo.country,
    ip: geo.ip,
    device: typeof navigator !== 'undefined' && /Android|SmartTV|Tizen/i.test(navigator.userAgent) ? 'Smart TV' : 'Web / Desktop',
  };

  // Disparo GA4 gtag se estiver disponível
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', 'link_click', {
        destination_url: params.linkUrl,
        link_url: params.linkUrl,
        link_id: params.linkId,
        link_name: params.linkName,
        link_category: params.category || 'Geral',
        user_city: eventLog.city,
        user_state: eventLog.state,
        user_region: eventLog.region,
        user_country: eventLog.country,
        event_category: 'engagement',
        event_label: params.linkName,
        value: 1,
      });
    } catch {}
  }

  // Notifica o app em tempo real via CustomEvent
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('satv:link_click', { detail: eventLog }));
  }

  // Envia ao servidor backend para persistência durável
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventLog),
    }).catch(() => {});
  } catch {}

  return eventLog;
}

export async function resetAnalyticsData(): Promise<void> {
  try {
    await fetch('/api/analytics/reset', { method: 'POST' });
  } catch {}
  try {
    localStorage.removeItem('satv_analytics_cache');
  } catch {}
}
