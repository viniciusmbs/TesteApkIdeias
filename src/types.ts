export * from './types/iptv';

export interface ChannelStatusResult {
  lastUpdate: string;
  total: number;
  online: number;
  offline: number;
  statuses: Record<string, 'online' | 'offline' | string>;
  latencies?: Record<string, number>;
}

export type ViewMode = 'rows' | 'grid' | 'epg';
export type UiDensity = 'compact' | 'normal' | 'large';

export interface ChannelItem {
  id: string;
  name: string;
  url: string;
  group?: string;
  logo?: string;
  status?: 'online' | 'offline' | 'checking';
  latency?: number;
  statusCode?: number;
}

export interface ClickEventLog {
  id: string;
  timestamp: string;
  linkId: string;
  linkName: string;
  linkUrl: string;
  category?: string;
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  ip?: string;
  device?: string;
}

export interface LinkClickMetric {
  linkId: string;
  linkName: string;
  linkUrl: string;
  category?: string;
  count: number;
  lastClicked?: string;
}

export interface CityClickMetric {
  city: string;
  state: string;
  region: string;
  country: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalClicks: number;
  lastUpdate: string;
  ga4EventsFired: number;
  clicksByCity: CityClickMetric[];
  clicksByLink: LinkClickMetric[];
  clicksByRegion: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  recentClicks: ClickEventLog[];
  uniqueCities?: number;
  uniqueLinks?: number;
}
