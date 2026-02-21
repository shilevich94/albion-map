# Albion Map

Monorepo for building Albion maps with mark annotations. Contains a React SPA (client) and a REST API (server), both using TypeScript, Docker, ESLint, and Prettier. Managed with [Rush](https://rushjs.io/).

## Structure

- **client/** – Frontend (Vite, React 18, Redux Toolkit, RTK Query, Material-UI), [FSD](https://feature-sliced.design/) architecture
- **server/** – Backend (Node.js, Express, MongoDB, Mongoose)
- **common/** – Rush shared config (auto-generated)

## Prerequisites

- Node.js 20+
- [Rush](https://rushjs.io/pages/intro/get_started/): `npm install -g @microsoft/rush`
- For local API: MongoDB (e.g. Docker or local install)

## Setup

```bash
# Install Rush globally (if not already)
npm install -g @microsoft/rush

# Clone and install dependencies for all projects
cd albion-map
rush update

# Build all projects
rush build
```

## Development

```bash
# Run client dev server (with Vite proxy to API)
rushx --to albion-map-client run dev

# In another terminal: run server dev (requires MongoDB)
rushx --to albion-map-server run dev
```

- Client: http://localhost:5173 (Vite default)
- Server: http://localhost:4000
- Set `MONGODB_URI` for the server if MongoDB is not on `localhost:27017`.

## Docker

Run client, server, and MongoDB with Docker Compose:

```bash
docker compose up --build
```

- Client: http://localhost:3000  
- Server: http://localhost:4000  
- MongoDB: localhost:27017 (internal to compose)

## Scripts

| Command | Purpose |
|--------|---------|
| `rush update` | Install/update dependencies after changing package.json or rush.json |
| `rush build` | Incremental build of all projects |
| `rush rebuild` | Clean full rebuild |
| `rushx --to albion-map-client run dev` | Start client dev server |
| `rushx --to albion-map-server run dev` | Start server dev server |
| `rushx --to albion-map-client run lint` | Lint client |
| `rushx --to albion-map-server run lint` | Lint server |

## Tech stack

- **Client:** React 18, Redux Toolkit, RTK Query, Vite, Material-UI, TypeScript, ESLint, Prettier
- **Server:** Node.js, Express, MongoDB, Mongoose, TypeScript, ESLint, Prettier
