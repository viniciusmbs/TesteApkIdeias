import { useEffect } from 'react';
import { soundService } from './soundService';

export interface TvNavigationOptions {
  enabled?: boolean;
  itemCount?: number;
  activeIndex?: number;
  onNavigate?: (index: number) => void;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  onMenu?: () => void;
  onTester?: () => void;
  onSearch?: () => void;
  onViewModeToggle?: () => void;
  onChannelUp?: () => void;
  onChannelDown?: () => void;
  onChat?: () => void;
}

export function useTvNavigation({
  enabled = true,
  itemCount = 0,
  activeIndex = 0,
  onNavigate,
  onSelect,
  onBack,
  onMenu,
  onTester,
  onSearch,
  onViewModeToggle,
  onChannelUp,
  onChannelDown,
  onChat,
}: TvNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora atalhos de controle caso o usuário esteja digitando num input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
          if (onBack) onBack();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          soundService.playNav();
          if (onChannelUp) {
            onChannelUp();
          } else if (onNavigate && itemCount > 0) {
            const nextIdx = (activeIndex - 1 + itemCount) % itemCount;
            onNavigate(nextIdx);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          soundService.playNav();
          if (onChannelDown) {
            onChannelDown();
          } else if (onNavigate && itemCount > 0) {
            const nextIdx = (activeIndex + 1) % itemCount;
            onNavigate(nextIdx);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          soundService.playNav();
          if (onNavigate && itemCount > 0) {
            const nextIdx = (activeIndex - 1 + itemCount) % itemCount;
            onNavigate(nextIdx);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          soundService.playNav();
          if (onNavigate && itemCount > 0) {
            const nextIdx = (activeIndex + 1) % itemCount;
            onNavigate(nextIdx);
          }
          break;

        case 'Enter':
          e.preventDefault();
          soundService.playSelect();
          if (onSelect) {
            onSelect(activeIndex);
          }
          break;

        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          soundService.playBack();
          if (onBack) onBack();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          soundService.playSelect();
          if (onMenu) onMenu();
          break;

        case 't':
        case 'T':
          e.preventDefault();
          soundService.playSelect();
          if (onTester) onTester();
          break;

        case 's':
        case 'S':
          e.preventDefault();
          soundService.playSelect();
          if (onSearch) onSearch();
          break;

        case 'v':
        case 'V':
          e.preventDefault();
          soundService.playSelect();
          if (onViewModeToggle) onViewModeToggle();
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          soundService.playSelect();
          if (onChat) onChat();
          break;

        case 'PageUp':
          e.preventDefault();
          if (onChannelUp) onChannelUp();
          break;

        case 'PageDown':
          e.preventDefault();
          if (onChannelDown) onChannelDown();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    itemCount,
    activeIndex,
    onNavigate,
    onSelect,
    onBack,
    onMenu,
    onTester,
    onSearch,
    onViewModeToggle,
    onChannelUp,
    onChannelDown,
    onChat,
  ]);
}
