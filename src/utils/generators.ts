import { RepoConfig, Channel } from '../types/iptv';

export function generateWorkflowYaml(configOrOwner: RepoConfig | string, repoName?: string): string {
  let cronExpr = '0 */6 * * *';
  let commitMessage = '🤖 Atualização automática do status dos canais IPTV';
  let statusFilePath = 'channels-status.json';

  if (typeof configOrOwner === 'object') {
    cronExpr =
      configOrOwner.cronPreset === 'hourly'
        ? '0 * * * *'
        : configOrOwner.cronPreset === 'every-2h'
        ? '0 */2 * * *'
        : configOrOwner.cronPreset === 'every-6h'
        ? '0 */6 * * *'
        : configOrOwner.cronPreset === 'every-12h'
        ? '0 */12 * * *'
        : configOrOwner.cronPreset === 'daily'
        ? '0 3 * * *'
        : configOrOwner.customCron || '0 */6 * * *';
    commitMessage = configOrOwner.commitMessage || commitMessage;
    statusFilePath = configOrOwner.statusFilePath || statusFilePath;
  }

  return `name: Check IPTV Channels

on:
  schedule:
    - cron: '${cronExpr}'
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Channel Checker Script
        run: node scripts/check-channels.js

      - name: Commit and push updated status
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "${commitMessage}"
          file_pattern: ${statusFilePath}`;
}

export function generateCheckerScript(config: RepoConfig, channels: Channel[]): string {
  return `#!/usr/bin/env node

/**
 * Script de Verificação de Status de Canais IPTV
 * Gerado automaticamente para o repositório: ${config.githubUser}/${config.repoName}
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.resolve(__dirname, '../${config.statusFilePath || 'channels-status.json'}');
const TIMEOUT_MS = ${(config.timeoutSeconds || 5) * 1000};

// Canais cadastrados (${channels.length} canais)
const CHANNELS = ${JSON.stringify(channels.map(c => ({ id: c.id, name: c.name, url: c.url, group: c.group || 'Geral' })), null, 2)};

async function checkChannel(channel) {
  const startTime = Date.now();
  try {
    const res = await fetch(channel.url, {
      method: 'GET',
      headers: {
        'User-Agent': '${config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const latency = Date.now() - startTime;
    const isOnline = res.status >= 200 && res.status < 400;

    return {
      name: channel.name,
      status: isOnline ? 'online' : 'offline',
      latency,
      statusCode: res.status,
    };
  } catch {
    return {
      name: channel.name,
      status: 'offline',
      latency: Date.now() - startTime,
      statusCode: 0,
    };
  }
}

async function main() {
  console.log(\`📡 Iniciando verificação de \${CHANNELS.length} canais...\`);
  const statuses = {};
  const latencies = {};
  let onlineCount = 0;
  let offlineCount = 0;

  for (let i = 0; i < CHANNELS.length; i++) {
    const ch = CHANNELS[i];
    const res = await checkChannel(ch);
    statuses[ch.name] = res.status;
    latencies[ch.name] = res.latency;

    if (res.status === 'online') {
      onlineCount++;
      console.log(\`  [\${i + 1}/\${CHANNELS.length}] \${ch.name}: ✅ ONLINE (\${res.latency}ms)\`);
    } else {
      offlineCount++;
      console.log(\`  [\${i + 1}/\${CHANNELS.length}] \${ch.name}: ❌ OFFLINE\`);
    }
  }

  const output = {
    lastUpdate: new Date().toISOString(),
    total: CHANNELS.length,
    online: onlineCount,
    offline: offlineCount,
    statuses,
    latencies,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\\n');
  console.log(\`🏁 Concluído! \${onlineCount} Online | \${offlineCount} Offline. Salvo em \${OUTPUT_PATH}\`);
}

main().catch(console.error);`;
}

export function generateStatusJsonPreview(channels: Channel[], results: Record<string, any>): string {
  const onlineCount = channels.filter(c => results[c.id]?.online).length;
  const statuses: Record<string, string> = {};
  const latencies: Record<string, number> = {};

  channels.forEach(ch => {
    const isOnline = results[ch.id]?.online ?? true;
    statuses[ch.name] = isOnline ? 'online' : 'offline';
    latencies[ch.name] = results[ch.id]?.latency || (isOnline ? 180 : 0);
  });

  return JSON.stringify(
    {
      lastUpdate: new Date().toISOString(),
      total: channels.length,
      online: onlineCount || channels.length,
      offline: channels.length - (onlineCount || channels.length),
      statuses,
      latencies,
    },
    null,
    2
  );
}

export function generateReactHook(config: RepoConfig): string {
  const rawUrl = `https://raw.githubusercontent.com/${config.githubUser}/${config.repoName}/${config.branch || 'main'}/${config.statusFilePath || 'channels-status.json'}`;

  return `import { useState, useEffect, useCallback } from 'react';

export interface ChannelStatusPayload {
  lastUpdate: string;
  total: number;
  online: number;
  offline: number;
  statuses: Record<string, 'online' | 'offline'>;
  latencies?: Record<string, number>;
}

export function useChannelStatus() {
  const [status, setStatus] = useState<ChannelStatusPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('${rawUrl}?t=' + Date.now());
      if (!res.ok) throw new Error('Falha ao baixar status');
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isChannelOnline = (channelName: string): boolean => {
    if (!status) return true;
    return status.statuses[channelName] === 'online';
  };

  return { status, loading, error, isChannelOnline, reload: fetchStatus };
}`;
}

export function generateReadme(config: RepoConfig): string {
  return `# 📡 ${config.repoName}

Verificador automático de status de canais IPTV alimentado por GitHub Actions na nuvem.

## 🚀 Como Funciona
1. O GitHub Actions roda em agendamento cron no servidor Ubuntu.
2. Executa \`scripts/check-channels.js\` checando concorrência de pings.
3. Grava o resultado em \`${config.statusFilePath || 'channels-status.json'}\` via autocommit.
4. Seu aplicativo de Smart TV lê a URL RAW diretamente sem custo e sem travar.

## 📺 Consumo no App da TV
\`\`\`
https://raw.githubusercontent.com/${config.githubUser}/${config.repoName}/${config.branch || 'main'}/${config.statusFilePath || 'channels-status.json'}
\`\`\`
`;
}

export const generateCheckChannelsScript = (config?: Partial<RepoConfig>, channels?: Channel[]): string => {
  const defaultCfg: RepoConfig = {
    githubUser: config?.githubUser || 'viniciusmbs',
    repoName: config?.repoName || 'SatvApk',
    branch: config?.branch || 'main',
    cronPreset: 'every-6h',
    sourceType: 'json',
    m3uUrl: 'https://rdcanais.net',
    timeoutSeconds: 5,
    concurrency: 8,
    userAgent: 'SatvApk-IPTV-Bot/1.0',
    statusFilePath: 'channels-status.json',
    commitMessage: '🤖 Atualização automática do status dos canais IPTV',
  };
  return generateCheckerScript(defaultCfg, channels || []);
};

export const generateSampleStatusJson = (channels?: Channel[], results?: Record<string, any>): string => {
  return generateStatusJsonPreview(channels || [], results || {});
};

