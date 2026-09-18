import React, { useState, useMemo } from 'react';
import {
  X,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Search,
  Check,
  Sparkles,
  ExternalLink,
  Copy,
  Download,
  Filter,
} from 'lucide-react';
import { Channel } from '../types/iptv';
import { getChannelLogo, getFallbackSvg, LOCAL_CHANNEL_LOGOS } from '../data/channelLogos';
import { soundService } from '../services/soundService';

interface IconManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  customLogos: Record<string, string>;
  onSaveCustomLogo: (channelName: string, logoUrl: string) => void;
  onResetAllLogos: () => void;
}

export const IconManagerModal: React.FC<IconManagerModalProps> = ({
  isOpen,
  onClose,
  channels,
  customLogos,
  onSaveCustomLogo,
  onResetAllLogos,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Categorias disponíveis
  const groups = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      if (c.group) set.add(c.group);
    });
    return Array.from(set).sort();
  }, [channels]);

  // Contagem de customizados vs oficiais
  const customCount = Object.keys(customLogos).length;
  const officialCount = Object.keys(LOCAL_CHANNEL_LOGOS).length;

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.group?.toLowerCase().includes(search.toLowerCase());
      const matchGroup = selectedGroup === 'all' || c.group === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [channels, search, selectedGroup]);

  if (!isOpen) return null;

  const handleSelectToEdit = (channel: Channel) => {
    soundService.playSelect();
    setEditingChannel(channel);
    setInputUrl(customLogos[channel.name] || channel.logo || getChannelLogo(channel.name));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    if (!editingChannel) return;
    soundService.playSelect();
    onSaveCustomLogo(editingChannel.name, inputUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetCurrent = () => {
    if (!editingChannel) return;
    soundService.playSelect();
    const defaultLogo = getChannelLogo(editingChannel.name);
    setInputUrl(defaultLogo);
    onSaveCustomLogo(editingChannel.name, '');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyUrl = (url: string, label: string) => {
    soundService.playSelect();
    navigator.clipboard.writeText(url);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  const handleExportJson = () => {
    soundService.playSelect();
    const map: Record<string, string> = {};
    channels.forEach((c) => {
      map[c.name] = customLogos[c.name] || c.logo || getChannelLogo(c.name);
    });
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'satv-logos-mapping.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#690909]/20 border border-[#8c1010]/40 flex items-center justify-center text-[#ff6b6b] shadow-inner">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Gerenciador de Logotipos dos Canais</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#690909]/20 border border-[#8c1010]/30 text-[10px] text-[#ff6b6b] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {channels.length} CANAIS MAPEADOS
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Logotipos em alta resolução (PNG transparente / SVG) pré-carregados localmente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundService.playBack();
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats banner */}
        <div className="bg-neutral-950/40 border-b border-neutral-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-neutral-300">
            <span>
              <strong className="text-[#ff6b6b]">{channels.length}</strong> canais na lista
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#ff6b6b]">{officialCount}</strong> logos oficiais mapeados
            </span>
            {customCount > 0 && (
              <>
                <span>•</span>
                <span>
                  <strong className="text-purple-400">{customCount}</strong> personalizados por você
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition cursor-pointer"
              title="Exportar mapeamento JSON de todos os logos"
            >
              <Download className="w-3.5 h-3.5 text-[#ff6b6b]" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Edit Box */}
          {editingChannel && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-[#8c1010]/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Editar Logo do Canal:</span>
                  <span className="px-2 py-0.5 rounded bg-[#690909]/20 border border-[#8c1010]/30 text-[#ff6b6b] text-xs font-mono font-bold">
                    {editingChannel.name}
                  </span>
                  <span className="text-[10px] text-neutral-500">({editingChannel.group})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                  Fechar editor
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="URL do logotipo (ex: /logos/band.png, https://... ou data:image/svg+xml...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#8c1010] outline-none"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-[#690909] hover:bg-[#8c1010] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{savedSuccess ? 'Salvo!' : 'Aplicar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCurrent}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
                    title="Restaurar para o logotipo padrão oficial"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              {inputUrl && (
                <div className="flex items-center gap-4 p-3 bg-neutral-900/80 rounded-xl border border-neutral-800/80">
                  <div className="w-16 h-12 rounded-lg bg-neutral-950 flex items-center justify-center p-1 border border-neutral-800 shrink-0">
                    <img
                      src={inputUrl}
                      alt={editingChannel.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackSvg(editingChannel.name);
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-300 truncate">
                      Prévia renderizada em fundo escuro (Smart TV)
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">
                      {inputUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(inputUrl, editingChannel.name)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                    title="Copiar link do logo"
                  >
                    {copiedNotification === editingChannel.name ? (
                      <Check className="w-3.5 h-3.5 text-[#ff4d4d]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filters Bar: Search & Category Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar canal por nome ou categoria..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#8c1010] outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  soundService.playSelect();
                  setSelectedGroup('all');
                }}
                className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap border ${
                  selectedGroup === 'all'
                    ? 'bg-[#690909] text-white border-[#8c1010] shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Todos ({channels.length})
              </button>

              {groups.map((g) => {
                const count = channels.filter((c) => c.group === g).length;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      soundService.playSelect();
                      setSelectedGroup(g);
                    }}
                    className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap border ${
                      selectedGroup === g
                        ? 'bg-[#690909] text-white border-[#8c1010] shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {g} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredChannels.map((ch) => {
              const isCustom = Boolean(customLogos[ch.name]);
              const logoSrc = customLogos[ch.name] || ch.logo || getChannelLogo(ch.name);
              const isSelected = editingChannel?.id === ch.id;

              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectToEdit(ch)}
                  className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-950 border-[#8c1010] shadow-md ring-1 ring-[#8c1010]/50'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-[#8c1010]/60 hover:bg-neutral-900/60'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="w-full flex items-center justify-between text-[9px] mb-1">
                    <span className="text-neutral-500 truncate max-w-[80px]">{ch.group}</span>
                    {isCustom && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                        Personalizado
                      </span>
                    )}
                  </div>

                  {/* Logo Center */}
                  <div className="w-full h-14 flex items-center justify-center p-1 my-1">
                    <img
                      src={logoSrc}
                      alt={ch.name}
                      loading="lazy"
                      className="max-h-full max-w-[85%] object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackSvg(ch.name);
                      }}
                    />
                  </div>

                  {/* Channel Name */}
                  <h4 className="w-full text-center text-xs font-bold text-white truncate group-hover:text-[#ff9999] mt-1">
                    {ch.name}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundService.playBack();
              onResetAllLogos();
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Todos para Logos Oficiais</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playBack();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconManagerModal;
