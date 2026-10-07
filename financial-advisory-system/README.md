# Financial Advisory Expert System

A full-stack, rule-based expert system providing personalized financial recommendations and portfolio allocation advice based on client financial profiles.

## Architecture

- **Backend (`/prolog`)**: SWI-Prolog expert system providing pure domain logic (`rules.pl`), exposed as a JSON HTTP server (`server.pl`) on port 8080.
- **Frontend (`/web`)**: Next.js App Router application with responsive financial profile input form, real-time savings rate calculation, and strategic recommendation cards.
- **API Proxy**: Next.js API route (`/api/advise`) acts as a secure proxy to the Prolog service, keeping the backend isolated.

## Quick Start

### 1. Prolog Backend

```bash
cd prolog
swipl server.pl
# Runs on http://localhost:8080
```

To run unit tests:

```bash
cd prolog
swipl -g run_tests -t halt tests.pl
```

### 2. Next.js Frontend

```bash
cd web
npm install
npm run dev
# Accessible at http://localhost:3000
```
