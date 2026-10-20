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
- Rider application and assignment workflow
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
```

### Daraja sandbox setup guide

1. Create a Safaricom developer account and register an app.
2. Request Daraja sandbox credentials for the app.
3. Use the test credentials from the sandbox portal.
4. Put the consumer key, consumer secret, and passkey in the `.env` file.
5. Make sure the callback URL is publicly reachable for production testing.
6. Use sandbox test phone numbers approved by Safaricom for M-Pesa STK testing.

### M-Pesa sandbox test numbers guide

Safaricom sandbox numbers are usually phone numbers assigned for testing. Use the numbers provided in the Daraja portal for STK simulation and confirm the flow in sandbox mode.

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
| M-Pesa | `/api/mpesa/stk-push` | Initiate STK push |
| M-Pesa | `/api/mpesa/status/:checkoutRequestId` | Poll payment status |
| Community | `/api/community` | Community posts |
| Riders | `/api/riders/apply` | Rider application |
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
