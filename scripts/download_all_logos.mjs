import fs from 'fs';
import path from 'path';
import https from 'https';

const LOGO_DIR = path.resolve('public/logos');
if (!fs.existsSync(LOGO_DIR)) {
  fs.mkdirSync(LOGO_DIR, { recursive: true });
}

// Mapeamento específico de canais para caminhos de logo no tv-logo/tv-logos ou CDNs confiáveis
const TV_LOGO_BASE = 'https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries';

const MANUAL_MAP = {
  // Abertos
  'Band': `${TV_LOGO_BASE}/brazil/band-br.png`,
  'Band SP': `${TV_LOGO_BASE}/brazil/band-br.png`,
  'INTEGRAÇÃO JUIZ DE FORA': `${TV_LOGO_BASE}/brazil/globo-br.png`,
  'Globo MG': `${TV_LOGO_BASE}/brazil/globo-br.png`,
  'Globo ES': `${TV_LOGO_BASE}/brazil/globo-br.png`,
  'Globo RJ': `${TV_LOGO_BASE}/brazil/globo-br.png`,
  'Globo SP': `${TV_LOGO_BASE}/brazil/globo-br.png`,
  'Futura': `${TV_LOGO_BASE}/brazil/futura-br.png`,
  'Record MG': `${TV_LOGO_BASE}/brazil/record-br.png`,
  'Record TV': `${TV_LOGO_BASE}/brazil/record-br.png`,
  'Rede TV': `${TV_LOGO_BASE}/brazil/rede-tv-br.png`,
  'SBT MG ALTEROSA': `${TV_LOGO_BASE}/brazil/sbt-br.png`,
  'SBT': `${TV_LOGO_BASE}/brazil/sbt-br.png`,
  'TV Brasil': `${TV_LOGO_BASE}/brazil/tv-brasil-br.png`,
  'TV Cultura': `${TV_LOGO_BASE}/brazil/tv-cultura-br.png`,

  // Documentários
  'Agro+': `${TV_LOGO_BASE}/brazil/agro-mais-br.png`,
  'Animal Planet': `${TV_LOGO_BASE}/international/animal-planet-int.png`,
  'Arte 1': `${TV_LOGO_BASE}/brazil/arte1-br.png`,
  'Curta!': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Curta%21_logo.png/320px-Curta%21_logo.png',
  'Discovery Channel': `${TV_LOGO_BASE}/united-states/discovery-channel-us.png`,
  'Discovery H&H': 'https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/mexico/discovery-home-and-health-mx.png',
  'Discovery Science': `${TV_LOGO_BASE}/united-states/discovery-science-us.png`,
  'Discovery Theater': `${TV_LOGO_BASE}/united-states/discovery-channel-us.png`,
  'Discovery Turbo': `${TV_LOGO_BASE}/brazil/discovery-turbo-br.png`,
  'Discovery World': `${TV_LOGO_BASE}/united-states/discovery-channel-us.png`,
  'Dog TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/DogTV_Logo.png/320px-DogTV_Logo.png',
  'Fish TV': `${TV_LOGO_BASE}/brazil/fish-tv-br.png`,
  'Food Network': `${TV_LOGO_BASE}/united-states/food-network-us.png`,
  'HGTV': `${TV_LOGO_BASE}/united-states/hgtv-us.png`,
  'History 2': `${TV_LOGO_BASE}/united-states/history-channel-2-us.png`,
  'History Channel': `${TV_LOGO_BASE}/united-states/history-channel-us.png`,
  'Investigação Discovery': `${TV_LOGO_BASE}/united-states/investigation-discovery-us.png`,
  'NatGeo Wild': 'https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/nat-geo-wild-uk.png',
  'National Geographic': `${TV_LOGO_BASE}/united-states/national-geographic-us.png`,
  'TLC': `${TV_LOGO_BASE}/united-states/tlc-us.png`,
  'Travel Box Brasil': `${TV_LOGO_BASE}/brazil/prime-box-brazil-br.png`,

  // Esportes
  'Band Sports': `${TV_LOGO_BASE}/brazil/band-sports-br.png`,
  'Combate': 'https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/brazil/ge-tv-br.png',
  'DAZN': `${TV_LOGO_BASE}/international/dazn-int.png`,
  'DAZN 2': `${TV_LOGO_BASE}/international/dazn-int.png`,
  'DAZN 3': `${TV_LOGO_BASE}/international/dazn-int.png`,
  'DAZN 4': `${TV_LOGO_BASE}/international/dazn-int.png`,
  'ESPN': `${TV_LOGO_BASE}/united-states/espn-us.png`,
  'ESPN 2': `${TV_LOGO_BASE}/united-states/espn-2-us.png`,
  'ESPN 3': `${TV_LOGO_BASE}/united-states/espn-3-us.png`,
  'ESPN 4': `${TV_LOGO_BASE}/brazil/espn-4-br.png`,
  'ESPN 5': `${TV_LOGO_BASE}/brazil/espn-5-br.png`,
  'ESPN 6': `${TV_LOGO_BASE}/brazil/espn-extra-br.png`,
  'Fox Sports': `${TV_LOGO_BASE}/united-states/fox-sports-us.png`,
  'Fox Sports 2': `${TV_LOGO_BASE}/brazil/fox-sports-2-br.png`,
  'Premiere': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 2': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 3': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 4': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 5': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 6': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere 7': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'Premiere Clubes': `${TV_LOGO_BASE}/brazil/premiere-br.png`,
  'SportTV': `${TV_LOGO_BASE}/brazil/sportv-br.png`,
  'SportTV 2': `${TV_LOGO_BASE}/brazil/sportv2-br.png`,
  'SportTV 3': `${TV_LOGO_BASE}/brazil/sportv3-br.png`,
  'SportTV 4': `${TV_LOGO_BASE}/brazil/sportv-br.png`,
  'SportTV 5': `${TV_LOGO_BASE}/brazil/sportv2-br.png`,
  'SportTV 6': `${TV_LOGO_BASE}/brazil/sportv3-br.png`,
  'Off': `${TV_LOGO_BASE}/brazil/canal-off-br.png`,

  // Filmes e Séries
  'A&E': `${TV_LOGO_BASE}/brazil/a-and-e-br.png`,
  'AMC': `${TV_LOGO_BASE}/united-states/amc-us.png`,
  'Art 1': `${TV_LOGO_BASE}/brazil/arte1-br.png`,
  'AXN': `${TV_LOGO_BASE}/brazil/axn-br.png`,
  'Canal Brasil': `${TV_LOGO_BASE}/brazil/canal-brasil-br.png`,
  'Cinemax': `${TV_LOGO_BASE}/brazil/cinemax-br.png`,
  'HBO': `${TV_LOGO_BASE}/brazil/hbo-br.png`,
  'HBO 2': `${TV_LOGO_BASE}/brazil/hbo-2-br.png`,
  'HBO Family': `${TV_LOGO_BASE}/brazil/hbo-family-br.png`,
  'HBO Mundi': `${TV_LOGO_BASE}/brazil/hbo-mundi-br.png`,
  'HBO Plus': `${TV_LOGO_BASE}/brazil/hbo-plus-br.png`,
  'HBO Pop': `${TV_LOGO_BASE}/brazil/hbo-pop-br.png`,
  'HBO Signature': `${TV_LOGO_BASE}/brazil/hbo-signature-br.png`,
  'HBO Xtreme': `${TV_LOGO_BASE}/brazil/hbo-xtreme-br.png`,
  'Megapix': `${TV_LOGO_BASE}/brazil/megapix-br.png`,
  'Paramount': `${TV_LOGO_BASE}/brazil/paramount-network-br.png`,
  'Sony Channel': `${TV_LOGO_BASE}/brazil/sony-channel-br.png`,
  'Space': `${TV_LOGO_BASE}/brazil/space-br.png`,
  'TCM': `${TV_LOGO_BASE}/brazil/tcm-br.png`,
  'TNT': `${TV_LOGO_BASE}/brazil/tnt-br.png`,
  'TNT Series': `${TV_LOGO_BASE}/brazil/tnt-series-br.png`,
  'Telecine Action': `${TV_LOGO_BASE}/brazil/tele-cine-action-br.png`,
  'Telecine Cult': `${TV_LOGO_BASE}/brazil/tele-cine-cult-br.png`,
  'Telecine Fun': `${TV_LOGO_BASE}/brazil/tele-cine-fun-br.png`,
  'Telecine Pipoca': `${TV_LOGO_BASE}/brazil/tele-cine-pipoca-br.png`,
  'Telecine Premium': `${TV_LOGO_BASE}/brazil/tele-cine-premium-br.png`,
  'Telecine Touch': `${TV_LOGO_BASE}/brazil/tele-cine-touch-br.png`,
  'Universal TV': `${TV_LOGO_BASE}/brazil/universal-tv-br.png`,
  'Warner Channel': `${TV_LOGO_BASE}/brazil/warner-channel-br.png`,

  // Infantis
  'Cartoon Network': `${TV_LOGO_BASE}/brazil/cartoon-network-br.png`,
  'Cartoonito': `${TV_LOGO_BASE}/brazil/cartoonito-br.png`,
  'Discovery Kids': `${TV_LOGO_BASE}/brazil/discovery-kids-br.png`,
  'Disney Channel': `${TV_LOGO_BASE}/united-states/disney-channel-us.png`,
  'Disney Junior': `${TV_LOGO_BASE}/united-states/disney-jr-us.png`,
  'Gloob': `${TV_LOGO_BASE}/brazil/gloob-br.png`,
  'Gloobinho': `${TV_LOGO_BASE}/brazil/gloobinho-br.png`,
  'Nickelodeon': `${TV_LOGO_BASE}/united-states/nickelodeon-us.png`,
  'Tooncast': `${TV_LOGO_BASE}/brazil/tooncast-br.png`,
  'Zoomoo': `${TV_LOGO_BASE}/brazil/zoomoo-br.png`,

  // Música
  'Bis': `${TV_LOGO_BASE}/brazil/bis-br.png`,
  'MTV': `${TV_LOGO_BASE}/united-states/mtv-us.png`,
  'MTV Live': `${TV_LOGO_BASE}/united-states/mtv-live-us.png`,
  'Music Box Brasil': `${TV_LOGO_BASE}/brazil/prime-box-brazil-br.png`,

  // Notícias
  'BandNews': `${TV_LOGO_BASE}/brazil/band-news-br.png`,
  'CNN Brasil': `${TV_LOGO_BASE}/brazil/cnn-brasil-br.png`,
  'GloboNews': `${TV_LOGO_BASE}/brazil/globo-news-br.png`,
  'Jovem Pan News': `${TV_LOGO_BASE}/brazil/jovem-pan-news-br.png`,
  'Record News': `${TV_LOGO_BASE}/brazil/record-news-br.png`,

  // Religiosos
  'Canção Nova': `${TV_LOGO_BASE}/brazil/cancao-nova-tv-br.png`,
  'Gospel Movies': `${TV_LOGO_BASE}/brazil/rede-gospel-br.png`,
  'Novo Tempo': `${TV_LOGO_BASE}/brazil/novo-tempo-br.png`,
  'Rede Gospel': `${TV_LOGO_BASE}/brazil/rede-gospel-br.png`,
  'Rede Século 21': `${TV_LOGO_BASE}/brazil/rede-vida-br.png`,
  'Rede Super': `${TV_LOGO_BASE}/brazil/rede-gospel-br.png`,
  'Rede Vida': `${TV_LOGO_BASE}/brazil/rede-vida-br.png`,
  'TV Aparecida': `${TV_LOGO_BASE}/brazil/tv-aparecida-br.png`,
  'TV Pai Eterno': `${TV_LOGO_BASE}/brazil/tv-pai-eterno-br.png`,

  // Variedades
  'Comedy Central': `${TV_LOGO_BASE}/united-states/comedy-central-us.png`,
  'E!': `${TV_LOGO_BASE}/united-states/e-entertainment-us.png`,
  'GNT': `${TV_LOGO_BASE}/brazil/gnt-br.png`,
  'Multishow': `${TV_LOGO_BASE}/brazil/multishow-br.png`,
  'TNT Novelas': `${TV_LOGO_BASE}/brazil/tnt-br.png`,
  'Viva': `${TV_LOGO_BASE}/brazil/globoplay-novelas-br.png`,
  'Woohoo': `${TV_LOGO_BASE}/brazil/woohoo-br.png`,
};

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) {
        console.warn(`Failed ${res.statusCode} for ${url}`);
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      console.warn(`Error for ${url}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Iniciando download dos logos...');
  const mapping = {};

  const entries = Object.entries(MANUAL_MAP);
  let successCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const [name, url] = entries[i];
    const slug = slugify(name);
    const dest = path.join(LOGO_DIR, `${slug}.png`);

    process.stdout.write(`[${i + 1}/${entries.length}] ${name} -> `);
    const ok = await downloadFile(url, dest);
    if (ok) {
      console.log(`OK (/logos/${slug}.png)`);
      mapping[name] = `/logos/${slug}.png`;
      successCount++;
    } else {
      console.log(`FALHA`);
    }
  }

  console.log(`\nFinalizado: ${successCount}/${entries.length} logos baixados com sucesso!`);
  fs.writeFileSync('./src/data/downloadedLogos.json', JSON.stringify(mapping, null, 2));
}

run();
