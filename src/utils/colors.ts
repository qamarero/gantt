export const priorityColors: Record<string, string> = {
  Urgent: '#f85149',
  High: '#ffa657',
  Medium: '#d2992a',
  Low: '#8b949e',
  None: '#484f58',
};

export const statusDotColors: Record<string, string> = {
  started: '#58a6ff',
  unstarted: '#484f58',
  completed: '#238636',
  canceled: '#8b949e',
  triage: '#d2992a',
  backlog: '#484f58',
};

export const barGradients: Record<string, string> = {
  urgent: 'linear-gradient(135deg, #da3633, #f85149)',
  high: 'linear-gradient(135deg, #d47519, #ffa657)',
  medium: 'linear-gradient(135deg, #9e6a03, #d2992a)',
  low: 'linear-gradient(135deg, #484f58, #8b949e)',
  none: 'linear-gradient(135deg, #30363d, #484f58)',
};

export const barShadows: Record<string, string> = {
  urgent: '0 2px 8px rgba(248,81,73,0.3)',
  high: '0 2px 8px rgba(255,166,87,0.3)',
  medium: '0 2px 8px rgba(210,153,34,0.3)',
  low: '0 2px 8px rgba(139,148,158,0.2)',
  none: '0 2px 8px rgba(72,79,88,0.2)',
};

export const idColors: Record<string, string> = {
  urgent: '#f85149',
  high: '#ffa657',
  medium: '#d2992a',
  low: '#8b949e',
  none: '#8b949e',
};

export const priorityBadgeClasses: Record<string, string> = {
  urgent: 'bg-urgent/15 text-urgent border border-urgent/25',
  high: 'bg-high/15 text-high border border-high/25',
  medium: 'bg-medium/15 text-medium border border-medium/25',
  low: 'bg-low/15 text-low border border-low/25',
  none: 'bg-none/15 text-none border border-none/25',
};

export function priorityClass(val: number): string {
  if (val === 1) return 'urgent';
  if (val === 2) return 'high';
  if (val === 3) return 'medium';
  if (val === 4) return 'low';
  return 'none';
}
