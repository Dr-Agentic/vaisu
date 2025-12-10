import { useEffect } from 'react';

interface KeyboardHandlers {
  onFocusMode: () => void;
  onResetView: () => void;
  onExport: () => void;
  onToggleLegend: () => void;
}

export function useUMLKeyboard({
  onFocusMode,
  onResetView,
  onExport,
  onToggleLegend
}: KeyboardHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          onFocusMode();
          break;
        case 'r':
          event.preventDefault();
          onResetView();
          break;
        case 'e':
          event.preventDefault();
          onExport();
          break;
        case 'l':
          event.preventDefault();
          onToggleLegend();
          break;
        case 'escape':
          event.preventDefault();
          // Clear any active selections or close modals
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFocusMode, onResetView, onExport, onToggleLegend]);
}