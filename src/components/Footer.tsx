import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-neutral-900 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-8 py-3 text-xs text-neutral-400 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Remote keyboard shortcuts */}
      <div className="flex items-center flex-wrap gap-2 text-[11px]">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            ▲ ▼ ◀ ▶
          </kbd>
          <span>Navegar</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            Enter
          </kbd>
          <span>Assistir</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            M
          </kbd>
          <span>Menu</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            T
          </kbd>
          <span>Testador & Status</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            S
          </kbd>
          <span>Busca</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
            ESC
          </kbd>
          <span>Voltar</span>
        </div>
      </div>

      {/* Ad-Shield & Security */}
      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-[#ff6b6b]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Proteção Ad-Shield Anti-Propagandas Ativa</span>
        </div>
        <span className="text-neutral-700">•</span>
        <span className="text-neutral-500 font-mono">v3.2 IPTV Smart TV</span>
      </div>
    </footer>
  );
};

export default Footer;
