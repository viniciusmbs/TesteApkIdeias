import React from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Channel, ChannelCheckResult } from '../types/iptv';
import ChannelCard from './ChannelCard';
import { soundService } from '../services/soundService';

interface ChannelRowsProps {
  channels: Channel[];
  results?: Record<string, ChannelCheckResult>;
  onSelectChannel: (channel: Channel) => void;
  customLogos?: Record<string, string>;
  selectedChannelId?: string;
  uiDensity?: 'compact' | 'normal' | 'large';
}

export const ChannelRows: React.FC<ChannelRowsProps> = ({
  channels,
  results = {},
  onSelectChannel,
  customLogos = {},
  selectedChannelId,
  uiDensity = 'normal',
}) => {
  // Group channels
  const groups = React.useMemo(() => {
    const map: Record<string, Channel[]> = {};
    channels.forEach((ch) => {
      const g = ch.group?.trim() || 'Geral';
      if (!map[g]) map[g] = [];
      map[g].push(ch);
    });
    return map;
  }, [channels]);

  const groupKeys = Object.keys(groups);

  const scrollRow = (rowId: string, direction: 'left' | 'right') => {
    soundService.playNav();
    const el = document.getElementById(rowId);
    if (el) {
      const scrollAmount = direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (channels.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500">
        Nenhum canal encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {groupKeys.map((groupName, idx) => {
        const groupChannels = groups[groupName];
        const rowId = `row-${idx}-${groupName.replace(/[^a-z0-9]/gi, '_')}`;

        return (
          <section key={groupName} className="relative group/row">
            {/* Row Title */}
            <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ff4d4d]" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {groupName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {groupChannels.length}
                </span>
              </div>

              {/* Scroll controls */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollRow(rowId, 'left')}
                  className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                  title="Rolar para esquerda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRow(rowId, 'right')}
                  className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                  title="Rolar para direita"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              id={rowId}
              className="flex items-center gap-4 overflow-x-auto scrollbar-none px-4 sm:px-8 py-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {groupChannels.map((channel) => {
                const res = results[channel.id] || results[channel.name];
                const isOnline = res ? res.online : true;
                const latency = res?.latency;

                return (
                  <div
                    key={channel.id}
                    className="shrink-0 w-44 sm:w-52 md:w-56 focus-within:z-10"
                  >
                    <ChannelCard
                      channel={channel}
                      isOnline={isOnline}
                      latency={latency}
                      isSelected={selectedChannelId === channel.id}
                      onSelect={onSelectChannel}
                      customLogo={customLogos[channel.name]}
                      size={uiDensity}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ChannelRows;
