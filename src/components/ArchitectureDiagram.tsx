import React from 'react';
import { GitBranch, Clock, Terminal, FileCode, CheckCircle, Database, Smartphone, ShieldCheck } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          <span>Arquitetura do Robô de Checagem & Sincronização Automática</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Como o GitHub Actions, o Node.js e o aplicativo React se comunicam sem custos de servidores externos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1 */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Cron do GitHub Actions</h4>
            <p className="text-[11px] text-neutral-400 mt-1">
              Disparado a cada 1 hora via agendamento cron (<code>0 * * * *</code>) ou manualmente via interface.
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
            check-channels.yml
          </span>
        </div>

        {/* Step 2 */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              2
            </span>
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Script Node.js</h4>
            <p className="text-[11px] text-neutral-400 mt-1">
              Testa cada canal da playlist M3U com requisições HTTP seguras, medindo latência e verificando online/offline.
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
            check-channels.js
          </span>
        </div>

        {/* Step 3 */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              3
            </span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Commit no Repositório</h4>
            <p className="text-[11px] text-neutral-400 mt-1">
              Gera e comita o arquivo <code>channels-status.json</code> diretamente no repositório GitHub de forma automática.
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
            channels-status.json
          </span>
        </div>

        {/* Step 4 */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              4
            </span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">App React & Smart TV</h4>
            <p className="text-[11px] text-neutral-400 mt-1">
              Consome o JSON para renderizar badges verdes/vermelhos em tempo real nos cards e na visualização da TV.
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
            React 19 + Tailwind
          </span>
        </div>
      </div>

      <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Arquitetura 100% Serverless: Sem servidores pagos, sem bloqueios de CORS no navegador e com histórico auditado no Git.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
