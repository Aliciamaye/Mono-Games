# Repository Structure Guide

## Three-Repository Architecture

Mono Games uses a **three-repository architecture** to maintain security, scalability, proper separation of concerns, and backup redundancy:

### 1. **Mono-Games** (Public Distribution)
**Repository:** `https://github.com/Raft-The-Crab/Mono-Games.git`

**Purpose:** Public distribution, documentation, and client-side assets

**What SHOULD be committed here:**
- ✅ Client-side code (`src/client/`)
- ✅ Public assets (images, icons, fonts, sounds)
- ✅ Documentation (`README.md`, `docs/`, guides)
- ✅ Build configurations (`vite.config.js`, `package.json`)
- ✅ License and contributing guidelines
- ✅ Landing page and marketing materials

**What should NEVER be committed here:**
- ❌ Server implementation code
- ❌ Database schemas or migrations
- ❌ API secrets, keys, or credentials
- ❌ User data or game saves
- ❌ Authentication tokens
- ❌ Private business logic

---

### 2. **Mono-Data** (Backend Repository)
**Repository:** `https://github.com/Raft-The-Crab/Mono-Data.git`

**Purpose:** Backend services, cloud storage, and private server logic

**What SHOULD be committed here:**
- ✅ Server implementation (`src/server/`)
- ✅ Database schemas and migrations
- ✅ API route handlers
- ✅ Cloud sync logic
- ✅ Leaderboard and achievement systems
- ✅ Analytics and monitoring

**What should NEVER be committed here:**
- ❌ Environment files (`.env`)
- ❌ API keys and credentials
- ❌ User data files (use database or cloud storage)
- ❌ Session tokens

---

### 3. **Mono-Games-Backup** (Complete Backup)
**Repository:** `https://github.com/Raft-The-Crab/Mono-Games-Backup.git`

**Purpose:** Full project backup with NO gitignore restrictions - disaster recovery

**What SHOULD be committed here:**
- ✅ **EVERYTHING** from the project (complete backup)
- ✅ All source code (client + server)
- ✅ Configuration files
- ✅ Build artifacts (for recovery)
- ✅ Documentation
- ✅ Assets and resources

**IMPORTANT Security Notes:**
- ⚠️ This repository MUST be **PRIVATE**
- ⚠️ Never include actual `.env` files with real credentials
- ⚠️ Never include user data or sensitive information
- ⚠️ Use for disaster recovery and accidental deletion protection only
- ⚠️ Access should be limited to core team members only

**Use Case:** If files are accidentally deleted from Mono-Games or Mono-Data, this backup can restore them.

---

## Directory Structure

### Mono-Games (Public Distribution)
```
mono-games/
├── src/
│   └── client/              # ✅ Client-side React app
│       ├── components/      # ✅ UI components
│       ├── games/           # ✅ Game implementations
│       ├─ pages/           # ✅ App pages
│       ├── services/        # ✅ Client services (API calls)
│       ├── styles/          # ✅ CSS and themes
│       └── utils/           # ✅ Client utilities
├── public/                  # ✅ Static assets
├── docs/                    # ✅ Documentation
├── landing-page/            # ✅ Marketing site
├── README.md                # ✅ Project documentation
├── LICENSE                  # ✅ License file
└── .gitignore               # ✅ Git ignore patterns
```

### Mono-Data (Private Backend)
```
mono-data/
├── src/
│   └── server/              # ✅ Node.js/Express server
│       ├── routes/          # ✅ API endpoints
│       ├── middleware/      # ✅ Auth, validation, etc.
│       ├── services/        # ✅ Business logic
│       ├── database/        # ✅ DB connection & queries
│       └── utils/           # ✅ Server utilities
├── migrations/              # ✅ Database migrations
├── seeds/                   # ✅ Initial data
├── user-data/               # ✅ Player data (JSON files)
├── cloud-sync/              # ✅ Sync metadata
└── .env.example             # ✅ Environment template
```

### Mono-Games-Backup (Complete Backup - PRIVATE)
```
mono-games-backup/
├── src/
│   ├── client/              # ✅ Full client backup
│   └── server/              # ✅ Full server backup
├── All files from both repositories
└── Complete project structure (no gitignore)

---

## Development Workflow

### Working on Client (Mono-Games)
1. Clone the repository:
   ```bash
   git clone https://github.com/Raft-The-Crab/Mono-Games.git
   cd mono-games
   ```

2. Install dependencies:
   ```bash
   npm install
   cd src/client && npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Make changes to client code, commit, and push to `Mono-Games`

### Working on Server (Mono-Data)
1. Clone the backend repository:
   ```bash
   git clone https://github.com/Raft-The-Crab/Mono-Data.git
   cd mono-data
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Install dependencies:
   ```bash
   npm install
   cd src/server && npm install
   ```

4. Start server:
   ```bash
   npm run dev:server
   ```

5. Make changes to server code, commit, and push to `Mono-Data`

### Full-Stack Development
When working on features that span client and server:

1. Have both repositories cloned side-by-side:
   ```
   projects/
   ├── mono-games/    # Client repository
   └── mono-data/     # Server repository
   ```

2. Run both dev servers:
   ```bash
   # Terminal 1 (mono-games)
   cd mono-games
   npm run dev

   # Terminal 2 (mono-data)
   cd mono-data
   npm run dev:server
   ```

3. Client will connect to server at `http://localhost:5000`

---

## Security Best Practices

### For Contributors

1. **Never commit sensitive data**
   - Always check files before committing
   - Use `git status` and review changes
   - The `.gitignore` is configured to block most sensitive files

2. **Environment variables**
   - Use `.env` files for secrets (never commit these!)
   - Use `.env.example` for templates (safe to commit)

3. **API Keys**
   - Store in `.env` or secure vault
   - Never hardcode in source files
   - Use environment variables

4. **Code Review**
   - Review all changes before pushing
   - Check for accidentally committed secrets
   - Verify correct repository for your changes

### Repository Maintainers

1. **Access Control**
   - `Mono-Games`: Public or private (your choice)
   - `Mono-Data`: **MUST be private**

2. **GitHub Secrets**
   - Use GitHub Secrets for CI/CD credentials
   - Never expose database connection strings
   - Rotate API keys regularly

3. **Audit Logs**
   - Review commit history for leaks
   - Use tools like `git-secrets` or `truffleHog`

---

## Common Mistakes to Avoid

❌ **Don't commit to wrong repository**
- Server code belongs in Mono-Data, not Mono-Games
- Check `git remote -v` before pushing

❌ **Don't commit `.env` files**
- Use `.env.example` instead
- Document required variables

❌ **Don't commit user data**
- User saves and data go in database/cloud
- Not in git repositories

❌ **Don't hardcode secrets**
- Use environment variables
- Use configuration files (that are gitignored)

---

## Questions?

- **Why two repositories?** Security and separation of concerns. Client code can be public while server remains private.
- **Can I have everything in one repo?** Not recommended for security reasons.
- **How do I deploy?** Mono-Games builds to static files, Mono-Data deploys as Node.js service.

For more information, see the main [README.md](README.md)
