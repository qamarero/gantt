import { useState } from 'react';
import type { Theme } from '../hooks/useTheme';
import { exportAsPng, exportAsPdf } from '../utils/export';
import ThemeToggle from './ThemeToggle';

interface Props {
  loading: boolean;
  lastSynced: string;
  onRefresh: () => void;
  onDisconnectLinear: () => void;
  onSignOut: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  dayWidth: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const btnClass =
  'flex items-center gap-1.5 px-3.5 py-[7px] bg-bg-hover border border-border-secondary rounded-md text-text-secondary text-xs font-medium cursor-pointer transition-all hover:bg-border-secondary hover:text-text-primary';

export default function Toolbar({ loading, lastSynced, onRefresh, onDisconnectLinear, onSignOut, onZoomIn, onZoomOut, dayWidth, theme, onThemeChange }: Props) {
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: 'png' | 'pdf') => {
    setShowExportMenu(false);
    setExporting(true);
    try {
      const el = document.getElementById('gantt-export-target');
      if (!el) return;
      if (format === 'png') await exportAsPng(el);
      else await exportAsPdf(el);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-2 flex-wrap print:hidden">
      <button onClick={onRefresh} className={btnClass}>
        {loading && (
          <span className="inline-block w-3 h-3 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
        )}
        Refresh
      </button>

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className={btnClass} title="Zoom out (-)">
          &minus;
        </button>
        <span className="text-[10px] text-text-muted w-8 text-center">{dayWidth}px</span>
        <button onClick={onZoomIn} className={btnClass} title="Zoom in (+)">
          +
        </button>
      </div>

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className={btnClass}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </button>
        {showExportMenu && (
          <div className="absolute top-full mt-1 left-0 bg-bg-card border border-border-secondary rounded-md shadow-lg z-50 min-w-[140px]">
            <button
              onClick={() => handleExport('png')}
              className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Export as PNG
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Export as PDF
            </button>
            <div className="border-t border-border-primary" />
            <button
              onClick={() => { setShowExportMenu(false); window.print(); }}
              className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Print
            </button>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

      {/* Right side: account actions */}
      <div className="flex items-center gap-2 ml-auto">
        {lastSynced && (
          <span className="text-[11px] text-text-muted">Last synced: {lastSynced}</span>
        )}
        <button
          onClick={onDisconnectLinear}
          className="px-3.5 py-[7px] bg-bg-hover border border-border-secondary rounded-md text-text-secondary text-xs font-medium cursor-pointer transition-all hover:bg-high/15 hover:text-high hover:border-high/30"
          title="Disconnect Linear account"
        >
          Disconnect Linear
        </button>
        <button
          onClick={onSignOut}
          className="px-3.5 py-[7px] bg-bg-hover border border-border-secondary rounded-md text-text-secondary text-xs font-medium cursor-pointer transition-all hover:bg-urgent/15 hover:text-urgent hover:border-urgent/30"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
