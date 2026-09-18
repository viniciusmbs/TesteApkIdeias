/**
 * Mapeamento e gerador de logos de canais de TV brasileiros
 * Baseado no repositório oficial tv-logo/tv-logos e assets locais em /public/logos/
 */

import downloadedLogosJson from './downloadedLogos.json';

// Dicionário com caminhos dos 129 canais oficiais
export const LOCAL_CHANNEL_LOGOS: Record<string, string> = downloadedLogosJson as Record<string, string>;

// Mapeamento normalizado para buscas sem acentos ou variações
const NORMALIZED_MAP: Record<string, string> = {};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Popula o mapa normalizado
for (const [name, path] of Object.entries(LOCAL_CHANNEL_LOGOS)) {
  NORMALIZED_MAP[normalizeKey(name)] = path;
}

// Aliases e sinônimos frequentes
const ALIASES: Record<string, string> = {
  'globo': '/logos/globo-sp.png',
  'tvglobo': '/logos/globo-sp.png',
  'globosp': '/logos/globo-sp.png',
  'globorj': '/logos/globo-rj.png',
  'globomg': '/logos/globo-mg.png',
  'globoes': '/logos/globo-es.png',
  'sbt': '/logos/sbt.png',
  'record': '/logos/record-tv.png',
  'recordtv': '/logos/record-tv.png',
  'band': '/logos/band.png',
  'bandeirantes': '/logos/band.png',
  'redetv': '/logos/rede-tv.png',
  'tvcultura': '/logos/tv-cultura.png',
  'tvbrasil': '/logos/tv-brasil.png',
  'sportv': '/logos/sporttv.png',
  'sportv2': '/logos/sporttv-2.png',
  'sportv3': '/logos/sporttv-3.png',
  'sportv4': '/logos/sporttv-4.png',
  'sportv5': '/logos/sporttv-5.png',
  'sportv6': '/logos/sporttv-6.png',
  'premiere': '/logos/premiere.png',
  'premiereclubes': '/logos/premiere-clubes.png',
  'espn': '/logos/espn.png',
  'espn2': '/logos/espn-2.png',
  'espn3': '/logos/espn-3.png',
  'espn4': '/logos/espn-4.png',
  'espn5': '/logos/espn-5.png',
  'espn6': '/logos/espn-6.png',
  'telecine': '/logos/tele-cine-premium.png',
  'hbo': '/logos/hbo.png',
  'megapix': '/logos/megapix.png',
  'warner': '/logos/warner-channel.png',
  'disney': '/logos/disney-channel.png',
  'cartoon': '/logos/cartoon-network.png',
  'dazn': '/logos/dazn.png',
  'combate': '/logos/combate.png',
  'cnn': '/logos/cnn-brasil.png',
  'globonews': '/logos/globo-news.png',
};

for (const [alias, path] of Object.entries(ALIASES)) {
  NORMALIZED_MAP[normalizeKey(alias)] = path;
}

/**
 * Retorna a URL do logotipo de um canal.
 * Prioriza os logos locais mapeados de alta qualidade.
 */
export function getChannelLogo(channelName: string): string {
  if (!channelName) return getFallbackSvg('TV');

  // 1. Busca exata no dicionário
  if (LOCAL_CHANNEL_LOGOS[channelName]) {
    return LOCAL_CHANNEL_LOGOS[channelName];
  }

  // 2. Busca pela chave normalizada (sem acentos/espaços)
  const norm = normalizeKey(channelName);
  if (NORMALIZED_MAP[norm]) {
    return NORMALIZED_MAP[norm];
  }

  // 3. Busca por substring nos nomes conhecidos
  for (const [key, path] of Object.entries(NORMALIZED_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return path;
    }
  }

  // 4. Fallback gerado matematicamente com SVG de alto contraste
  return getFallbackSvg(channelName);
}

/**
 * Gera um SVG elegante de fallback caso a imagem não exista
 */
export function getFallbackSvg(channelName: string): string {
  const cleanName = channelName.trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'TV';
  const colors = [
    { bg: '#064e3b', stroke: '#10b981', text: '#34d399' }, // Emerald
    { bg: '#1e3a8a', stroke: '#3b82f6', text: '#60a5fa' }, // Blue
    { bg: '#581c87', stroke: '#a855f7', text: '#c084fc' }, // Purple
    { bg: '#831843', stroke: '#ec4899', text: '#f472b6' }, // Pink
    { bg: '#78350f', stroke: '#f59e0b', text: '#fbbf24' }, // Amber
    { bg: '#164e63', stroke: '#06b6d4', text: '#22d3ee' }, // Cyan
  ];

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorScheme = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" rx="28" fill="#141414" stroke="#262626" stroke-width="2"/>
    <circle cx="60" cy="60" r="42" fill="${colorScheme.bg}" stroke="${colorScheme.stroke}" stroke-width="2.5"/>
    <text x="60" y="70" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="38" fill="${colorScheme.text}" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Estatísticas sobre os logotipos mapeados
 */
export function getLogoStats() {
  const total = Object.keys(LOCAL_CHANNEL_LOGOS).length;
  return {
    totalMapped: total,
    source: 'tv-logo / official assets',
  };
}
