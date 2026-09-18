import React, { useState, useEffect } from 'react';
import {
  Tv,
  LayoutGrid,
  Rows3,
  Calendar,
  Search,
  Menu,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { ViewMode } from '../types';
import { soundService } from '../services/soundService';

export interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenTester?: () => void;
  onOpenAnalytics?: () => void;
  onOpenIcons?: () => void;
  onOpenMenu: () => void;
  onFocusSearch?: () => void;
  totalChannels?: number;
  onlineChannels?: number;
  channelCount?: number;
  onlineCount?: number;
  activeTab?: 'tv' | 'tester' | 'analytics' | 'github' | 'generator';
  onTabChange?: (tab: 'tv' | 'tester' | 'analytics' | 'github' | 'generator') => void;
  onOpenChat?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenMenu,
  onFocusSearch,
  totalChannels,
  onlineChannels,
  channelCount,
  onlineCount,
  searchQuery = '',
  onSearchChange,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [time, setTime] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const displayTotal = totalChannels ?? channelCount ?? 0;
  const displayOnline = onlineChannels ?? onlineCount ?? 0;

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSound = () => {
    if (onToggleSound) {
      onToggleSound();
    } else {
      soundService.toggle();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2.5">
      {/* Brand & Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 group select-none text-left">
          <div className="w-10 h-10 rounded-2xl bg-[#690909] border border-[#8c1010]/60 flex items-center justify-center shadow-lg shadow-[#690909]/50 group-hover:scale-105 transition">
            <Tv className="w-5 h-5 text-white font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                SatvApk <span className="text-[#ff4d4d] font-extrabold">IPTV</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#690909]/25 border border-[#690909]/50 text-[#ff6b6b] text-[10px] font-bold">
                <Radio className="w-3 h-3 animate-pulse text-[#ff4d4d]" />
                {displayOnline}/{displayTotal} ONLINE
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden md:block">
              Smart TV 10-Foot UI • Player Ad-Shield
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls & Tools */}
      <div className="flex items-center gap-2">
        {/* Search Bar / Input */}
        {onSearchChange && (
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar canal, grupo..."
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-[#690909] focus:border-[#8c1010] text-xs text-white focus:outline-none w-40 sm:w-56 transition shadow-inner"
                  onBlur={() => {
                    if (!searchQuery) setShowSearchInput(false);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundService.playSelect();
                  setShowSearchInput(true);
                  onFocusSearch?.();
                }}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer hover:border-[#690909]/50"
                title="Buscar canais [S]"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* View Modes */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              soundService.playSelect();
              onViewModeChange('rows');
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'rows'
                ? 'bg-[#690909] text-white shadow-sm border border-[#8c1010]/60'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Modo Carrosséis (Linhas)"
          >
            <Rows3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playSelect();
              onViewModeChange('grid');
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#690909] text-white shadow-sm border border-[#8c1010]/60'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Modo Grade Completa"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playSelect();
              onViewModeChange('epg');
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'epg'
                ? 'bg-[#690909] text-white shadow-sm border border-[#8c1010]/60'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Guia de Programação EPG"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Audio navigation toggle */}
        <button
          type="button"
          onClick={handleSound}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundEnabled
              ? 'bg-neutral-900 border-neutral-800 text-[#ff4d4d] hover:bg-neutral-800'
              : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:text-neutral-400'
          }`}
          title={soundEnabled ? 'Sons Ativados' : 'Sons Desativados'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Clock */}
        <div className="hidden xl:flex items-center px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs font-bold text-neutral-300">
          {time}
        </div>

        {/* Menu / Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            soundService.playSelect();
            onOpenMenu();
          }}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer hover:border-[#690909]/50"
          title="Menu de Configurações [M]"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
