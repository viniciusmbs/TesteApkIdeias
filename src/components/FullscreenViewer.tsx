import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Tv,
  Play,
} from 'lucide-react';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';
import { Channel } from '../types/iptv';
import { getChannelLogo, getFallbackSvg } from '../data/channelLogos';
import { soundService } from '../services/soundService';

interface FullscreenViewerProps {
  channel: Channel;
  channels: Channel[];
  onClose: () => void;
  onSelectChannel: (channel: Channel) => void;
  customLogos?: Record<string, string>;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  channel,
  channels,
  onClose,
  onSelectChannel,
  customLogos = {},
}) => {
  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [aspectFit, setAspectFit] = useState<'contain' | 'cover'>('contain');
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'hls' | 'mpegts' | 'embed' | 'native'>('embed');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<mpegts.Player | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentIndex = channels.findIndex((c) => c.id === channel.id || c.name === channel.name);
  const prevChannel = currentIndex > 0 ? channels[currentIndex - 1] : channels[channels.length - 1];
  const nextChannel = currentIndex < channels.length - 1 ? channels[currentIndex + 1] : channels[0];

  const logoSrc = customLogos[channel.name] || channel.logo || getChannelLogo(channel.name);

  // Detect stream protocol / format
  const isHls = channel.url.includes('.m3u8') || channel.url.includes('/hls/');
  const isMpegTs = channel.url.includes('.ts') || channel.url.includes(':80/');
  const isDirectMedia = isHls || isMpegTs;

  // Resolve stream URL (auto proxy HTTP on HTTPS to avoid Mixed Content / CORS)
  const getStreamUrl = (rawUrl: string, forceProxy = false) => {
    const isMixedContent = window.location.protocol === 'https:' && rawUrl.startsWith('http://');
    if (forceProxy || isMixedContent) {
      return `/api/stream-proxy?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  };

  const resetHideTimer = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  };

  // Keyboard navigation & remote control
  useEffect(() => {
    resetHideTimer();
    const handleActivity = () => resetHideTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        soundService.playBack();
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        soundService.playNav();
        if (prevChannel) onSelectChannel(prevChannel);
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        soundService.playNav();
        if (nextChannel) onSelectChannel(nextChannel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [channel, prevChannel, nextChannel]);

  // Video Engine Initializer (HLS.js / MPEGTS.js / Native)
  useEffect(() => {
    setPlayerError(null);

    // Destroy existing instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (mpegtsRef.current) {
      mpegtsRef.current.destroy();
      mpegtsRef.current = null;
    }

    if (!isDirectMedia) {
      setEngineType('embed');
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const streamUrl = getStreamUrl(channel.url, useProxy);

    // 1. MPEG-TS stream (.ts) via mpegts.js
    if (isMpegTs) {
      setEngineType('mpegts');
      if (mpegts.isSupported()) {
        try {
          const player = mpegts.createPlayer(
            {
              type: 'mse',
              isLive: true,
              url: streamUrl,
            },
            {
              enableWorker: true,
              lazyLoadMaxDuration: 3 * 60,
              seekType: 'range',
            }
          );
          player.attachMediaElement(videoEl);
          player.load();
          const playRes = player.play();
          if (playRes && typeof (playRes as Promise<void>).catch === 'function') {
            (playRes as Promise<void>).catch(() => {});
          }

          player.on(mpegts.Events.ERROR, (errorType: string, errorDetail: string) => {
            console.warn('MPEG-TS Player warning/error:', errorType, errorDetail);
            if (!useProxy && channel.url.startsWith('http://')) {
              setUseProxy(true);
            } else {
              setPlayerError('Não foi possível carregar este stream TS diretamente.');
            }
          });

          mpegtsRef.current = player;
        } catch (err: any) {
          console.error('Failed to init mpegts.js', err);
          setPlayerError('Erro ao inicializar decodificador TS.');
        }
      } else {
        videoEl.src = streamUrl;
        videoEl.play().catch(() => {});
      }
      return;
    }

    // 2. HLS stream (.m3u8) via Hls.js
    if (isHls) {
      setEngineType('hls');
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoEl.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn('HLS fatal error:', data.type);
            if (!useProxy) {
              setUseProxy(true);
            } else {
              setPlayerError('Erro ao reproduzir stream HLS (.m3u8).');
            }
          }
        });

        hlsRef.current = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = streamUrl;
        videoEl.play().catch(() => {});
      } else {
        setPlayerError('Seu navegador não suporta reprodução HLS nativa.');
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (mpegtsRef.current) {
        mpegtsRef.current.destroy();
        mpegtsRef.current = null;
      }
    };
  }, [channel.url, isDirectMedia, isHls, isMpegTs, useProxy]);

  const handleCopy = () => {
    soundService.playSelect();
    navigator.clipboard.writeText(channel.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Player Screen */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {isDirectMedia ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className={`w-full h-full ${aspectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
            />
            {playerError && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10 space-y-4">
                <AlertCircle className="w-12 h-12 text-[#ff4d4d]" />
                <h3 className="text-base font-bold text-white">{playerError}</h3>
                <p className="text-xs text-neutral-400 max-w-md">
                  Streams IPTV diretos (.ts e .m3u8) podem necessitar de proxy ou permissão de rede local.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {!useProxy && (
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playSelect();
                        setUseProxy(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#690909] hover:bg-[#8c1010] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Tentar via Proxy Seguro
                    </button>
                  )}
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir no VLC / Nova Aba
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Stream Embed Player para canais de web players */
          <div className="relative w-full h-full">
            <iframe
              key={channel.url}
              src={channel.url}
              title={channel.name}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              className={`w-full h-full border-0 ${aspectFit === 'cover' ? 'scale-105' : ''}`}
            />

            {/* EmbedTV Sandbox Notice Helper */}
            {channel.url.includes('embedtv') && (
              <div className="absolute bottom-16 right-6 z-20 pointer-events-auto">
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-neutral-900/95 border border-[#8c1010] text-[#ff6b6b] hover:bg-[#690909] hover:text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  title="Abrir diretamente sem restrição de iframe"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir em Nova Aba (Sem Sandbox)</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top HUD: Channel Name & Quick Actions */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-xl bg-neutral-900/90 border border-neutral-700/60 p-1 flex items-center justify-center shrink-0">
            <img
              src={logoSrc}
              alt={channel.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackSvg(channel.name);
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d4d] shadow-[0_0_10px_rgba(255,77,77,0.9)]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-md">
                {channel.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-300">
              <span className="px-1.5 py-0.5 rounded bg-[#690909]/60 border border-[#8c1010]/60 text-[#ff6b6b] font-semibold text-[10px]">
                {channel.group || 'Geral'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 uppercase">
                {engineType === 'hls' ? 'HLS .m3u8' : engineType === 'mpegts' ? 'MPEG-TS .ts' : 'Web Embed'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#ff6b6b]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ad-Shield Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Right HUD buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAspectFit(aspectFit === 'contain' ? 'cover' : 'contain')}
            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title={aspectFit === 'contain' ? 'Preencher tela' : 'Manter proporção original'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="Copiar URL do canal"
          >
            {copied ? <Check className="w-4 h-4 text-[#ff4d4d]" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={channel.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="Abrir stream em nova aba (sem iframe)"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => {
              soundService.playBack();
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold transition shadow-lg cursor-pointer"
            title="Sair da tela cheia (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side Navigation for Channels (Next / Prev) */}
      <button
        type="button"
        onClick={() => {
          soundService.playNav();
          if (prevChannel) onSelectChannel(prevChannel);
        }}
        className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/10 text-white/80 hover:text-white transition-opacity duration-300 z-20 cursor-pointer ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        title={`Canal anterior: ${prevChannel?.name}`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={() => {
          soundService.playNav();
          if (nextChannel) onSelectChannel(nextChannel);
        }}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/10 text-white/80 hover:text-white transition-opacity duration-300 z-20 cursor-pointer ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        title={`Próximo canal: ${nextChannel?.name}`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom info bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-xs text-neutral-400 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <span>Canal {currentIndex + 1} de {channels.length}</span>
          <span>•</span>
          <span>[ESC / Backspace] Voltar</span>
          <span>•</span>
          <span>[◀ / ▶] Trocar canal</span>
        </div>
        <div className="text-[11px] text-[#ff6b6b] font-medium flex items-center gap-2">
          <span>Modo {engineType.toUpperCase()}</span>
          <span>•</span>
          <span>Ad-Shield</span>
        </div>
      </div>
    </div>
  );
};

export default FullscreenViewer;
