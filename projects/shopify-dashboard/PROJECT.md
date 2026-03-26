# Criativalia Metrics Dashboard — Project Definition
## Version: 1.0
## Created: 2026-03-26
## Status: ACTIVE
## Owner: DATA_ANALYST + DEV_AUTOMATION_AI

---

## Mission
Create a real-time dashboard showing Criativalia's key business metrics from Shopify.

**Purpose:** Replace manual spreadsheet checking with live data visualization.

---

## Success Criteria

- [ ] Connect to Shopify API
- [ ] Display revenue (today, 7d, 30d)
- [ ] Display order count (today, 7d, 30d)
- [ ] Display average order value
- [ ] Display top products
- [ ] Display customer metrics (new vs returning)
- [ ] Auto-refresh every 5 minutes
- [ ] Mobile-friendly view
- [ ] Deploy to GitHub Pages

---

## Data Sources

### Shopify Admin API
- Orders
- Products
- Customers
- Analytics

### Required Scopes:
- read_orders
- read_products
- read_customers
- read_analytics

---

## Metrics to Display

### Header KPIs
| Metric | Formula | Target |
|--------|---------|--------|
| Revenue (30d) | Sum(order.total_price) | R$ 30.000 |
| Orders (30d) | Count(orders) | 100 |
| AOV | Revenue / Orders | R$ 300 |
| Conversion Rate | Orders / Sessions | 2% |

### Charts
1. Revenue over time (line chart)
2. Orders by day (bar chart)
3. Top 10 products (table)
4. Customer breakdown (pie chart)

### Insights Section
- Trend vs last period
- Projections
- Alerts (low inventory, high cart abandonment)

---

## Tech Stack

- **Frontend:** HTML + Tailwind + Chart.js
- **Backend:** None (static site)
- **Data:** Shopify API via client-side (with proxy if needed)
- **Auth:** Shopify access token
- **Deploy:** GitHub Pages

---

## Design

**Style:** Japandi Dark (same as Control Plane)
- Background: #0A0A0B
- Surface: #141414
- Accent: #C17767 (terracotta)
- Text: #FAFAFA

---

## Files to Create

1. `shopify-dashboard/index.html` — Main dashboard
2. `shopify-dashboard/shopify-api.js` — API integration
3. `shopify-dashboard/charts.js` — Chart rendering
4. `shopify-dashboard/config.js` — Settings

---

## Security Notes

- Access token stored in localStorage (user's browser only)
- No server = no token exposure
- CORS may require proxy (use Cloudflare Worker if needed)

---

## Status: IN PROGRESS
