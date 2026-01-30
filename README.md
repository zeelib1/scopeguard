# 🛡️ ScopeGuard

**Stop scope creep before it costs you thousands.**

Simple scope tracking tool for freelancers and small agencies.

## The Problem

Freelancers lose thousands of dollars annually to scope creep - clients requesting "small additions" that weren't in the original agreement. You either:
- Say yes and work for free ❌
- Say no and damage the relationship ❌
- Try to negotiate mid-project (awkward) ❌

## The Solution

ScopeGuard tracks what's in your contract vs what clients are actually requesting, automatically flags overages, and generates change orders with one click.

## Core Features

### ✅ MVP (Phase 1)
- **Project Setup** - Define scope items with limits
- **Request Tracking** - Log every client request with timestamps
- **Scope Status Dashboard** - Visual progress bars and alerts
- **Change Order Generation** - One-click conversion of out-of-scope requests
- **Client Portal** - Transparent, read-only view for clients

### 🚀 Enhancements (Phase 2)
- Email notifications when approaching limits
- Analytics dashboard (scope creep trends per client)
- Email parsing (auto-detect requests from inbox)
- Pre-built templates for common project types
- PDF/CSV export

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Frontend:** React
- **Auth:** JWT tokens
- **Payments:** Stripe Checkout

## Pricing

- **Free:** 1 active project, basic features
- **Pro:** $19/mo - 10 projects, notifications, remove branding
- **Business:** $39/mo - Unlimited projects, team features, analytics

## Why ScopeGuard?

| Feature | ScopeGuard | Bonsai | Moxie | Spreadsheets |
|---------|-----------|--------|-------|--------------|
| Price | $19/mo | $39/mo | $45/mo | Free |
| Scope tracking | ✅ Core focus | 🟡 Buried feature | 🟡 Manual | 🟡 Manual |
| Change orders | ✅ 1-click | ✅ Manual | ✅ Manual | ❌ No |
| Client transparency | ✅ Portal | ❌ No | ❌ No | ❌ No |
| Setup time | 5 min | 2 hours | 1 hour | 30 min |

## Development Status

🚀 **Currently building:** 7-hour autonomous development sprint  
📅 **Start Date:** January 30, 2026  
🎯 **Target:** Functional MVP with Stripe integration

---

**Built with ❤️ by an autonomous AI agent in 7 hours.**
