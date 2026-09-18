import React, { useState } from 'react';
import { FileCode, Terminal, Download, Copy, Check, Sparkles } from 'lucide-react';
import { generateWorkflowYaml, generateCheckChannelsScript, generateSampleStatusJson } from '../utils/generators';
import { CodeViewer } from './CodeViewer';

interface CodeGeneratorTabProps {
  repoOwner?: string;
  repoName?: string;
}

export const CodeGeneratorTab: React.FC<CodeGeneratorTabProps> = ({
  repoOwner = 'viniciusmbs',
  repoName = 'SatvApk',
}) => {
  const [selectedFile, setSelectedFile] = useState<'workflow' | 'script' | 'json'>('workflow');
  const [owner, setOwner] = useState(repoOwner);
  const [name, setName] = useState(repoName);
  const [copiedZipMsg, setCopiedZipMsg] = useState(false);

  const workflowCode = generateWorkflowYaml(owner, name);
  const scriptCode = generateCheckChannelsScript();
  const sampleJsonCode = generateSampleStatusJson();

  const handleDownloadAll = () => {
    // Download script
    const blobScript = new Blob([scriptCode], { type: 'text/javascript' });
    const a1 = document.createElement('a');
    a1.href = URL.createObjectURL(blobScript);
    a1.download = 'check-channels.js';
    a1.click();

    // Download workflow
    setTimeout(() => {
      const blobWf = new Blob([workflowCode], { type: 'text/yaml' });
      const a2 = document.createElement('a');
      a2.href = URL.createObjectURL(blobWf);
      a2.download = 'check-channels.yml';
      a2.click();
    }, 400);

    setCopiedZipMsg(true);
    setTimeout(() => setCopiedZipMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Gerador de Código & Automação CI/CD</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure o repositório para gerar o script e a GitHub Action sob medida
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-500 font-mono">github.com/</span>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="usuário"
              className="bg-transparent text-emerald-400 font-mono font-semibold focus:outline-none w-24"
            />
            <span className="text-neutral-500">/</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="repositório"
              className="bg-transparent text-white font-mono font-semibold focus:outline-none w-24"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadAll}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950"
          >
            <Download className="w-4 h-4" />
            <span>{copiedZipMsg ? 'Baixando Arquivos...' : 'Baixar Scripts'}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setSelectedFile('workflow')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            selectedFile === 'workflow'
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>.github/workflows/check-channels.yml</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFile('script')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            selectedFile === 'script'
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>scripts/check-channels.js</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFile('json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            selectedFile === 'json'
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>channels-status.json</span>
        </button>
      </div>

      {/* Code Viewer according to selection */}
      {selectedFile === 'workflow' && (
        <CodeViewer
          title="Workflow do GitHub Actions"
          filename=".github/workflows/check-channels.yml"
          language="yaml"
          code={workflowCode}
          description="Roda a cada 1 hora no GitHub Actions sem gastar minutos pagos e faz commit automático do channels-status.json."
        />
      )}

      {selectedFile === 'script' && (
        <CodeViewer
          title="Script Node.js de Teste de Canais"
          filename="scripts/check-channels.js"
          language="javascript"
          code={scriptCode}
          description="Executado pela Action ou localmente: lê o playlist.ts, faz requests HTTP com timeout de 5 segundos e grava o resultado JSON."
        />
      )}

      {selectedFile === 'json' && (
        <CodeViewer
          title="Estrutura do JSON Gerado"
          filename="channels-status.json"
          language="json"
          code={sampleJsonCode}
          description="Exemplo do arquivo gerado e mantido atualizado pelo robô."
        />
      )}
    </div>
  );
};

export default CodeGeneratorTab;
