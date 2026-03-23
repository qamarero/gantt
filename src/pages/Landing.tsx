import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Gantt Timeline',
    desc: 'Visualize all your Linear issues on an interactive timeline with start dates, due dates, and drag-to-reschedule.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    title: 'Smart Filtering',
    desc: 'Filter by project, assignee, status, and priority. Search across all tasks instantly.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
    title: 'Real-time Sync',
    desc: 'Auto-syncs with Linear every 30 seconds. Changes in Linear appear in your Gantt chart automatically.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Team Overview',
    desc: 'Group tasks by assignee, priority, or status. See who is working on what at a glance.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Export & Print',
    desc: 'Export your roadmap as PNG or PDF. Print-friendly layout for sharing in meetings.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: 'Secure OAuth',
    desc: 'Connect via Linear OAuth — your API tokens are stored securely, never exposed in the browser.',
  },
];

export default function Landing() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-primary/80 backdrop-blur-lg border-b border-border-primary shadow-lg' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="8" x2="16" y2="8" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <span className="text-lg font-bold text-text-primary">GanttSmart</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            <Link
              to="/app"
              className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Free &amp; open source
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            The Gantt chart
            <br />
            <span className="text-accent">Linear is missing</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
            Visualize your Linear projects on an interactive timeline. Drag to reschedule,
            filter by team, and export for stakeholder meetings — all synced with Linear in real time.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/app"
              className="px-8 py-3.5 bg-accent text-white text-base font-semibold rounded-xl hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
            >
              Start using it now
            </Link>
            <a
              href="https://github.com/sideq-io/linear-gantt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-bg-hover border border-border-secondary text-text-primary text-base font-semibold rounded-xl hover:bg-border-secondary transition-all hover:-translate-y-0.5"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Screenshot / Preview */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border-secondary bg-bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-bg-header border-b border-border-primary">
              <div className="w-3 h-3 rounded-full bg-urgent/60" />
              <div className="w-3 h-3 rounded-full bg-medium/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="text-[11px] text-text-muted ml-2">GanttSmart — Project Roadmap</span>
            </div>
            <div className="p-8 sm:p-12 text-center">
              <div className="grid grid-cols-6 gap-1 max-w-3xl mx-auto mb-6">
                {/* Fake Gantt bars */}
                <div className="col-span-6 flex items-center gap-2 py-2">
                  <span className="text-[10px] text-text-muted w-20 text-right shrink-0">AUTH-12</span>
                  <div className="h-5 rounded bg-urgent/80 flex-1 max-w-[40%]" />
                </div>
                <div className="col-span-6 flex items-center gap-2 py-2">
                  <span className="text-[10px] text-text-muted w-20 text-right shrink-0">API-45</span>
                  <div className="w-[15%]" />
                  <div className="h-5 rounded bg-high/80 flex-1 max-w-[55%]" />
                </div>
                <div className="col-span-6 flex items-center gap-2 py-2">
                  <span className="text-[10px] text-text-muted w-20 text-right shrink-0">UI-78</span>
                  <div className="w-[25%]" />
                  <div className="h-5 rounded bg-accent/80 flex-1 max-w-[35%]" />
                </div>
                <div className="col-span-6 flex items-center gap-2 py-2">
                  <span className="text-[10px] text-text-muted w-20 text-right shrink-0">DB-23</span>
                  <div className="w-[10%]" />
                  <div className="h-5 rounded bg-medium/80 flex-1 max-w-[45%]" />
                </div>
                <div className="col-span-6 flex items-center gap-2 py-2">
                  <span className="text-[10px] text-text-muted w-20 text-right shrink-0">DOCS-9</span>
                  <div className="w-[50%]" />
                  <div className="h-5 rounded bg-low/60 flex-1 max-w-[30%]" />
                </div>
              </div>
              <p className="text-xs text-text-muted">Interactive Gantt chart with drag-to-reschedule, real-time sync, and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything you need
          </h2>
          <p className="text-text-secondary text-center max-w-xl mx-auto mb-16">
            A full-featured Gantt chart that works seamlessly with your Linear workflow.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-bg-card border border-border-primary hover:border-border-secondary transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-accent/5 border border-accent/15">
          <h2 className="text-3xl font-bold mb-4">Ready to visualize your roadmap?</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Connect your Linear account in seconds. No credit card required.
          </p>
          <Link
            to="/app"
            className="inline-flex px-8 py-3.5 bg-accent text-white text-base font-semibold rounded-xl hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="4" y1="8" x2="16" y2="8" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-text-secondary">GanttSmart</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/sideq-io/linear-gantt" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              GitHub
            </a>
            <span className="text-xs text-text-muted">
              Built by <a href="https://sideq.io" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">sideq.io</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
