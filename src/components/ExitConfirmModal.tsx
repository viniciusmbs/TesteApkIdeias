import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { soundService } from '../services/soundService';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Deseja sair do aplicativo?</h3>
            <p className="text-xs text-neutral-400">Pressione Enter para confirmar ou ESC para voltar.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            autoFocus
            onClick={() => {
              soundService.playBack();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition cursor-pointer"
          >
            Continuar assistindo (ESC)
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playSelect();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
