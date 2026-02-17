#!/usr/bin/env md
# ShopLink Backend Integration Guide

## New Files Created

### Models (in `/backend/models/`)
1. **analyticsModel.js** - Platform-wide analytics and metrics
2. **shopStatsModel.js** - Per-shop performance tracking
3. **userActivityModel.js** - User behavior and activity tracking
4. **featuredProductModel.js** - Featured products management

### Controllers (in `/backend/controllers/`)
1. **analyticsController.js** - Analytics endpoints and logic
2. **shopStatsController.js** - Shop statistics endpoints
3. **featuredProductController.js** - Featured products management

### Routes (in `/backend/routes/`)
1. **analyticsRoutes.js** - Analytics API endpoints
2. **shopStatsRoutes.js** - Shop stats API endpoints
3. **featuredProductRoutes.js** - Featured products API endpoints

### Services (in `/backend/services/`)
1. **metricsService.js** - Auto-update logic for orders and user activities

---

## Integration Steps

### 1. Update Server/Index File

In your `backend/index.js` (or main server file),add these imports at the top:

```javascript
import analyticsRoutes from "./routes/analyticsRoutes.js";
import shopStatsRoutes from "./routes/shopStatsRoutes.js";
import featuredProductRoutes from "./routes/featuredProductRoutes.js";
```

Then add these route handlers before error handling middleware:

```javascript
// Analytics Routes
app.use("/api/analytics", analyticsRoutes);

// Shop Stats Routes
app.use("/api/shop-stats", shopStatsRoutes);

// Featured Products Routes
app.use("/api/featured-products", featuredProductRoutes);
```

### 2. Update Order Controller

In your `backend/controllers/orderController.js`, add this import at the top:

```javascript
import { updatePlatformMetricsAfterOrder } from "../services/metricsService.js";
```

Then, after successfully creating an order in the `createOrder` function, add:

```javascript
// Update platform metrics
if (order && createdOrder.shop) {
  await updatePlatformMetricsAfterOrder(createdOrder, createdOrder.shop);
}
```

Example location (find the section where order is created and saved):

```javascript
// Create Order
const order = new Order({
  orderItems: orderItems,
  shippingAddress: {},
  // ... other fields
});

const createdOrder = await order.save();

// ✅ ADD THIS LINE:
await updatePlatformMetricsAfterOrder(createdOrder, createdOrder.shop);

res.status(201).json(createdOrder);
```

### 3. Update User Login Tracking (Optional)

In your user authentication controller, add login tracking:

```javascript
import { trackUserLogin } from "../services/metricsService.js";

// In your login endpoint, after successful authentication:
await trackUserLogin(user._id);
```

---

## API Endpoints

### Analytics Endpoints

```bash
# Get platform summary statistics (ADMIN ONLY)
GET /api/analytics/summary

# Get revenue trend over time (ADMIN ONLY)
GET /api/analytics/revenue-trend?days=30

# Get order statistics (ADMIN ONLY)
GET /api/analytics/orders-by-category
```

**Response Example (Summary):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 2450000,
    "totalOrders": 1247,
    "totalUsers": 3842,
    "totalShops": 156,
    "totalProducts": 2341,
    "averageOrderValue": 1965
  }
}
```

### Shop Stats Endpoints

```bash
# Get specific shop statistics (ADMIN ONLY)
GET /api/shop-stats/:shopId

# Get top shops by revenue (ADMIN ONLY)
GET /api/shop-stats?limit=10

# Get shop performance metrics (ADMIN ONLY)
GET /api/shop-stats/performance/:shopId
```

### Featured Products Endpoints

```bash
# Get featured products (PUBLIC)
GET /api/featured-products?section=homepage&limit=10

# Get featured products by category (PUBLIC)
GET /api/featured-products/category/:category?limit=10

# Set product as featured (ADMIN ONLY)
POST /api/featured-products
{
  "productId": "product_id_here",
  "priority": 1,
  "section": "homepage",
  "endDate": "2026-03-01"
}

# Remove product from featured (ADMIN ONLY)
DELETE /api/featured-products/:productId

# Track product click (INTERNAL)
PUT /api/featured-products/track-click/:productId

# Track product impression (INTERNAL)
PUT /api/featured-products/track-impression/:productId
```

---

## Data Flow

### When an Order is Placed

```
1. Order Created in orderController
   ↓
2. metricsService.updatePlatformMetricsAfterOrder called
   ├─ Updates Analytics collection (global metrics)
   ├─ Updates ShopStats for the shop
   └─ Updates UserActivity for the customer
   ↓
3. Dashboard shows real-time metrics
```

### Data Updated After Each Order

- **Analytics**:
  - `totalRevenue` +=order amount
  - `totalOrders` += 1
  - `newOrders` += 1
  - `averageOrderValue` = totalRevenue / totalOrders

- **ShopStats** (per shop):
  - `totalOrders` += 1
  - `totalRevenue` += order amount
  - `totalProductsSold` += product count
  - `lastUpdated` = now

- **UserActivity** (per user):
  - `ordersPlaced` += 1
  - `totalSpent` += order amount
  - `lastActivityDate` = now

---

## Query Optimization

All new models include proper indexing for performance:

- Analytics: Indexed on `date` (TTL index for auto-deletion)
- ShopStats: Indexed on `totalRevenue`, `totalOrders`, `averageRating`
- UserActivity: Indexed on `lastLogin`, `lastActivityDate`, `isActive`
- FeaturedProduct: Indexed on `isFeatured`, `priority`, `section`

---

## Important Notes

1. **No Existing Code Modified**: These new features don't modify any existing routes, models, or controllers
2. **Backward Compatible**: All new features are optional and don't affect current functionality
3. **Auto-Update Service**: The `metricsService` handles automatic updates - no manual intervention needed
4. **Admin Protection**: Most endpoints require admin access for data security
5. **Public Featured Products**: Featured products can be viewed publicly, but managed by admins only

---

## Testing Integration

After integration, test with:

```bash
# 1. Create an order through existing endpoint
# 2. Check analytics endpoint
curl -H "Authorization: Bearer your_admin_token" \
  http://localhost:8000/api/analytics/summary

# 3. Check shop stats
curl -H "Authorization: Bearer your_admin_token" \
  http://localhost:8000/api/shop-stats/:shopId

# 4. Get featured products
curl http://localhost:8000/api/featured-products
```

---

## Frontend Integration

The frontend can now display:
- Real-time analytics dashboard
- Shop performance metrics
- Featured products on homepage
- User activity tracking

See `/frontend/src/components/AdminMetrics.jsx` for dashboard UI.

---

## Troubleshooting

**Issue**: Analytics not updating
- Check if `metricsService` is imported in orderController
- Verify `updatePlatformMetricsAfterOrder` is called after order save
- Check MongoDB connection for metrics collections

**Issue**: Shop stats returning empty
- Ensure shopId references are correct
- Check that orders have valid shop references
- Run MongoDB aggregation to verify data

**Issue**: API endpoints returning 401
- Verify admin authentication middleware is enabled
- Check JWT token validity
- Ensure user has `isAdmin` flag set

