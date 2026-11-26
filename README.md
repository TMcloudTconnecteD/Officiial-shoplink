# ShopLink

ShopLink is a premium campus marketplace for university students in Kenya. Built to deliver a faster, more trustworthy, and more social product-shopping experience than food-only competitors.

## Product summary

ShopLink brings together categories such as electronics, fashion, beauty, stationery, room essentials, and snacks across real campus-adjacent shops and malls. Students can browse products, compare deals, pay with M-Pesa STK push, track orders, and participate in a campus community feed.

## Screenshots

Add screenshots here after product capture and design sign-off.

## Feature list

- Premium campus-first storefront
- Product browsing by categories, malls, and shops
- Real-time deal discovery and discount cards
- M-Pesa STK push checkout flow
- Order timeline and status tracking
- Approved rider directory, rider applications, and admin review notifications
- In-app notifications for rider decisions, orders, and payment confirmations
- Community feed with posts, likes, and comments
- AI budget planner for product planning
- Responsive mobile-first shopping experience

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: Clerk + JWT patterns already in project
- Payments: M-Pesa Daraja STK push integration
- Media: Cloudinary
- Styling: CSS custom properties and utility classes

## Monorepo structure

```text
shoplink/
  client/
  api/
  components/
  ui/
  layout/
  product/
  order/
  pages/
    home/
    categories/
    malls/
    product/
    cart/
    checkout/
    orders/
    tracking/
    rider/
    community/
    profile/
    budget/
    auth/
    not-found/
  hooks/
  context/
  store/
  styles/
    tokens.css
    base.css
    utilities.css
  routes/
  server/
    src/
      config/
      models/
      routes/
      controllers/
      middleware/
      services/
      utils/
      jobs/
    .env.example
  shared/
    constants/
  README.md
```

This workspace currently contains a Vite frontend and Express backend under the root project structure while the production target monorepo is being hardened in phases.

## Setup

1. Clone the repository.
2. Copy environment files and fill in real values.
3. Install dependencies:

```bash
npm install
cd frontend && npm install
```

4. Start the app:

```bash
npm run dev
```

### Required environment keys

Create a `.env` file at the project root with variables such as:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shoplink
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_daraja_passkey
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PAYPAL_KES_TO_USD_RATE=0.0077
```

PayPal payments are verified by the backend against the PayPal Orders API before an order is marked paid. Set `PAYPAL_MODE=production` for live payments and configure the matching client ID and secret. `PAYPAL_KES_TO_USD_RATE` is the KES-to-USD rate used both to create and verify PayPal orders. `PAYPAL_MERCHANT_ID` is optional and can be set to enforce an additional merchant-account match.

For frontend development, set `VITE_API_URL=http://localhost:8000` in `frontend/.env`; Vite proxies `/api` requests through that backend. For production, set `VITE_BASE_URL` to the deployed Express API origin. A local `VITE_API_URL` is intentionally ignored by production builds.

### Daraja sandbox setup guide

1. Create a Safaricom developer account and register an app.
2. Request Daraja sandbox credentials for the app.
3. Use the test credentials from the sandbox portal.
4. Put the consumer key, consumer secret, and passkey in the `.env` file.
5. Make sure the callback URL is publicly reachable for production testing.
6. Use sandbox test phone numbers approved by Safaricom for M-Pesa STK testing.

### M-Pesa sandbox test numbers guide

Safaricom sandbox numbers are usually phone numbers assigned for testing. Use the numbers provided in the Daraja portal for STK simulation and confirm the flow in sandbox mode.

### Payment reconciliation and admin accounting

- PayPal and M-Pesa are recorded against their verified gateway transaction references and receive a ShopLink receipt number.
- Cash is marked paid only after both the order's customer and that shop's administrator confirm the handover. A pending M-Pesa request must first resolve as failed or cancelled before cash can be confirmed.
- Admin order pages are scoped to the signed-in shop administrator's shops; super admins can see all shops. Payment summaries include confirmed receipts only and split product sales, tax collected, delivery fees, total receipts, and totals by final payment method.
- Platform tax and delivery totals are reduced proportionally for checkout discounts. They are not net profit and do not subtract operating costs or tax remittances.

### ShopLink marketing, referrals, and rewards

- The homepage mounts `SellerSpotlightCard`, `FeaturedProductsStrip`, `FreshDropsCarousel`, and `TrendingNowStrip` from `frontend/src/pages/HomeUpdated1.jsx`. Global welcome and cart activity helpers mount in `frontend/src/App.jsx`; the referral ribbon sits above the footer. The paid-customer order celebration mounts in `frontend/src/pages/Orders/Order.jsx`.
- Fresh Drops uses products created in the previous seven days, newest first. Trending Now aggregates paid order items from the previous seven days and ranks up to eight products by order count. Shop of the Day rotates deterministically by UTC day unless the super admin selects a featured shop.
- Customer notifications run from the 5-minute cart-nudge worker started after the backend connects to MongoDB. A reminder is sent after 30 minutes without a cart update and is limited to one successful reminder per account/cart per day.
- Customers earn 10 points after each paid order. A referrer earns 100 points after the referred customer's first paid order. Every 1,000 points automatically convert into a KES 100 reward credit for an in-app purchase; it is not cash and requires no manual points redemption.
- At checkout, one available KES 100 reward credit is automatically applied to the signed-in customer's account; customers do not enter a code. The discount is capped at the order amount. If it covers the full amount, the order is settled as paid by ShopLink voucher with a zero balance due, not as a PayPal, M-Pesa, or cash gateway payment.
- Customers can track points and all reward-credit states on `/student-friendly`. Credits are tied to the customer's user account (and displayed with that account's email). Super admins can search the full voucher ledger and reversibly disable or re-enable unused credits, or pause the program globally. Pausing preserves points and vouchers but prevents new issuance and checkout use.
- The Student Friendly rewards page is at `/student-friendly`. Referral links point to `/register?ref=CODE`; registration stores attribution for both standard and Clerk signup flows.
- Super admins manage module switches, global featured slots, referral totals, and 30-day promotion analytics from the admin dashboard. Shop admins can feature only products belonging to their own shops; all ownership checks are enforced by the API.

Marketing API routes are mounted under `/api/marketing`:

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /public/settings`, `/public/fresh-drops`, `/public/featured-products`, `/public/trending`, `/public/seller-spotlight` | Public | Customer-facing promotional data |
| `GET /public/welcome` | Signed-in customer | Once-daily welcome toast data |
| `POST /impressions` | Public/optional auth | Promotion impression and click events |
| `POST /cart/activity`, `GET /cart/status` | Signed-in customer | Cart inactivity tracking and reminder badge |
| `GET /rewards/me` | Signed-in customer | Points, referrals, and automatically issued reward credits |
| `GET /admin/reward-credits`, `PATCH /admin/reward-credits/:creditId`, `PATCH /admin/rewards` | Super admin | Search voucher ledger, toggle unused credits, or pause/resume rewards |
| `GET /admin/catalog`, `PATCH /admin/products/:productId/feature` | Admin | Own-shop promotional product controls |
| `PATCH /admin/modules`, `PATCH /admin/featured`, `GET /admin/analytics`, `GET /admin/referrals` | Super admin | Global controls and reporting |

### BSNO marker note

This project uses the campus-marketplace BSNO workflow and should preserve the buyer-seller-order state progression despite backend or UI refactoring.

## API endpoint table

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Auth | `/api/users/login` | User sign-in |
| Auth | `/api/users/register` | User registration |
| Products | `/api/products` | Fetch products |
| Categories | `/api/categories` | List categories |
| Malls | `/api/malls` | List malls |
| Deals | `/api/deals` | Active discounted products |
| Orders | `/api/orders` | Order management |
| Orders | `/api/orders/financial-summary` | Admin: confirmed payment totals and method breakdown |
| Orders | `/api/orders/:id/confirm-cash` | Customer/shop admin: confirm cash handover |
| M-Pesa | `/api/mpesa/stk-push` | Initiate STK push |
| M-Pesa | `/api/mpesa/status/:checkoutRequestId` | Poll payment status |
| Community | `/api/community` | Community posts |
| Riders | `GET /api/riders/approved` | List riders approved by an admin |
| Riders | `POST /api/riders/apply` | Submit a rider application |
| Riders | `GET /api/riders/applications` | Admin: review rider applications |
| Riders | `PATCH /api/riders/applications/:id` | Admin: approve or reject an application |
| Notifications | `GET /api/notifications/notifications` | List unread notifications for the signed-in user |
| Notifications | `PUT /api/notifications/badge/reset` | Mark all notifications as read |
| Budget | `/api/budget/plan` | AI budget planner |

## Run commands

```bash
npm run backend
npm run frontend
npm run dev
```

## Roadmap

- Phase 1: foundation hardening, header/footer polish, README and QA gates
- Phase 2: real data from categories, malls, deals, and product-detail rebuild
- Phase 3: M-Pesa STK pay flow and reconciliation
- Phase 4: community and rider hub
- Phase 5: budget planner
- Phase 6: live tracking, AI chat, and advanced recommendation features

## Changelog

### Phase 1

- Hardened the frontend foundation with consistent design tokens.
- Added a production-ready README scaffold.
- Stabilized the app shell around a premium dark-teal aesthetic.
