# The Thing

A modern full-stack monorepo project featuring a robust TypeScript/Node.js API and a performant Next.js client application. Built with enterprise-grade tooling using Lerna for monorepo management and pnpm for efficient package handling. The backend leverages Prisma ORM with PostgreSQL for reliable data persistence.

## 🏗 Monorepo Structure

- `packages/api` – Production-ready Express.js API server with TypeScript and Prisma
- `packages/client` – Modern Next.js frontend with React 18 and Tailwind CSS
- Orchestrated with [Lerna](https://lerna.js.org/) and [pnpm](https://pnpm.io/) for optimal workflow

## 🚀 Getting Started

### System Requirements

- Node.js (v18+ LTS recommended)
- pnpm (v8+ recommended)
- Docker Desktop (for PostgreSQL containerization)
- Git

### Quick Start Guide

1. **Clone and Setup:**

   ```bash
   git clone <your-repo-url>
   cd the-thing
   ```

2. **Install Project Dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment:**

   - Create environment files:

     ```bash
     cp .env.example .env
     ```

   - Launch PostgreSQL container:

     ```bash
     docker-compose up -d
     ```

4. **Initialize Database:**

   ```bash
   cd packages/api
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

### Development Workflow

Start the development environment:
