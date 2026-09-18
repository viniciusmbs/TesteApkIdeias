import React, { useState, useEffect } from 'react';
import { Clock, Play, Radio, Calendar } from 'lucide-react';
import { Channel, ChannelCheckResult } from '../types/iptv';
import { epgService } from '../services/epgService';
import { getChannelLogo, getFallbackSvg } from '../data/channelLogos';
import { soundService } from '../services/soundService';

interface EpgGridProps {
  channels: Channel[];
  results?: Record<string, ChannelCheckResult>;
  onSelectChannel: (channel: Channel) => void;
  customLogos?: Record<string, string>;
}

export const EpgGrid: React.FC<EpgGridProps> = ({
  channels,
  results = {},
  onSelectChannel,
  customLogos = {},
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 sm:px-8 pb-16 space-y-4">
      {/* Header bar of EPG */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2 text-neutral-300 font-medium">
          <Calendar className="w-4 h-4 text-[#ff4d4d]" />
          <span>Guia Eletrônico de Programação (EPG)</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400 font-mono">
          <Clock className="w-4 h-4 text-[#ff4d4d]" />
          <span className="text-white font-bold">{currentTime}</span>
        </div>
      </div>

      {/* Program rows */}
      <div className="space-y-3">
        {channels.map((channel) => {
          const epg = epgService.getChannelEpg(channel.name, channel.group);
          const cur = epg.currentProgram;
          const next = epg.nextProgram;
          const res = results[channel.id] || results[channel.name];
          const isOnline = res ? res.online : true;
          const logoSrc = customLogos[channel.name] || channel.logo || getChannelLogo(channel.name);

          return (
            <div
              key={channel.id}
              className="flex flex-col md:flex-row items-stretch gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-[#8c1010] transition group"
            >
              {/* Channel identity block */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  soundService.playSelect();
                  onSelectChannel(channel);
                }}
                className="flex items-center gap-3 w-full md:w-64 p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60 hover:bg-neutral-800 cursor-pointer shrink-0 transition"
              >
                <div className="w-12 h-10 rounded-lg bg-neutral-900 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={logoSrc}
                    alt={channel.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackSvg(channel.name);
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isOnline ? 'bg-[#ff4d4d]' : 'bg-neutral-600'
                      }`}
                    />
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-[#ff9999]">
                      {channel.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                    {channel.group || 'Geral'}
                  </span>
                </div>
                <Play className="w-4 h-4 text-[#ff4d4d] fill-[#ff4d4d] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Now Playing Slot */}
              <div className="flex-1 p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#690909]/40 border border-[#690909]/60 text-[#ff6b6b] text-[10px] font-bold">
                      NO AR
                    </span>
                    <span className="font-semibold text-white truncate">
                      {cur?.title || 'Programação Ao Vivo'}
                    </span>
                  </div>
                  <span className="text-neutral-400 text-[11px] font-mono shrink-0 ml-2">
                    {cur?.start} - {cur?.stop}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1 mb-2">
                  {cur?.desc || 'Acompanhe a transmissão em tempo real.'}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-[#690909] rounded-full transition-all duration-300"
                    style={{ width: `${cur?.progressPercent || 45}%` }}
                  />
                </div>
              </div>

              {/* Next Slot */}
              <div className="w-full md:w-72 p-3 rounded-xl bg-neutral-950/30 border border-neutral-800/30 flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-medium">
                      A SEGUIR
                    </span>
                    <span className="font-medium text-neutral-300 truncate">
                      {next?.title || 'Próximo programa'}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-[11px] font-mono shrink-0 ml-2">
                    {next?.start}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-1">
                  {next?.desc || 'Confira os destaques da sequência.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpgGrid;
