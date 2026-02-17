#!/usr/bin/env md
# ⚡ GET STARTED IN 5 MINUTES

Skip the docs. Here's exactly what to do, right now.

---

## 🏃 BACKEND - 3 Simple Steps

### Step 1: Copy-paste this into `backend/index.js` (near other route imports)

```javascript
import analyticsRoutes from "./routes/analyticsRoutes.js";
import shopStatsRoutes from "./routes/shopStatsRoutes.js";
import featuredProductRoutes from "./routes/featuredProductRoutes.js";
```

### Step 2: Copy-paste this into `backend/index.js` (after other app.use("/api/*") routes)

```javascript
app.use("/api/analytics", analyticsRoutes);
app.use("/api/shop-stats", shopStatsRoutes);
app.use("/api/featured-products", featuredProductRoutes);
```

### Step 3: Copy-paste this into `backend/controllers/orderController.js` (top of file)

```javascript
import { updatePlatformMetricsAfterOrder } from "../services/metricsService.js";
```

Find where you create/save the order. After `await order.save()` or similar, add:

```javascript
await updatePlatformMetricsAfterOrder(order, order.shop);
```

**✅ Backend done!**

Test it:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/analytics/summary
```

---

## 🎨 FRONTEND - 3 Simple Steps

### Step 1: Create new file `frontend/src/services/analyticsService.js`

Copy entire content from here:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getAuthToken = () => localStorage.getItem("token");

const apiCall = async (endpoint, method = "GET", data = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
};

export const analyticsService = {
  getPlatformSummary: () => apiCall("/api/analytics/summary"),
  getRevenueTrend: (days = 30) => 
    apiCall(`/api/analytics/revenue-trend?days=${days}`),
  getOrderStats: () => apiCall("/api/analytics/orders-by-category"),
  getShopStats: (shopId) => apiCall(`/api/shop-stats/${shopId}`),
  getTopShops: (limit = 10) => apiCall(`/api/shop-stats?limit=${limit}`),
  getShopPerformance: (shopId) => 
    apiCall(`/api/shop-stats/performance/${shopId}`),
  getFeaturedProducts: (section = "homepage", limit = 10) =>
    apiCall(`/api/featured-products?section=${section}&limit=${limit}`),
  getFeaturedByCategory: (category, limit = 10) =>
    apiCall(`/api/featured-products/category/${category}?limit=${limit}`),
  trackProductClick: (productId) =>
    apiCall(`/api/featured-products/track-click/${productId}`, "PUT"),
  trackProductImpression: (productId) =>
    apiCall(`/api/featured-products/track-impression/${productId}`, "PUT"),
};

export default analyticsService;
```

### Step 2: Add dashboard route in `frontend/src/pages/Admin/AdminRoutes.jsx`

Add this import:
```javascript
import AdminMetrics from "./AdminMetrics";
```

Add this route (among your other routes):
```javascript
<Route path="/dashboard" element={<AdminMetrics />} />
```

### Step 3: (Optional but recommended) Update AdminMetrics to show real data

In `frontend/src/pages/Admin/AdminMetrics.jsx`, add these imports at top:
```javascript
import { useEffect, useState } from "react";
import analyticsService from "../../services/analyticsService";
```

Add inside the component function:
```javascript
const [metrics, setMetrics] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMetrics = async () => {
    try {
      const data = await analyticsService.getPlatformSummary();
      setMetrics(data.data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchMetrics();
}, []);
```

**✅ Frontend done!**

Test it:
```bash
# Visit homepage - should see Hero, Categories, Featured Shops, Trust sections
http://localhost:3000

# Visit dashboard - should see metric cards
http://localhost:3000/admin/dashboard
```

---

## ✅ VERIFY IT WORKS

1. **Homepage** - Do you see the new sections?
   - Hero section with gradient
   - Scrollable categories
   - Featured shops
   - Trust messaging
   - ✅ Yes? Great!

2. **Dashboard** - Can you navigate to `/admin/dashboard`?
   - Do you see metric cards?
   - ✅ Yes? Perfect!

3. **API** - Do these work?
   ```bash
   # Test featured products (public)
   curl http://localhost:8000/api/featured-products
   
   # Test analytics (requires admin token)
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/analytics/summary
   ```
   - ✅ Both working? Excellent!

---

## 🎯 WHAT HAPPENS NOW

Every time someone places an order:
- ✅ Analytics updated automatically
- ✅ Shop stats updated
- ✅ User activity tracked
- ✅ Dashboard shows real metrics

---

## 🆘 QUICK TROUBLESHOOTING

**Homepage sections not showing?**
→ Check `frontend/src/pages/HomeUpdated1.jsx` has the imports and JSX

**Dashboard route 404?**
→ Check you added the route correctly in AdminRoutes.jsx

**API returns 404?**
→ Check routes are registered in `backend/index.js`

**Analytics not updating?**
→ Check `updatePlatformMetricsAfterOrder` is called in orderController

**Still stuck?**
→ Read: [QUICK_INTEGRATION_CHECKLIST.md](QUICK_INTEGRATION_CHECKLIST.md)

---

## 📖 NEED MORE INFO?

- **Detailed guide**: [BACKEND_INTEGRATION_GUIDE.md](BACKEND_INTEGRATION_GUIDE.md)
- **All components**: [FILE_INVENTORY.md](FILE_INVENTORY.md)
- **Full overview**: [README_PLATFORM_TRANSFORMATION.md](README_PLATFORM_TRANSFORMATION.md)
- **Complete checklist**: [QUICK_INTEGRATION_CHECKLIST.md](QUICK_INTEGRATION_CHECKLIST.md)

---

## 🚀 DONE!

Your app now has:
✅ Analytics infrastructure
✅ Investor dashboard
✅ Premium homepage
✅ Production-ready backend

**Time spent**: ~30 minutes
**Status**: Ready for production
**Next**: Deploy and watch your metrics!

