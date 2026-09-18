import React from 'react';
import { Channel, ChannelCheckResult } from '../types/iptv';
import ChannelCard from './ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  results?: Record<string, ChannelCheckResult>;
  onSelectChannel: (channel: Channel) => void;
  customLogos?: Record<string, string>;
  selectedChannelId?: string;
  uiDensity?: 'compact' | 'normal' | 'large';
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  results = {},
  onSelectChannel,
  customLogos = {},
  selectedChannelId,
  uiDensity = 'normal',
}) => {
  if (channels.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500">
        Nenhum canal encontrado com os filtros atuais.
      </div>
    );
  }

  const gridColsClass =
    uiDensity === 'compact'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
      : uiDensity === 'large'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  return (
    <div className="px-4 sm:px-8 pb-16">
      <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
        {channels.map((channel) => {
          const res = results[channel.id] || results[channel.name];
          const isOnline = res ? res.online : true;
          const latency = res?.latency;

          return (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isOnline={isOnline}
              latency={latency}
              isSelected={selectedChannelId === channel.id}
              onSelect={onSelectChannel}
              customLogo={customLogos[channel.name]}
              size={uiDensity}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChannelGrid;
