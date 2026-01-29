# Dracin - Chinese Drama Streaming Platform

<p align="center">
  <strong>🎬 A Netflix-style streaming platform for Chinese dramas</strong>
</p>

<p align="center">
  Built with Next.js 15 · TypeScript · Tailwind CSS · Prisma
</p>

---

## 📖 Table of Contents

- [What is Dracin?](#-what-is-dracin)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [FAQ](#-faq)

---

## 🎯 What is Dracin?

Dracin is a **video streaming platform** specifically designed for Chinese drama (C-Drama) content. Think of it like Netflix, but focused on Asian drama content.

### Why was it built this way?

Dracin uses a special architecture called **BFF (Backend-for-Frontend)**. Here's what that means in simple terms:

```
┌─────────────────────────────────────────────────────────────┐
│  What the user sees (Browser)                               │
│  ↓                                                          │
│  Dracin Server (Next.js) ← This is the "middleman"          │
│  ↓                                                          │
│  External Video APIs (where videos actually come from)       │
└─────────────────────────────────────────────────────────────┘
```

**Why use a middleman?**
1. **Security** - API keys and secrets stay on the server
2. **Control** - We can cache, filter, and transform data
3. **User Data** - We store user preferences separately from video content

---

## ✨ Features

### For Users
| Feature | Description |
|---------|-------------|
| 🎬 **Video Streaming** | Watch episodes with custom player |
| 📱 **Mobile Friendly** | Works on phones, tablets, desktops |
| 🔐 **User Accounts** | Sign up, log in, track progress |
| ❤️ **Watchlist** | Save dramas to watch later |
| 📊 **Resume Watching** | Pick up where you left off |
| 🔍 **Search** | Find dramas by title |

### For Developers
| Feature | Description |
|---------|-------------|
| 🏗️ **Modern Stack** | Next.js 15 App Router |
| 📝 **TypeScript** | Full type safety |
| 🎨 **Tailwind CSS** | Utility-first styling |
| 🗄️ **Prisma ORM** | Type-safe database access |
| 🔒 **NextAuth.js** | Production-ready auth |
| 📊 **Structured Logging** | Debug-friendly logs |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dracin.git
cd dracin
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required packages. It may take a few minutes.

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` in your editor. You'll see:

```env
# Database connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Authentication secret (IMPORTANT: change this!)
AUTH_SECRET="replace_with_your_secure_random_string"
```

**Generate a secure AUTH_SECRET:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Use this website
# https://generate-secret.vercel.app/32
```

#### 4. Set Up the Database

```bash
# Create database tables
npx prisma db push

# Generate Prisma client
npx prisma generate
```

#### 5. Start Development Server

```bash
npm run dev
```

#### 6. Open in Browser

Visit **http://localhost:3000**

🎉 **You should see the Dracin homepage!**

---

## 📁 Project Structure

Here's what each folder contains:

```
dracin/
├── 📁 docs/                    # Documentation (you are here!)
├── 📁 prisma/                  # Database schema
│   └── schema.prisma           # Table definitions
├── 📁 public/                  # Static files (images, icons)
├── 📁 src/                     # Source code
│   ├── 📁 app/                 # Pages and API routes
│   │   ├── 📁 api/             # Backend API endpoints
│   │   ├── 📁 browse/          # Browse page
│   │   ├── 📁 drama/[id]/      # Drama detail page
│   │   ├── 📁 watch/[id]/      # Video player page
│   │   └── page.tsx            # Homepage
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 home/            # Homepage components
│   │   ├── 📁 layout/          # Navigation, shells
│   │   ├── 📁 player/          # Video player
│   │   └── 📁 ui/              # Base UI components
│   ├── 📁 lib/                 # Utilities and services
│   │   ├── 📁 services/        # Video provider, logger
│   │   ├── auth.ts             # Authentication config
│   │   └── prisma.ts           # Database client
│   └── 📁 store/               # State management (Zustand)
├── .env.example                # Environment template
├── package.json                # Dependencies
└── README.md                   # This file!
```

---

## 🔄 How It Works

### User Flow

```
1. User visits homepage
   ↓
2. Server fetches drama list from Video Provider
   ↓
3. User clicks on a drama
   ↓
4. Server fetches drama details + episodes
   ↓
5. User clicks "Play"
   ↓
6. Server returns stream URL
   ↓
7. Video plays in custom player
   ↓
8. Progress saved to database every 30 seconds
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
├──────────────────────────────────────────────────────────────────┤
│  - React components                                               │
│  - User interactions                                              │
│  - Video player                                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Server)                          │
├──────────────────────────────────────────────────────────────────┤
│  /api/dramas      → Fetch drama list                             │
│  /api/episodes    → Fetch episode with stream URL                 │
│  /api/user/*      → User-specific operations                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     VIDEO PROVIDER      │     │       DATABASE          │
├─────────────────────────┤     ├─────────────────────────┤
│  - Drama metadata       │     │  - User accounts        │
│  - Episode info         │     │  - Watch progress       │
│  - Stream URLs          │     │  - Favorites            │
│  (External API)         │     │  - Watch history        │
└─────────────────────────┘     └─────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `AUTH_SECRET` | Yes | Secret for signing sessions |
| `AUTH_GITHUB_ID` | No | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | No | GitHub OAuth client secret |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |

### Database Options

**Production (Supabase PostgreSQL - recommended):**
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

Get these from your Supabase project: **Settings > Database > Connection String**

---

## 💻 Development Guide

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Check code quality |

### Database Commands

| Command | Description |
|---------|-------------|
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Create migration |

### Adding a New Page

1. Create folder in `src/app/`:
   ```
   src/app/my-page/page.tsx
   ```

2. Add your component:
   ```tsx
   export default function MyPage() {
     return <div>Hello World</div>
   }
   ```

3. Visit `http://localhost:3000/my-page`

### Adding a New API Route

1. Create folder in `src/app/api/`:
   ```
   src/app/api/my-endpoint/route.ts
   ```

2. Add handler:
   ```typescript
   import { NextResponse } from 'next/server'

   export async function GET() {
     return NextResponse.json({ message: 'Hello!' })
   }
   ```

3. Access at `http://localhost:3000/api/my-endpoint`

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

---

## 📚 Documentation

Detailed documentation available in `docs/`:

| Document | What You'll Learn |
|----------|-------------------|
| [Architecture](./docs/architecture.md) | How the system is designed |
| [API Reference](./docs/api.md) | All available endpoints |
| [Database Schema](./docs/database.md) | Data structure |
| [Security](./docs/security.md) | Security practices |
| [UI Guidelines](./docs/ui.md) | Design system |

---

## ❓ FAQ

### Q: Where do the videos come from?

The project uses a **Video Provider** abstraction. By default, it uses mock data for development. In production, you would implement a real provider that connects to your video source.

### Q: Can I use this for my own streaming site?

Yes! This is open source under MIT license. You need to:
1. Implement your own Video Provider
2. Have legal rights to stream the content

### Q: How do I add real video content?

Create a new provider in `src/lib/services/video-provider/` that implements the `VideoProvider` interface. See `mock-provider.ts` for reference.

### Q: The images are broken (404 errors)?

The mock data uses placeholder image URLs. Replace them in the mock provider or implement a real provider with valid image URLs.

### Q: How do I enable OAuth login?

1. Create OAuth app on [GitHub](https://github.com/settings/developers) or [Google Console](https://console.developers.google.com/)
2. Add client ID and secret to `.env`
3. Restart the server

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

<p align="center">
  Made with ❤️ for drama lovers
</p>
