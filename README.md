<div align="center">
  <img src="https://github.com/user-attachments/assets/2ec0f98b-636e-4b6e-8a28-b34e6b44ca83" alt="Dailo Logo" width="80" />
  <h1>Dailo</h1>
  <p>A minimalist focus dashboard for productivity enthusiasts.<br/>Customize your workspace with draggable widgets to stay focused and organized.</p>

  <img width="800" alt="Dailo Screenshot" src="https://github.com/user-attachments/assets/508b0418-fae6-467d-8145-fc539f34b9af" />
</div>

## Features

- **Pomodoro Timer** - Focus sessions with customizable durations, short/long breaks, and session tracking
- **Time Blocking** - Visual daily scheduler with color-coded categories
- **Lofi Music Player** - YouTube-based ambient music with multiple stations
- **Notes** - Rich text editor with TipTap for quick notes
- **Top 3 Priorities** - Focus on what matters most each day
- **Habits Tracker** - Daily habit tracking with completion status
- **Clock & Weather** - Real-time clock and local weather display
- **Excalidraw** - Whiteboard for sketching ideas and diagrams

## Tech Stack

- [Next.js 16](https://nextjs.org/) with React 19
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [@dnd-kit](https://dndkit.com/) for drag and drop
- [motion/react](https://motion.dev/) for animations
- [TipTap](https://tiptap.dev/) for rich text editing

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
├── app/                    # Next.js app router
├── components/
│   ├── dashboard/          # Dashboard layout components
│   ├── ui/                 # Base UI components
│   └── widgets/            # Widget components
│       ├── lofi/           # Lofi music player
│       ├── pomodoro/       # Pomodoro timer
│       └── timeblock/      # Time blocking
├── hooks/                  # Custom React hooks
└── lib/                    # Utilities and store
```

## License

MIT
