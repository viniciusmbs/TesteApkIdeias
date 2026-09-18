import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  BrainCircuit,
  Trash2,
  X,
  User,
  Check,
  Copy,
  AlertCircle,
  HelpCircle,
  Tv,
} from 'lucide-react';
import { soundService } from '../services/soundService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingMode?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  channelCount: number;
  onlineCount: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onClose,
  channelCount,
  onlineCount,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou o assistente de IA integrado do **SatvApk IPTV Smart TV Player**.\n\nAtualmente você tem **${channelCount} canais** cadastrados e **${onlineCount} online**.\n\nComo posso te ajudar hoje? Posso sugerir canais, analisar problemas de conexão de streams, explicar formatos M3U ou dar dicas para o seu controle remoto!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'assistant' | 'technician' | 'curator'>('assistant');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const roleInstructions: Record<string, string> = {
    assistant:
      'Você é o assistente inteligente da plataforma SatvApk IPTV. Seja prestativo, claro e objetivo. Ajude os usuários a encontrar canais, tirar dúvidas sobre reprodução e recursos de TV.',
    technician:
      'Você é um especialista técnico em redes de transmissão de vídeo, streaming IPTV, HLS, TS, protocolos m3u8, proxies CORS, servidores Node.js e automação CI/CD com GitHub Actions. Forneça explicações técnicas detalhadas e soluções precisas.',
    curator:
      'Você é um curador e crítico de televisão e entretenimento. Forneça recomendações de programas, canais de esportes, notícias ao vivo, filmes e documentários disponíveis no ecossistema IPTV.',
  };

  const quickPrompts = [
    'Quais canais de esporte você recomenda?',
    'Como funciona a verificação automática no GitHub Actions?',
    'Por que alguns canais IPTV demoram para carregar?',
    'Como configurar o Ad-Shield no player?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    soundService.playSelect();
    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: roleInstructions[selectedRole],
          model: thinkingMode ? 'gemini-3.1-pro-preview' : selectedModel,
          thinkingMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter resposta do modelo');
      }

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          thinkingMode: data.thinkingEnabled,
        },
      ]);
    } catch (err: any) {
      console.error('Falha no chat:', err);
      setErrorMessage(err.message || 'Falha de comunicação com o assistente Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    soundService.playBack();
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Histórico de conversa limpo! Como posso te ajudar agora?',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-3xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-neutral-950 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Assistente IA Gemini IPTV</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Multiturno</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Respostas inteligentes para canais, streams, EPG e diagnósticos técnicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Limpar histórico"
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playBack();
                onClose();
              }}
              title="Fechar (ESC)"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar: Models & Thinking Mode */}
        <div className="px-5 py-2.5 border-b border-neutral-900 bg-neutral-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Models */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[11px]">Modelo:</span>
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedModel('gemini-3.5-flash');
                  setThinkingMode(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  !thinkingMode && selectedModel === 'gemini-3.5-flash'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Flash (Geral)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedModel('gemini-3.1-flash-lite');
                  setThinkingMode(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  !thinkingMode && selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Lite (Rápido)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedModel('gemini-3.1-pro-preview');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  !thinkingMode && selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pro (Complexo)
              </button>
            </div>
          </div>

          {/* Thinking Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                setThinkingMode(!thinkingMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                thinkingMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-950'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
              title="Ativa o modo de raciocínio profundo High Thinking com gemini-3.1-pro-preview"
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${thinkingMode ? 'text-purple-400 animate-pulse' : ''}`} />
              <span>Modo Pensamento (High Thinking)</span>
            </button>

            {/* Role Select */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] rounded-xl px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="assistant">Papel: Assistente Geral</option>
              <option value="technician">Papel: Técnico em Streaming</option>
              <option value="curator">Papel: Curador de Programas</option>
            </select>
          </div>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-neutral-950 shadow'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                  }`}
                >
                  {/* Thinking badge if used */}
                  {msg.thinkingMode && (
                    <div className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 w-fit mb-1 font-semibold">
                      <BrainCircuit className="w-3 h-3" />
                      <span>Raciocínio Profundo (Thinking Level High)</span>
                    </div>
                  )}

                  {/* Body text with paragraph breaks */}
                  <div className="whitespace-pre-wrap select-text font-sans">
                    {msg.content}
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between gap-4 pt-1 text-[10px] text-neutral-400 opacity-80">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {msg.modelUsed && (
                        <span className="font-mono text-[9px] bg-neutral-950/80 px-1.5 py-0.5 rounded border border-neutral-800">
                          {msg.modelUsed}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-white transition cursor-pointer"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-neutral-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2 rounded-tl-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  {thinkingMode ? (
                    <>
                      <BrainCircuit className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-purple-300 font-semibold">
                        Processando com Thinking Mode (gemini-3.1-pro-preview)...
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span>Gemini está gerando sua resposta...</span>
                    </>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Erro ao consultar a IA:</p>
                <p className="text-[11px] text-red-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2 border-t border-neutral-900 bg-neutral-900/30 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-neutral-500 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Sugestões:</span>
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-emerald-500/50 whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              thinkingMode
                ? 'Faça uma pergunta complexa para o Modo Pensamento...'
                : 'Converse com o assistente sobre canais, IPTV ou problemas...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-950"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
