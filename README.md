# Sudoku Trainer

A web-based Sudoku trainer that teaches solving techniques through structured lessons and guided practice. Built with React, Vite, and Supabase.

## Project Overview

Sudoku Trainer is an interactive learning platform designed to help sudoku enthusiasts master solving techniques progressively. The application combines educational lessons with immediately-applicable practice puzzles, creating a guided learning path from beginner to expert level.

**Key Features:**
- 10-level structured curriculum (currently shipping L1–L3 in MVP)
- Guided lessons teaching specific solving techniques
- Interactive practice puzzles requiring the learned technique
- Progress tracking with optional Supabase authentication
- Guest mode for exploring without an account
- Responsive design optimized for desktop and tablet

## Tech Stack

- **Frontend:** React 19.2.4, Vite 8.0.4, TypeScript 6.0
- **Styling:** Tailwind CSS 4.2.2
- **Routing:** React Router 7.14.0
- **Backend:** Supabase (authentication, progress persistence)
- **Testing:** Vitest 4.1.4, React Testing Library
- **Linting:** ESLint 9.39.4
- **Code Formatting:** Prettier 3.8.2

## Features

### Guided Lessons
Each technique level includes a lesson page that teaches the concept step-by-step with visual examples and clear explanations.

### Interactive Practice
After completing a lesson, users engage with algorithmically-generated sudoku puzzles that specifically require the learned technique to solve.

### Progress Tracking
- Persistent progress saved to Supabase (optional login)
- Guest mode stores progress locally in browser
- View completed lessons and unlocked levels in the curriculum

### Guest & Authenticated Modes
- **Guest Mode:** Explore the application, practice puzzles, and track progress locally without creating an account
- **Authenticated Mode:** Sign up or log in to sync progress across devices and maintain long-term learning history

## Getting Started

### Prerequisites
- Node.js 18+ with npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/geofas/turbo-disco.git
   cd turbo-disco
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional for guest mode):
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5173

## Environment Variables

The application works out-of-the-box in guest mode. To enable Supabase authentication and progress persistence, set these optional variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Obtain these values from your Supabase project settings. Without these variables, the app gracefully falls back to local storage for progress tracking.

## Available Scripts

### Development
```bash
npm run dev          # Start dev server with hot module reload
npm run preview      # Preview production build locally
```

### Production
```bash
npm run build        # Build optimized production bundle
```

### Code Quality
```bash
npm run lint         # Check code with ESLint
npm run format       # Format code with Prettier
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI dashboard
```

## Project Structure

```
src/
├── components/       # Reusable React components (Header, Navigation, etc.)
├── pages/           # Page components (Lesson, Practice, Curriculum, Profile)
├── contexts/        # React contexts (AuthContext, ProgressContext)
├── services/        # API integration (Supabase client)
├── utils/           # Utility functions (sudoku solver, puzzle generation)
├── styles/          # Global styles and Tailwind config
└── App.tsx          # Main app router and provider setup
```

### Core Pages
- **Landing:** Welcome page with app overview
- **Curriculum:** View all available levels and learning progress
- **Lesson:** Guided technique tutorial with examples
- **Practice:** Interactive sudoku puzzle requiring the taught technique
- **Profile:** User account settings and progress overview
- **Auth:** Login/signup interface

## Docker Deployment

### Build Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t sudoku-trainer:latest .
```

### Run Container
```bash
docker run -p 8080:80 sudoku-trainer:latest
```

The app will be available at http://localhost:8080

### Using Docker Compose
```bash
# Create a .env file with Supabase credentials
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Build and run
docker-compose up
```

Access the app at http://localhost:8080

### Container Details
- **Base Image:** node:20-alpine (build) to nginx:alpine (runtime)
- **Multi-stage Build:** Minimizes final image size by excluding build tools
- **Health Check:** Built-in health endpoint to verify container status
- **Gzip Compression:** Enabled for text assets
- **Cache Strategy:** Immutable assets cached for 1 year; index.html never cached
- **Security Headers:** Frame protection, MIME type sniffing prevention, referrer policy

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit changes: git commit -m 'Add feature description'
4. Push to branch: git push origin feature/your-feature
5. Open a pull request

Ensure code passes linting and tests before submitting:
```bash
npm run lint
npm run test
npm run format
```

## License

MIT License. See LICENSE file for details.

---

**Repository:** https://github.com/geofas/turbo-disco
**Issues & Feedback:** GitHub Issues
**Questions?** Check out the Notion knowledge base or open an issue.
