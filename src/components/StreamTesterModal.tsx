import React from 'react';
import { X, Zap } from 'lucide-react';
import { ChannelTester } from './ChannelTester';
import { ChannelStatusResult } from '../types';
import { PLAYLIST_RAW } from '../data/playlist';
import { soundService } from '../services/soundService';

interface StreamTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus: ChannelStatusResult;
  onStatusUpdate?: (status: ChannelStatusResult) => void;
}

export const StreamTesterModal: React.FC<StreamTesterModalProps> = ({
  isOpen,
  onClose,
  initialStatus,
  onStatusUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Testador & Status Oficial de Canais</h3>
              <p className="text-xs text-neutral-400">
                Checagem em tempo real, verificação de servidores e player Ad-Shield
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <ChannelTester
            initialStatus={initialStatus}
            playlistRaw={PLAYLIST_RAW}
            onStatusUpdate={onStatusUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default StreamTesterModal;
