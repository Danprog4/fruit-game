# 🍎 Fruit Game

A Telegram mini-app game built with Tanstack, TRPC, and TON blockchain integration where players can grow fruits, join alliances, and compete in seasonal leaderboards.

## 🚀 Features

- **Telegram Mini App**: Seamless authentication via Telegram
- **Alliance System**: Create and join alliances with other players
- **Season-based Gameplay**: Compete in seasonal leaderboards
- **TON Blockchain Integration**: Connect TON wallets and perform transactions
- **Farming Mechanism**: Grow and harvest various fruits
- **Social Features**: Invite friends and build your network
- **Real-time Updates**: Stay synchronized with other players

## 🔧 Tech Stack

- **Frontend**: React 19, Tanstack Router, Tanstack Query
- **Backend**: TRPC, Drizzle ORM, PostgreSQL (Neon Database)
- **Blockchain**: TON Connect, TON SDK
- **Styling**: TailwindCSS 4
- **Storage**: Cloudflare R2
- **Development**: Bun, Vinxi, TypeScript

## 💻 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database
- Telegram Bot (for authentication)
- Node.js 18+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fruit-game.git
   cd fruit-game
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `BOT_TOKEN`: Your Telegram bot token
   - `JWT_SECRET`: Secret for JWT authentication
   - `R2_*`: Cloudflare R2 storage credentials

5. Start the development server:
   ```bash
   bun dev
   ```

6. For testing with Telegram outside your local network:
   ```bash
   bun ngrok
   ```

## ⚙️ Configuration

1. Update `app.config.ts` with your ngrok domain in the `allowedHosts` array
2. Configure your Telegram Bot to work with your application
3. Set up database schema using Drizzle:
   ```bash
   bun db:push
   ```

## 🗂️ Project Structure

```
fruit-game/
├── src/
│   ├── lib/           # Core utilities and shared code
│   │   ├── db/        # Database configuration and schema
│   │   ├── utils/     # Utility functions
│   │   ├── s3/        # Storage utilities
│   │   └── web3/      # TON blockchain integration
│   ├── routes/        # Tanstack router routes
│   ├── trpc/          # TRPC API definitions
│   └── components/    # React components
├── public/            # Static assets
└── scripts/           # Build and deployment scripts
```

## 🚀 Development Workflow

1. Start the development server with hot reloading:
   ```bash
   bun dev
   ```

2. Run ngrok for testing with Telegram:
   ```bash
   bun ngrok
   ```

3. Update database schema (after changes):
   ```bash
   bun db:push
   ```

4. Run the web3 worker (if needed):
   ```bash
   bun web3-worker
   ```

## 📦 Building for Production

```bash
bun build
```

This will build the application for production and push database schema changes.

## 📝 Scripts

- `bun dev` - Start development server
- `bun db:push` - Push database schema changes
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Lint code
- `bun format` - Format code
- `bun deps` - Check for dependency updates
- `bun ngrok` - Start ngrok tunnel
- `bun web3-worker` - Run web3 worker

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with [Tanstack Start](https://tanstack.com/start) and [TRPC](https://trpc.io/)
