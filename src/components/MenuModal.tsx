import React from 'react';
import {
  X,
  Tv,
  LayoutGrid,
  Rows3,
  Calendar,
  Zap,
  BarChart3,
  Image,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ViewMode, UiDensity } from '../types';
import { soundService } from '../services/soundService';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  uiDensity: UiDensity;
  onUiDensityChange: (density: UiDensity) => void;
  onOpenTester: () => void;
  onOpenAnalytics?: () => void;
  onOpenIcons: () => void;
  onExportM3U: () => void;
  onCopyM3U: () => void;
  onSyncGitHub: () => void;
  copiedM3U: boolean;
  isSyncing: boolean;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  uiDensity,
  onUiDensityChange,
  onOpenTester,
  onOpenAnalytics,
  onOpenIcons,
  onExportM3U,
  onCopyM3U,
  onSyncGitHub,
  copiedM3U,
  isSyncing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#690909]/20 border border-[#8c1010]/40 flex items-center justify-center text-[#ff6b6b]">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Menu Smart TV & Configurações</h3>
              <p className="text-xs text-neutral-400">Ajustes e ferramentas do reprodutor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundService.playBack();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Modo de Exibição da TV
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onViewModeChange('rows');
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
                viewMode === 'rows'
                  ? 'bg-[#690909] text-white font-bold border-[#8c1010] shadow-md shadow-[#690909]/30'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <Rows3 className="w-4 h-4" />
              <span>Carrosséis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onViewModeChange('grid');
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#690909] text-white font-bold border-[#8c1010] shadow-md shadow-[#690909]/30'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grade</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onViewModeChange('epg');
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
                viewMode === 'epg'
                  ? 'bg-[#690909] text-white font-bold border-[#8c1010] shadow-md shadow-[#690909]/30'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Guia EPG</span>
            </button>
          </div>
        </div>

        {/* Density */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Tamanho dos Cards
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'normal', 'large'] as UiDensity[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  soundService.playSelect();
                  onUiDensityChange(d);
                }}
                className={`py-2 rounded-xl border text-xs font-semibold capitalize transition cursor-pointer ${
                  uiDensity === d
                    ? 'bg-[#690909]/40 text-[#ff6b6b] border-[#8c1010] font-bold'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {d === 'compact' ? 'Compacto' : d === 'normal' ? 'Normal' : 'Grande'}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Ferramentas Incorporadas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Testador Incorporado */}
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onClose();
                onOpenTester();
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#8c1010] hover:bg-neutral-800 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">Testador de Canais</h4>
                <p className="text-[10px] text-neutral-400">Checar status, pings e URLs</p>
              </div>
            </button>

            {/* Analytics */}
            {onOpenAnalytics && (
              <button
                type="button"
                onClick={() => {
                  soundService.playSelect();
                  onClose();
                  onOpenAnalytics();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#8c1010] hover:bg-neutral-800 text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Analytics (GA4)</h4>
                  <p className="text-[10px] text-neutral-400">Métricas de cliques e cidades</p>
                </div>
              </button>
            )}

            {/* Ícones */}
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onClose();
                onOpenIcons();
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#8c1010] hover:bg-neutral-800 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Image className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">Logotipos dos Canais</h4>
                <p className="text-[10px] text-[#ff6b6b]">129 canais 100% mapeados</p>
              </div>
            </button>

            {/* Sincronizar GitHub */}
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                onSyncGitHub();
              }}
              disabled={isSyncing}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#8c1010] hover:bg-neutral-800 text-left transition cursor-pointer disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-xl bg-[#690909]/30 border border-[#8c1010]/50 flex items-center justify-center text-[#ff6b6b] shrink-0">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">Sincronizar GitHub</h4>
                <p className="text-[10px] text-neutral-400">Atualizar lista e status vivo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Export / Playlist actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onCopyM3U}
            className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedM3U ? <Check className="w-4 h-4 text-[#ff4d4d]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedM3U ? 'Copiado!' : 'Copiar Playlist M3U'}</span>
          </button>

          <button
            type="button"
            onClick={onExportM3U}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#690909] hover:bg-[#8c1010] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#690909]/40"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo .m3u</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
