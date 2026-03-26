# Daily Reports Automation — Project Definition
## Version: 1.0
## Created: 2026-03-26
## Status: ACTIVE
## Owner: DATA_ANALYST + RELEASE_MANAGER

---

## Mission
Create automated daily intelligence reports for Criativalia, delivered every morning at 07:00.

**Purpose:** Replace manual data checking with automated insights delivered to Telegram.

---

## Report Schedule

| Report | Time | Channel | Content |
|--------|------|---------|---------|
| Morning Brief | 07:00 | Telegram | Sales, metrics, priorities |
| Weekly Summary | Monday 07:00 | Telegram | Week review, trends |
| Monthly Report | 1st of month | Email + Telegram | Full business review |

---

## Daily Report Content

### Header
- Date
- Weather (Rio de Janeiro) — just for context
- Business day number of month

### Section 1: Yesterday's Performance
- Revenue vs target
- Orders count
- Average order value
- vs same day last week

### Section 2: Week to Date
- Cumulative revenue
- Progress toward weekly goal
- Trend indicator (↑↓→)

### Section 3: Alerts & Anomalies
- Low inventory items
- High cart abandonment
- Payment failures
- Shipping delays

### Section 4: Today's Focus
- Top priority actions
- Follow-ups needed
- Meetings/reminders

### Section 5: Insight of the Day
- One actionable insight
- Based on data patterns

---

## Data Sources

1. **Shopify** — Orders, revenue, products
2. **Control Plane** — Agent activity, tasks completed
3. **Melhor Envio** — Shipping status
4. **Meta Ads** — Campaign performance (if API available)

---

## Tech Stack

- **Runtime:** GitHub Actions (cron)
- **Language:** Node.js
- **APIs:** Shopify Admin, Telegram Bot
- **Storage:** GitHub (for historical data)

---

## Files to Create

1. `.github/workflows/daily-report.yml` — GitHub Action
2. `reports/daily-report.js` — Report generator
3. `reports/templates/daily.js` — Message templates
4. `reports/data/shopify.js` — Shopify data fetcher

---

## Security

- Shopify token: GitHub Secret
- Telegram token: GitHub Secret
- Chat ID: GitHub Secret

---

## Status: IN PROGRESS
