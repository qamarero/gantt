import type { Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const options: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

export default function ThemeToggle({ theme, onThemeChange }: Props) {
  return (
    <div className="flex items-center bg-bg-hover border border-border-secondary rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onThemeChange(opt.value)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            theme === opt.value
              ? 'bg-bg-card text-text-primary shadow-sm border border-border-secondary'
              : 'text-text-muted hover:text-text-secondary border border-transparent'
          }`}
          title={opt.label}
        >
          <span className="text-xs">{opt.icon}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
