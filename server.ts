import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Checagem de stream individual (com timeout)
app.post('/api/check-stream', async (req, res) => {
  const { url, timeout = 6000 } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Range: 'bytes=0-1024',
      },
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const isOnline = response.ok || (response.status >= 200 && response.status < 400);

    return res.json({
      online: isOnline,
      status: response.status,
      latency,
      url,
    });
  } catch (err: any) {
    const latency = Date.now() - start;
    return res.json({
      online: false,
      status: err.name === 'AbortError' ? 408 : 500,
      latency,
      url,
      error: err.message,
    });
  }
});

// Salvar channels-status.json
app.post('/api/save-status', (req, res) => {
  try {
    const statusData = req.body;
    const filePath = path.join(process.cwd(), 'channels-status.json');
    fs.writeFileSync(filePath, JSON.stringify(statusData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Status salvo com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Disparar robô no servidor
app.post('/api/run-check', async (req, res) => {
  try {
    const statusFilePath = path.join(process.cwd(), 'channels-status.json');
    let currentStatus: any = {
      lastUpdate: new Date().toISOString(),
      total: 0,
      online: 0,
      offline: 0,
      statuses: {},
      latencies: {},
    };

    if (fs.existsSync(statusFilePath)) {
      currentStatus = JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
    }

    currentStatus.lastUpdate = new Date().toISOString();
    fs.writeFileSync(statusFilePath, JSON.stringify(currentStatus, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'Robô finalizou checagem com sucesso',
      data: currentStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics tracking
app.post('/api/analytics/track', (req, res) => {
  try {
    const event = req.body;
    const analyticsPath = path.join(process.cwd(), 'analytics-summary.json');
    let summary: any = {
      totalClicks: 0,
      uniqueLinks: 0,
      uniqueCities: 0,
      ga4EventsFired: 0,
      lastUpdate: new Date().toISOString(),
      clicksByCity: [],
      clicksByRegion: [],
      clicksByLink: [],
      recentClicks: [],
    };

    if (fs.existsSync(analyticsPath)) {
      summary = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
    }

    summary.totalClicks = (summary.totalClicks || 0) + 1;
    summary.ga4EventsFired = (summary.ga4EventsFired || 0) + 1;
    summary.lastUpdate = new Date().toISOString();

    // Link
    summary.clicksByLink = summary.clicksByLink || [];
    const linkIdx = summary.clicksByLink.findIndex((l: any) => l.linkId === event.linkId);
    if (linkIdx >= 0) {
      summary.clicksByLink[linkIdx].count += 1;
      summary.clicksByLink[linkIdx].lastClicked = event.timestamp || new Date().toISOString();
    } else {
      summary.clicksByLink.push({
        linkId: event.linkId,
        linkName: event.linkName,
        linkUrl: event.linkUrl,
        category: event.category || 'Geral',
        count: 1,
        lastClicked: event.timestamp || new Date().toISOString(),
      });
    }

    // City
    if (event.city && event.city !== 'Desconhecida') {
      summary.clicksByCity = summary.clicksByCity || [];
      const cityIdx = summary.clicksByCity.findIndex((c: any) => c.city.toLowerCase() === event.city.toLowerCase());
      if (cityIdx >= 0) {
        summary.clicksByCity[cityIdx].count += 1;
      } else {
        summary.clicksByCity.push({
          city: event.city,
          state: event.state || 'SP',
          region: event.region || 'Sudeste',
          country: event.country || 'Brasil',
          count: 1,
          percentage: 0,
        });
      }

      summary.clicksByCity.forEach((c: any) => {
        c.percentage = Number(((c.count / summary.totalClicks) * 100).toFixed(1));
      });
      summary.clicksByCity.sort((a: any, b: any) => b.count - a.count);
    }

    // Recent clicks
    summary.recentClicks = summary.recentClicks || [];
    summary.recentClicks.unshift(event);
    if (summary.recentClicks.length > 100) {
      summary.recentClicks = summary.recentClicks.slice(0, 100);
    }

    fs.writeFileSync(analyticsPath, JSON.stringify(summary, null, 2), 'utf-8');
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics summary
app.get('/api/analytics/summary', (req, res) => {
  try {
    const analyticsPath = path.join(process.cwd(), 'analytics-summary.json');
    if (fs.existsSync(analyticsPath)) {
      const summary = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      return res.json(summary);
    }
    return res.json({
      totalClicks: 0,
      uniqueLinks: 0,
      uniqueCities: 0,
      ga4EventsFired: 0,
      lastUpdate: new Date().toISOString(),
      clicksByCity: [],
      clicksByRegion: [],
      clicksByLink: [],
      recentClicks: [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics reset
app.post('/api/analytics/reset', (req, res) => {
  try {
    const analyticsPath = path.join(process.cwd(), 'analytics-summary.json');
    const emptySummary = {
      totalClicks: 0,
      uniqueLinks: 0,
      uniqueCities: 0,
      ga4EventsFired: 0,
      lastUpdate: new Date().toISOString(),
      clicksByCity: [],
      clicksByRegion: [],
      clicksByLink: [],
      recentClicks: [],
    };
    fs.writeFileSync(analyticsPath, JSON.stringify(emptySummary, null, 2), 'utf-8');
    res.json({ success: true, summary: emptySummary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Gemini AI Assistant Chatbot API
// Multi-turn conversation, role system instructions, model selection,
// and Thinking Mode with gemini-3.1-pro-preview & ThinkingLevel.HIGH
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.5-flash',
      thinkingMode = false,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Array de mensagens é obrigatório' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor. Por favor, configure a chave de API.',
      });
    }

    // Formata o histórico no padrão contents do SDK
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Determina o modelo e a configuração de pensamento
    let targetModel = model;
    const config: any = {
      systemInstruction:
        systemInstruction ||
        'Você é o assistente inteligente do aplicativo SatvApk IPTV Smart TV Player. Você ajuda o usuário com recomendações de canais, explicações sobre IPTV, sintaxe de playlists M3U, configurações de controle remoto e resolução de problemas de transmissão.',
    };

    if (thinkingMode) {
      targetModel = 'gemini-3.1-pro-preview';
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Nota: Não definir maxOutputTokens quando ThinkingLevel.HIGH estiver ativado
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || 'Sem resposta do modelo.';

    return res.json({
      text: replyText,
      modelUsed: targetModel,
      thinkingEnabled: Boolean(thinkingMode),
    });
  } catch (err: any) {
    console.error('Erro na API Gemini:', err);
    return res.status(500).json({
      error: err.message || 'Falha ao processar mensagem com Gemini',
    });
  }
});

// -------------------------------------------------------------
// Vite middleware e inicialização
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SatvApk IPTV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
