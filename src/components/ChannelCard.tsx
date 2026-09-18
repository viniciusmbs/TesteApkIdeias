import React, { useState } from 'react';
import { Play, Radio } from 'lucide-react';
import { Channel } from '../types/iptv';
import { getChannelLogo, getFallbackSvg } from '../data/channelLogos';
import { soundService } from '../services/soundService';
import { epgService } from '../services/epgService';

interface ChannelCardProps {
  channel: Channel;
  isOnline?: boolean;
  latency?: number;
  isSelected?: boolean;
  onSelect: (channel: Channel) => void;
  onTest?: (channel: Channel) => void;
  customLogo?: string;
  size?: 'compact' | 'normal' | 'large';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isOnline = true,
  latency,
  onSelect,
  customLogo,
  size = 'normal',
}) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = customLogo || channel.logo || getChannelLogo(channel.name);
  const epg = epgService.getChannelEpg(channel.name, channel.group);
  const currentProg = epg.currentProgram?.title || 'Programação Ao Vivo';

  const handleClick = () => {
    soundService.playSelect();
    onSelect(channel);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const heightClass = size === 'compact' ? 'h-36' : size === 'large' ? 'h-52' : 'h-44';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex flex-col justify-between p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 hover:border-[#8c1010] focus:border-[#a81919] focus:ring-2 focus:ring-[#690909]/40 focus:outline-none transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[#690909]/25 hover:scale-[1.02] focus:scale-[1.03] ${heightClass}`}
    >
      {/* Top Bar: Status dot + Category */}
      <div className="flex items-center justify-between gap-1.5 w-full text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOnline ? 'bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.8)]' : 'bg-neutral-600'
            }`}
          />
          {latency ? (
            <span className="text-[10px] text-neutral-400 font-mono">{latency}ms</span>
          ) : (
            <span className={`text-[10px] font-medium ${isOnline ? 'text-[#ff6b6b]' : 'text-neutral-500'}`}>
              {isOnline ? 'AO VIVO' : 'OFF'}
            </span>
          )}
        </div>

        {channel.group && (
          <span className="truncate max-w-[100px] px-1.5 py-0.5 rounded bg-neutral-800/90 text-neutral-400 text-[10px] uppercase font-semibold tracking-wider">
            {channel.group}
          </span>
        )}
      </div>

      {/* Center: Logo / Icon */}
      <div className="flex-1 flex items-center justify-center p-1 overflow-hidden my-1">
        {logoSrc && !imgError ? (
          <img
            src={logoSrc}
            alt={channel.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="max-h-16 max-w-[85%] object-contain drop-shadow-md group-hover:scale-105 group-focus:scale-105 transition-transform duration-200"
          />
        ) : (
          <img
            src={getFallbackSvg(channel.name)}
            alt={channel.name}
            className="max-h-14 max-w-[70%] object-contain drop-shadow-md"
          />
        )}
      </div>

      {/* Bottom: Channel Name & Now Playing EPG */}
      <div className="w-full pt-1 border-t border-neutral-800/60">
        <div className="flex items-center justify-between gap-1">
          <h4 className="font-bold text-xs text-white truncate group-hover:text-[#ff9999] transition-colors">
            {channel.name}
          </h4>
          <Play className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#ff4d4d] fill-current opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity shrink-0" />
        </div>
        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
          {currentProg}
        </p>
      </div>
    </div>
  );
};

export default ChannelCard;
