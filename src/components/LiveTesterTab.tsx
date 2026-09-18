import React from 'react';
import { ChannelTester } from './ChannelTester';
import { ChannelStatusResult } from '../types';
import { PLAYLIST_RAW } from '../data/playlist';

interface LiveTesterTabProps {
  initialStatus: ChannelStatusResult;
  onStatusUpdate?: (status: ChannelStatusResult) => void;
}

export const LiveTesterTab: React.FC<LiveTesterTabProps> = ({
  initialStatus,
  onStatusUpdate,
}) => {
  return (
    <div className="space-y-6">
      <ChannelTester
        initialStatus={initialStatus}
        playlistRaw={PLAYLIST_RAW}
        onStatusUpdate={onStatusUpdate}
      />
    </div>
  );
};

export default LiveTesterTab;
