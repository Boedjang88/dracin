# 🐉 Dracin - Premium Chinese Drama Streaming (PWA)

**Dracin** is a high-performance, Netflix-style streaming web application built with Next.js 15, specialized for Chinese Dramas (C-Drama). It features a premium glassmorphism UI, interactive hover cards, and a robust authentication system.

![Dracin Hero](/public/manifest-icon-512.png) 
*(Note: Replace with actual screenshot if available)*

## ✨ Key Features

### 🎬 Premium User Experience
- **Netflix-Style Hero Billboard**: Full-width interactive hero section with autoplay video backgrounds, mute controls, and "Ken Burns" zoom effects.
- **Hover Preview Cards**: Drama posters expand on hover (1.4x scale) to reveal quick stats, match score, rating, and genres—just like Netflix.
- **Brand Category Banners**: Distinct, immersive headers for special categories (e.g., "Wuxia & Martial Arts" in Orange, "Heart-Wrenching" in Pink).
- **Glassmorphism UI**: Heavy blur effects (`backdrop-filter`) on sidebars, mobile navigation, and overlay buttons for a modern aesthetic.

### 📺 Advanced Video Player
- **Immersive Playback**: Full-viewport height video player.
- **Interactive Overlay**: Custom controls that appear on hover.
- **Slide-Up Info Panel**: Access episode list and drama details without leaving the player.
- **Smart Navigation**: "Next Episode" and "Previous Episode" buttons appear dynamically on the sides.

### 🔐 Authentication & Personalization
- **Secure Auth**: Powered by NextAuth.js (v5 Beta) with support for Credentials and OAuth (Google/GitHub ready).
- **Public & Private Routes**: 
  - **Public**: Home, Browse, and Drama Details are accessible to everyone.
  - **Private**: Watching content (`/watch/:id`) requires login. Unauthenticated users are redirected to sign-in.
- **Continue Watching**: Automatically tracks playback progress per user and displays a "Continue Watching" row on the home page.
- **My List**: Add/remove dramas to your personal watchlist.

### ⚡ Technical Highlights
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, Framer Motion for animations.
- **Database**: SQLite (via Prisma ORM) for easy local development.
- **PWA Ready**: Installable on mobile devices with standalone mode support.
- **Performance**: Optimized images, dynamic imports, and route prefetching.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [SQLite](https://www.sqlite.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js (Auth.js)](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/dracin.git
    cd dracin
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file in the root:
    ```env
    DATABASE_URL="file:./dev.db"
    AUTH_SECRET="your-generated-secret-here" # Run: openssl rand -base64 32
    ```

4.  **Initialize Database**
    ```bash
    npm run db:push
    npm run db:seed  # Populates initial data
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔑 Test Credentials

The seed script creates a default test user for development:

- **Email**: `test@dracin.app`
- **Password**: `password123`

You can also create new accounts via the registration page at `/auth`.

## 🛠️ Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Reset and regenerate database
npx prisma db push --force-reset
npm run db:seed
```

### Build Errors
```bash
# Clean install
rm -rf node_modules .next
npm install
npx prisma generate
```

## 📱 Mobile Support
Dracin is designed as a **Progressive Web App (PWA)**.
- **Mobile Navigation**: Bottom tab bar with glassmorphism effect.
- **Touch Optimized**: Large touch targets for play buttons and cards.
- **Safe Area Support**: Handles notch and home indicator areas correctly.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open-source and available under the MIT License.
