/**
 * Serviço de Guia Eletrônico de Programação (EPG)
 * Gera grades de programação em tempo real para os canais
 */

export interface ProgramItem {
  title: string;
  desc: string;
  start: string;
  stop: string;
  progressPercent: number;
}

export interface ChannelEpg {
  currentProgram: ProgramItem;
  nextProgram: ProgramItem;
}

const GENRE_PROGRAMS: Record<string, Array<{ title: string; desc: string }>> = {
  Abertos: [
    { title: 'Jornal Nacional Ao Vivo', desc: 'As principais notícias do Brasil e do mundo com cobertura em tempo real.' },
    { title: 'Novela das Nove', desc: 'Capítulo especial com reviravoltas e emoções.' },
    { title: 'Show de Entretenimento', desc: 'Auditório, convidados especiais e atrações musicais ao vivo.' },
    { title: 'Globo Repórter Especial', desc: 'Grandes reportagens investigativas e documentários especiais.' },
  ],
  Esportes: [
    { title: 'Campeonato Brasileiro Série A (Ao Vivo)', desc: 'Transmissão da rodada com pré-jogo, lances e análise tática.' },
    { title: 'Futebol Debate e Melhores Momentos', desc: 'Mesa redonda com os principais comentaristas e replays.' },
    { title: 'SportsCenter / Giro dos Campeonatos', desc: 'Destaques do futebol internacional, NBA, Fórmula 1 e UFC.' },
    { title: 'Pré-Jogo e Coletivas', desc: 'Entrevistas exclusivas e escalações oficiais diretamente dos estádios.' },
  ],
  'Filmes e Séries': [
    { title: 'Cine Pipoca: Grande Estreia', desc: 'Filme premiado em alta definição com áudio 5.1.' },
    { title: 'Série Exclusiva: Temporada Completa', desc: 'Episódio inédito com suspense e ação ininterrupta.' },
    { title: 'Festival de Cinema e Ficção', desc: 'Clássicos consagrados e sucessos de bilheteria mundial.' },
  ],
  Documentários: [
    { title: 'Planeta Selvagem em 4K', desc: 'Expedição pelas florestas tropicais e grandes predadores da África.' },
    { title: 'Mistérios da História', desc: 'Documentário investigativo sobre civilizações antigas e monumentos.' },
    { title: 'Engenharia Extrema', desc: 'Mega construções, túneis e arranha-céus que desafiam a física.' },
  ],
  Notícias: [
    { title: 'Edição das Notícias Ao Vivo', desc: 'Giro de repórteres em Brasília, São Paulo e correspondentes internacionais.' },
    { title: 'Boletim Econômico e Mercado', desc: 'Análise financeira, cotação do dólar e fechamento das bolsas.' },
  ],
  Infantis: [
    { title: 'Aventuras Animadas', desc: 'Episódio inédito com muita diversão e aventuras para as crianças.' },
    { title: 'Clube dos Desenhos', desc: 'Maratona com os personagens favoritos da garotada.' },
  ],
  Música: [
    { title: 'Show Ao Vivo: Grandes Festivais', desc: 'Apresentações históricas e bastidores de grandes turnês mundiais.' },
    { title: 'Top Hits & Videoclipes', desc: 'As faixas mais tocadas nas paradas do Brasil e do mundo.' },
  ],
  Religiosos: [
    { title: 'Transmissão e Palavra de Fé', desc: 'Mensagens de esperança, reflexão espiritual e orações ao vivo.' },
    { title: 'Momento de Oração e Louvor', desc: 'Canções e testemunhos que inspiram sua fé.' },
  ],
  Variedades: [
    { title: 'Culinária Prática & Sabores', desc: 'Receitas fáceis, dicas gastronômicas e segredos de chefs.' },
    { title: 'Talk Show Descontraído', desc: 'Humor, entrevistas inteligentes e quadros interativos.' },
  ],
};

export const epgService = {
  getChannelEpg(channelName: string, channelGroup: string = 'Geral'): ChannelEpg {
    const groupKey = Object.keys(GENRE_PROGRAMS).find(g => channelGroup.includes(g)) || 'Abertos';
    const list = GENRE_PROGRAMS[groupKey] || GENRE_PROGRAMS.Abertos;

    const hash = Math.abs(
      channelName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    const curIdx = hash % list.length;
    const nextIdx = (curIdx + 1) % list.length;

    const now = new Date();
    const curMin = now.getMinutes();
    const curHour = now.getHours();

    const startSlot = curMin < 30 ? 0 : 30;
    const endSlot = startSlot === 0 ? 30 : 0;
    const nextHour = startSlot === 30 ? (curHour + 1) % 24 : curHour;
    const nextEndHour = endSlot === 0 ? (nextHour + 1) % 24 : nextHour;

    const startStr = `${String(curHour).padStart(2, '0')}:${String(startSlot).padStart(2, '0')}`;
    const endStr = `${String(nextHour).padStart(2, '0')}:${String(endSlot).padStart(2, '0')}`;
    const nextEndStr = `${String(nextEndHour).padStart(2, '0')}:${String(endSlot === 0 ? 30 : 0).padStart(2, '0')}`;

    const progressMinutes = curMin - startSlot;
    const progressPercent = Math.min(100, Math.max(5, Math.round((progressMinutes / 30) * 100)));

    return {
      currentProgram: {
        title: `${channelName}: ${list[curIdx].title}`,
        desc: list[curIdx].desc,
        start: startStr,
        stop: endStr,
        progressPercent,
      },
      nextProgram: {
        title: list[nextIdx].title,
        desc: list[nextIdx].desc,
        start: endStr,
        stop: nextEndStr,
        progressPercent: 0,
      },
    };
  },
};
