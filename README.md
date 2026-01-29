# Dracin - Chinese Drama Streaming Platform

A modern, Netflix-style streaming platform for Chinese dramas built with Next.js 15.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Run development server
npm run dev
```

Visit **http://localhost:3000**

## Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - NextAuth secret key (generate with `openssl rand -base64 32`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (BFF Pattern) |
| Database | Prisma + SQLite/PostgreSQL |
| Auth | NextAuth.js v5 |
| UI | Framer Motion, Lucide Icons |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── home/         # Homepage components
│   ├── layout/       # Navigation, shells
│   ├── player/       # Video player
│   └── ui/           # Reusable UI components
├── lib/              # Core utilities
│   ├── services/     # Video provider, logger
│   └── auth.ts       # Authentication config
└── store/            # Zustand state management
```

## Features

- 🎬 **Video Streaming** - Custom player with progress tracking
- 🔐 **Authentication** - Email/password + OAuth ready
- 📱 **Mobile First** - PWA-ready responsive design
- 🎨 **Premium UI** - Netflix-inspired dark theme
- 📊 **Watch History** - Resume where you left off
- ❤️ **Favorites** - Personal watchlist

## Documentation

See [`docs/`](./docs/) for detailed documentation:
- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Security](./docs/security.md)
- [UI Guidelines](./docs/ui.md)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
