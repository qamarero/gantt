<p align="center">
  <img src="https://img.shields.io/badge/GanttSmart-The_Gantt_chart_Linear_is_missing-5e6ad2?style=for-the-badge&labelColor=0f1117" alt="GanttSmart" />
</p>

<p align="center">
  <a href="https://github.com/sideq-io/ganttsmart/stargazers"><img src="https://img.shields.io/github/stars/sideq-io/ganttsmart?style=flat-square&color=58a6ff&labelColor=161b22" alt="Stars" /></a>
  <a href="https://github.com/sideq-io/ganttsmart/network/members"><img src="https://img.shields.io/github/forks/sideq-io/ganttsmart?style=flat-square&color=58a6ff&labelColor=161b22" alt="Forks" /></a>
  <a href="https://github.com/sideq-io/ganttsmart/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-f85149?style=flat-square&labelColor=161b22" alt="License" /></a>
  <a href="https://ganttsmart.com"><img src="https://img.shields.io/badge/live-ganttsmart.com-238636?style=flat-square&labelColor=161b22" alt="Live" /></a>
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178c6?style=flat-square&labelColor=161b22" alt="TypeScript" />
  <a href="https://github.com/sideq-io/ganttsmart/commits/main"><img src="https://img.shields.io/github/last-commit/sideq-io/ganttsmart?style=flat-square&color=8b949e&labelColor=161b22" alt="Last commit" /></a>
</p>

<p align="center">
  <strong>Interactive Gantt chart for Linear</strong> — visualize your roadmap, drag to reschedule, filter by team, and share with stakeholders. Built for teams that use <a href="https://linear.app">Linear</a> and need timeline visibility.
</p>

---

## Why GanttSmart?

Linear is a fantastic project management tool, but it lacks one critical view: **a Gantt chart**. GanttSmart fills that gap.

Connect your Linear account, pick a project, and instantly see every issue plotted on an interactive timeline. Drag bars to reschedule. Click to view details. Share a read-only link with clients. Export for your next standup.

**No spreadsheets. No manual entry. Just your Linear data, on a timeline.**

---

## Features

- **Interactive timeline** — Bars with start dates, due dates, and drag handles for rescheduling (writes back to Linear)
- **Multi-project support** — Switch between any Linear project in your workspace
- **Smart filtering** — Filter by assignee, status, priority, or search across all tasks
- **Collapsible groups** — Group by assignee, priority, or status with collapse/expand
- **Dependency arrows** — Visualize blocking/blocked relationships between issues
- **Milestones** — Diamond markers on the timeline for project milestones
- **Progress indicators** — Sub-issue completion percentage shown on each bar
- **Drag to reschedule** — Drag bar edges to change start/due dates, or move the entire bar
- **Inline status cycling** — Click the status dot to cycle Todo → In Progress → Done
- **Click-to-open detail panel** — Slide-out panel with full issue details, description, and a link to Linear
- **Zoom controls** — Zoom in/out on the timeline with keyboard shortcuts (+/-)
- **Real-time sync** — Auto-polls Linear every 30 seconds; changes appear without manual refresh
- **Undo** — Ctrl+Z to undo any drag or status change
- **Export** — PNG, PDF, or print-friendly view for meetings
- **Shareable links** — Generate public or password-protected URLs for client roadmap visibility
- **Dark & light themes** — Three modes: Light, Dark, System
- **Responsive** — Works on desktop, tablet, and mobile
- **Resizable columns** — Drag column borders to adjust widths

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **Linear Integration** | Linear OAuth + GraphQL API via Supabase Edge Function |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **Export** | html-to-image, jsPDF |
| **Deployment** | Netlify |
| **Routing** | React Router v7 |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A [Supabase](https://supabase.com/) project
- A [Linear](https://linear.app/) account with API access

### Setup

```bash
# Clone the repo
git clone https://github.com/sideq-io/ganttsmart.git
cd ganttsmart

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and Linear credentials

# Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_LINEAR_CLIENT_ID` | Linear OAuth application client ID |
| `VITE_LINEAR_REDIRECT_URI` | OAuth callback URL (`http://localhost:5173/callback` for dev) |

### Supabase Setup

1. Create a Supabase project
2. Run the migrations to create the `user_settings` and `shared_roadmaps` tables
3. Deploy the `linear-oauth-callback` Edge Function
4. Configure Google OAuth provider in Supabase dashboard (optional)
5. Set Edge Function secrets: `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `LINEAR_REDIRECT_URI`

### Linear OAuth Setup

1. Go to [Linear Settings → API → OAuth Applications](https://linear.app/settings/api/applications)
2. Create a new application with redirect URI matching `VITE_LINEAR_REDIRECT_URI`
3. Copy the Client ID and Client Secret

---

## Deployment

### Netlify

```bash
# Build for production
npm run build

# Deploy (or connect your GitHub repo to Netlify for auto-deploys)
```

Set the same environment variables in your Netlify project settings. The included `netlify.toml` handles SPA routing and build configuration.

### Custom Domain

Point your domain's DNS to Netlify. SSL is provisioned automatically.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `R` | Refresh data |
| `+` / `=` | Zoom in |
| `-` / `_` | Zoom out |
| `Ctrl+Z` | Undo last action |
| `Escape` | Clear search / close panels |

---

## Architecture

```
src/
├── api/            # Linear GraphQL API layer
├── components/     # React components (GanttChart, FilterBar, DetailPanel, etc.)
├── hooks/          # Custom hooks (useAuth, useLinearData, useTheme)
├── lib/            # Supabase client
├── pages/          # Route pages (Landing, Callback, SharedView, NotFound)
├── utils/          # Helpers (export, avatar generation)
└── types.ts        # TypeScript type definitions
```

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

| Permitted | Required | Forbidden |
|---|---|---|
| Commercial use | Disclose source | Liability |
| Modification | License & copyright notice | Warranty |
| Distribution | Same license | |
| Patent use | Network use is distribution | |
| Private use | State changes | |

The AGPL-3.0 is a strong copyleft license. If you modify GanttSmart and make it available over a network (e.g., as a SaaS), you must release your modified source code under the same license.

See [LICENSE](LICENSE) for the full text.

**Copyright (C) 2025-2026 Michel Bitar / [sideq.io](https://sideq.io)**

---

## Author

Built by **[sideq.io](https://sideq.io)**

---

<p align="center">
  <sub>If GanttSmart helps your team, consider giving it a &#11088; on GitHub.</sub>
</p>
