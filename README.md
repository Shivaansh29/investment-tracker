# Investment Tracker

> Track all your Indian investments (stocks, mutual funds, ETFs, FDs, gold) in one clean dashboard, with charts that show where your money is and how it's doing.

![CI](https://github.com/Shivaansh29/investment-tracker/actions/workflows/ci.yml/badge.svg)

**Live demo:** _coming soon_

## Features

- 🔐 Sign up and log in; your data is private to your account
- ➕ Add, edit, and delete holdings across asset types
- 📊 Dashboard with total invested, current value, and profit/loss
- 🍩 Allocation charts by asset type and by holding
- ₹ Indian number formatting (₹1,23,456.78)

## Tech stack

| Area               | Tools                                           |
| ------------------ | ----------------------------------------------- |
| Frontend           | Next.js (App Router), React, TypeScript         |
| Styling            | Tailwind CSS, shadcn/ui                         |
| Charts             | Recharts                                        |
| Backend & database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Testing            | Vitest, Playwright                              |
| CI/CD              | GitHub Actions, Vercel                          |

## Getting started

```bash
git clone https://github.com/Shivaansh29/investment-tracker.git
cd investment-tracker
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open http://localhost:3000.

| Script              | What it does               |
| ------------------- | -------------------------- |
| `npm run dev`       | Start the dev server       |
| `npm run lint`      | Lint with ESLint           |
| `npm run typecheck` | Type-check with TypeScript |
| `npm test`          | Run unit tests (Vitest)    |
| `npm run format`    | Format code with Prettier  |

## Roadmap

- [x] Project setup, CI pipeline
- [ ] Dashboard with charts
- [ ] Authentication
- [ ] Holdings CRUD backed by PostgreSQL
- [ ] Deploy to Vercel, demo account
- [ ] Live NSE/BSE and mutual fund prices
- [ ] XIRR returns, CSV import, portfolio history chart
