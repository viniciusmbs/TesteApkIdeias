import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, ChannelStatusResult, ViewMode, UiDensity } from './types';
import { PLAYLIST_RAW } from './data/playlist';
import initialStatusJson from './data/status.json';
import { getChannelLogo } from './data/channelLogos';
import { soundService } from './services/soundService';
import { useTvNavigation } from './services/useTvNavigation';
import { trackLinkClick } from './services/analyticsService';

// UI Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChannelRows } from './components/ChannelRows';
import { ChannelGrid } from './components/ChannelGrid';
import { EpgGrid } from './components/EpgGrid';
import { FullscreenViewer } from './components/FullscreenViewer';
import { MenuModal } from './components/MenuModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { IconManagerModal } from './components/IconManagerModal';
import { StreamTesterModal } from './components/StreamTesterModal';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('rows');
  const [uiDensity, setUiDensity] = useState<UiDensity>('normal');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active channel for player
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeChannelIndex, setActiveChannelIndex] = useState<number>(0);

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isTesterOpen, setIsTesterOpen] = useState<boolean>(false);
  const [isIconsOpen, setIsIconsOpen] = useState<boolean>(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

  // Playlist & Status State
  const [statusData, setStatusData] = useState<ChannelStatusResult>(initialStatusJson as ChannelStatusResult);
  const [customLogos, setCustomLogos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('satv_custom_logos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedM3U, setCopiedM3U] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Parse playlist M3U into structured Channels
  const allChannels = useMemo<Channel[]>(() => {
    const parts = PLAYLIST_RAW.split(/#EXTINF:/i);
    const result: Channel[] = [];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const httpIndex = part.search(/https?:\/\//i);
      if (httpIndex === -1) continue;

      const header = part.substring(0, httpIndex).trim();
      const rest = part.substring(httpIndex).trim();

      const urlMatch = rest.match(/^(https?:\/\/[^\r\n#`"\s]+)/i);
      if (!urlMatch) continue;
      const cleanUrl = urlMatch[1].replace(/[`'";]+$/, '').trim();

      const commaIndex = header.lastIndexOf(',');
      let name = commaIndex !== -1 ? header.substring(commaIndex + 1).trim() : header;
      name = name.replace(/[`'"\r\n]+$/, '').trim();

      const groupMatch = header.match(/group-title="([^"]+)"/i);
      const group = groupMatch ? groupMatch[1] : 'Geral';

      const logoMatch = header.match(/tvg-logo="([^"]+)"/i);
      const rawLogo = logoMatch ? logoMatch[1] : '';
      const officialLogo = getChannelLogo(name);
      const finalLogo = customLogos[name] || officialLogo || rawLogo;

      const channelStatus = (statusData.statuses?.[name] || 'offline') as 'online' | 'offline';
      const latency = statusData.latencies?.[name] ?? (channelStatus === 'online' ? 250 : undefined);

      if (name && cleanUrl) {
        result.push({
          id: `channel-${result.length}`,
          name,
          url: cleanUrl,
          group,
          logo: finalLogo,
          status: channelStatus,
          latency,
          statusCode: channelStatus === 'online' ? 200 : 404,
        });
      }
    }

    return result;
  }, [statusData, customLogos]);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach((c) => {
      if (c.group) set.add(c.group);
    });
    return Array.from(set).sort();
  }, [allChannels]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return allChannels.filter((c) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.group?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || c.group === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [allChannels, searchQuery, selectedCategory]);

  // Counts
  const onlineCount = useMemo(() => {
    return allChannels.filter((c) => c.status === 'online').length;
  }, [allChannels]);

  // Initial fetch for channels-status.json
  const fetchLiveStatus = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/channels-status.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.warn('Usando status local/cache:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundService.setEnabled(next);
    if (next) soundService.playSelect();
  };

  // Play channel handler
  const handleChannelSelect = (channel: Channel) => {
    soundService.playSelect();
    trackLinkClick({
      linkId: channel.id,
      linkName: channel.name,
      linkUrl: channel.url,
      category: channel.group,
    });
    setActiveChannel(channel);
  };

  // Close player
  const handleClosePlayer = () => {
    soundService.playBack();
    setActiveChannel(null);
  };

  // Channel switching in player
  const handleNextChannel = () => {
    if (!activeChannel) return;
    const currIdx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    if (currIdx !== -1 && currIdx < filteredChannels.length - 1) {
      handleChannelSelect(filteredChannels[currIdx + 1]);
    } else if (filteredChannels.length > 0) {
      handleChannelSelect(filteredChannels[0]);
    }
  };

  const handlePrevChannel = () => {
    if (!activeChannel) return;
    const currIdx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    if (currIdx > 0) {
      handleChannelSelect(filteredChannels[currIdx - 1]);
    } else if (filteredChannels.length > 0) {
      handleChannelSelect(filteredChannels[filteredChannels.length - 1]);
    }
  };

  // Save custom logo
  const handleSaveCustomLogo = (channelName: string, logoUrl: string) => {
    const updated = { ...customLogos, [channelName]: logoUrl };
    setCustomLogos(updated);
    try {
      localStorage.setItem('satv_custom_logos', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleResetAllLogos = () => {
    setCustomLogos({});
    try {
      localStorage.removeItem('satv_custom_logos');
    } catch {
      // Ignore
    }
  };

  // Copy / Download M3U
  const handleCopyM3U = () => {
    soundService.playSelect();
    navigator.clipboard.writeText(PLAYLIST_RAW);
    setCopiedM3U(true);
    setTimeout(() => setCopiedM3U(false), 2500);
  };

  const handleExportM3U = () => {
    soundService.playSelect();
    const blob = new Blob([PLAYLIST_RAW], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'satv-playlist.m3u';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // TV Remote Navigation Hook
  useTvNavigation({
    itemCount: filteredChannels.length,
    activeIndex: activeChannelIndex,
    onNavigate: (index: number) => {
      setActiveChannelIndex(index);
    },
    onSelect: (index: number) => {
      if (!activeChannel && filteredChannels[index]) {
        handleChannelSelect(filteredChannels[index]);
      }
    },
    onBack: () => {
      if (activeChannel) {
        handleClosePlayer();
      } else if (isMenuOpen) {
        setIsMenuOpen(false);
      } else if (isTesterOpen) {
        setIsTesterOpen(false);
      } else if (isIconsOpen) {
        setIsIconsOpen(false);
      } else if (isExitConfirmOpen) {
        setIsExitConfirmOpen(false);
      } else {
        soundService.playBack();
        setIsExitConfirmOpen(true);
      }
    },
    onMenu: () => {
      soundService.playSelect();
      setIsMenuOpen((prev) => !prev);
    },
    onTester: () => {
      soundService.playSelect();
      setIsTesterOpen((prev) => !prev);
    },
    onChannelUp: handleNextChannel,
    onChannelDown: handlePrevChannel,
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-[#690909] selection:text-white">
      {/* Top Header */}
      <Header
        channelCount={allChannels.length}
        onlineCount={onlineCount}
        viewMode={viewMode}
        onViewModeChange={(mode: ViewMode) => {
          soundService.playSelect();
          setViewMode(mode);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenMenu={() => {
          soundService.playSelect();
          setIsMenuOpen(true);
        }}
        onOpenTester={() => {
          soundService.playSelect();
          setIsTesterOpen(true);
        }}
        onOpenIcons={() => {
          soundService.playSelect();
          setIsIconsOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => {
                soundService.playSelect();
                setSelectedCategory('all');
              }}
              className={`px-4 py-1.5 rounded-full font-semibold transition cursor-pointer whitespace-nowrap border ${
                selectedCategory === 'all'
                  ? 'bg-[#690909] text-white border-[#8c1010] shadow-md shadow-[#690909]/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-[#690909]/40'
              }`}
            >
              Todos ({allChannels.length})
            </button>

            {categories.map((cat) => {
              const count = allChannels.filter((c) => c.group === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundService.playSelect();
                    setSelectedCategory(cat);
                  }}
                  className={`px-4 py-1.5 rounded-full font-semibold transition cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-[#690909] text-white border-[#8c1010] shadow-md shadow-[#690909]/40'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-[#690909]/40'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* View Presentation */}
          {viewMode === 'rows' && (
            <ChannelRows
              channels={filteredChannels}
              onSelectChannel={handleChannelSelect}
              customLogos={customLogos}
              selectedChannelId={activeChannel?.id}
              uiDensity={uiDensity}
            />
          )}

          {viewMode === 'grid' && (
            <ChannelGrid
              channels={filteredChannels}
              onSelectChannel={handleChannelSelect}
              customLogos={customLogos}
              selectedChannelId={activeChannel?.id}
              uiDensity={uiDensity}
            />
          )}

          {viewMode === 'epg' && (
            <EpgGrid
              channels={filteredChannels}
              onSelectChannel={handleChannelSelect}
              customLogos={customLogos}
            />
          )}
        </div>
      </main>

      {/* Footer with remote cheatsheet & Ad-Shield */}
      <Footer />

      {/* Fullscreen Video Player with Ad-Shield */}
      {activeChannel && (
        <FullscreenViewer
          channel={activeChannel}
          channels={filteredChannels}
          onClose={handleClosePlayer}
          onSelectChannel={handleChannelSelect}
          customLogos={customLogos}
        />
      )}

      {/* Menu / Settings Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        uiDensity={uiDensity}
        onUiDensityChange={setUiDensity}
        onOpenTester={() => setIsTesterOpen(true)}
        onOpenIcons={() => setIsIconsOpen(true)}
        onExportM3U={handleExportM3U}
        onCopyM3U={handleCopyM3U}
        onSyncGitHub={fetchLiveStatus}
        copiedM3U={copiedM3U}
        isSyncing={isSyncing}
      />

      {/* Quick Stream Tester Modal */}
      <StreamTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        initialStatus={statusData}
        onStatusUpdate={(updated) => setStatusData(updated)}
      />

      {/* Custom Icon / Logo Manager */}
      <IconManagerModal
        isOpen={isIconsOpen}
        onClose={() => setIsIconsOpen(false)}
        channels={allChannels}
        customLogos={customLogos}
        onSaveCustomLogo={handleSaveCustomLogo}
        onResetAllLogos={handleResetAllLogos}
      />

      {/* TV Remote Exit Confirmation */}
      <ExitConfirmModal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        onConfirm={() => {
          setIsExitConfirmOpen(false);
          window.close();
        }}
      />
    </div>
  );
}
