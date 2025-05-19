# The Thing

The Thing is an intelligent AI chatbot designed to understand, assist, and adapt. Powered by advanced language models, it integrates seamlessly with custom APIs and vector search to deliver fast, context-aware responses. Whether answering questions, handling tasks, or connecting with external systems, The Thing is built for versatility, performance, and real-world utility.

---

## 📦 Tech Stack Overview

### 🖥️ Frontend – `packages/client`
- **Framework:** [Next.js 15](https://nextjs.org/) with React 19
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge`, `tw-animate-css`
- **State Management:** Zustand
- **Data Fetching:** [React Query v5](https://tanstack.com/query/v5)
- **AI Integration:** `ai`, `@ai-sdk/google`, `@ai-sdk/react`
- **UI Components:** Radix UI, Lucide Icons, `react-syntax-highlighter`, `react-markdown`

### 🧠 Backend – `packages/api`
- **Framework:** [Express.js v5](https://expressjs.com/)
- **Language:** TypeScript
- **ORM:** Prisma v6 + PostgreSQL
- **Auth & Security:** `jsonwebtoken`, `cookie-parser`, `bcryptjs`, `cors`
- **API Docs:** Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- **Utilities:** `dotenv`, `ioredis`, `morgan`

---

## 🏗 Monorepo Structure

```

the-thing/
├── packages/
│   ├── api/      → Express.js backend (TypeScript, Prisma)
│   └── client/   → Next.js frontend (React 19, Tailwind CSS)
├── .env.example
├── docker-compose.yml
├── lerna.json
└── pnpm-workspace.yaml

````

Managed with:
- 🔧 [Lerna](https://lerna.js.org/)
- 📦 [pnpm](https://pnpm.io/) (v8+)

---

## 🚀 Getting Started

### ✅ System Requirements

- **Node.js** – v18+ (LTS recommended)
- **pnpm** – v8+ (`npm i -g pnpm`)
- **Docker Desktop** – For running PostgreSQL
- **Git**

---

### 🧪 Quick Start Guide

1. **Clone and Setup**

```bash
git clone <your-repo-url>
cd the-thing
````

2. **Install All Dependencies**

```bash
pnpm install
```

3. **Setup Environment**

```bash
cp .env.example .env
```

4. **Start PostgreSQL with Docker**

```bash
docker-compose up -d
```

5. **Initialize the Database**

```bash
cd packages/api
pnpm prisma generate
pnpm prisma migrate dev
```

---

### 🧑‍💻 Development Workflow

#### 1. Start the Backend (API)

```bash
pnpm --filter api dev
```

Runs the Express server at [http://localhost:4000](http://localhost:4000)

#### 2. Start the Frontend (Client)

```bash
pnpm --filter client dev
```

Runs the Next.js server at [http://localhost:3000](http://localhost:3000)

---

## 🛠 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/awesome-thing`
3. Make your changes and follow the existing code style
4. Commit and push: `git commit -m "feat: added awesome-thing"`
5. Open a PR with a clear description

---

## 🧩 Troubleshooting

* **PostgreSQL not connecting?**

  * Ensure Docker is running and the container is healthy (`docker ps`)

* **Env variables not loading?**

  * Double-check the `.env` files in the root and `packages/api`

* **Missing deps or build errors?**

  * Run: `pnpm install` again at the root

---

## 📚 Additional Resources

* [Lerna Documentation](https://lerna.js.org/)
* [pnpm Documentation](https://pnpm.io/)
* [Prisma ORM](https://www.prisma.io/)
* [Next.js](https://nextjs.org/)
* [Zod Validation](https://zod.dev/)
* [TanStack Query](https://tanstack.com/query/v5)

---

## 🧠 License

MIT — feel free to build on it, break it, and make it better.
