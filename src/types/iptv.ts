export interface Channel {
  id: string;
  name: string;
  url: string;
  group?: string;
  logo?: string;
  status?: 'online' | 'offline' | 'checking';
  latency?: number;
  statusCode?: number;
}

export interface ChannelCheckResult {
  online: boolean;
  status: number;
  latency: number;
  statusText?: string;
  checkedAt?: string;
  contentType?: string;
}

export interface RepoConfig {
  githubUser: string;
  repoName: string;
  branch: string;
  cronPreset: 'hourly' | 'every-2h' | 'every-6h' | 'every-12h' | 'daily' | 'custom';
  customCron?: string;
  sourceType: 'm3u-url' | 'json' | 'static-list';
  m3uUrl: string;
  timeoutSeconds: number;
  concurrency: number;
  userAgent: string;
  statusFilePath: string;
  commitMessage: string;
}
