#!/usr/bin/env md
# ShopLink Frontend Integration Guide

## New Components Created

### Premium Homepage Sections
1. **HeroSection.jsx** - Brand hero with CTAs
2. **CategoryStrip.jsx** - Horizontal scrollable categories
3. **FeaturedShops.jsx** - Curated shop recommendations
4. **TrustSection.jsx** - Trust/credibility messaging

### Admin Dashboard
1. **AdminMetrics.jsx** - Investor dashboard component

---

## Frontend File Locations

All new frontend components are in:
- Components: `/frontend/src/components/sections/`
- Styles: Each component has corresponding `.css` file
- Admin: `/frontend/src/pages/Admin/AdminMetrics.jsx`

---

## Integration Steps

### 1. Homepage Integration (Already Done ✓)

The new sections are already integrated into `HomeUpdated1.jsx`:

```javascript
import HeroSection from "../components/sections/HeroSection";
import CategoryStrip from "../components/sections/CategoryStrip";
import FeaturedShops from "../components/sections/FeaturedShops";
import TrustSection from "../components/sections/TrustSection";

// In JSX render:
{!keyword && <HeroSection />}
{!keyword && <CategoryStrip />}
{!keyword && <FeaturedShops />}
{!keyword && <TrustSection />}
```

**Status**: ✓ Ready to display

### 2. Admin Dashboard Integration

In your `AdminRoutes.jsx` or admin routing file, add:

```javascript
import AdminMetrics from "./AdminMetrics";

// Add this route:
<Route path="/dashboard" element={<AdminMetrics />} />
```

Or update your admin menu to include a link:

```javascript
// In AdminMenu.jsx or similar
<Link to="/admin/dashboard" className="admin-menu-item">
  📊 Dashboard
</Link>
```

**Status**: ✓ Component ready, needs route registration

### 3. Create Analytics Service (New File)

Create a new file: `/frontend/src/services/analyticsService.js`

```javascript
// frontend/src/services/analyticsService.js

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Auth token from localStorage (update based on your auth setup)
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

// Analytics endpoints
export const analyticsService = {
  // Get platform summary statistics
  getPlatformSummary: () => apiCall("/api/analytics/summary"),

  // Get revenue trend over specified days
  getRevenueTrend: (days = 30) => 
    apiCall(`/api/analytics/revenue-trend?days=${days}`),

  // Get order statistics by category
  getOrderStats: () => apiCall("/api/analytics/orders-by-category"),

  // Shop statistics
  getShopStats: (shopId) => apiCall(`/api/shop-stats/${shopId}`),
  getTopShops: (limit = 10) => apiCall(`/api/shop-stats?limit=${limit}`),
  getShopPerformance: (shopId) => 
    apiCall(`/api/shop-stats/performance/${shopId}`),

  // Featured products
  getFeaturedProducts: (section = "homepage", limit = 10) =>
    apiCall(`/api/featured-products?section=${section}&limit=${limit}`),

  getFeaturedByCategory: (category, limit = 10) =>
    apiCall(`/api/featured-products/category/${category}?limit=${limit}`),

  // Track product engagement
  trackProductClick: (productId) =>
    apiCall(`/api/featured-products/track-click/${productId}`, "PUT"),

  trackProductImpression: (productId) =>
    apiCall(`/api/featured-products/track-impression/${productId}`, "PUT"),
};

export default analyticsService;
```

**Status**: Create this file now

### 4. Update AdminMetrics Component

To display real data instead of mock data, update `AdminMetrics.jsx`:

```javascript
// At the top, add:
import { useEffect, useState } from "react";
import analyticsService from "../../services/analyticsService";

// Inside component:
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

// Use metrics state instead of hardcoded mockMetrics
```

**Status**: Optional enhancement (mock data works for testing)

### 5. Featured Products on Homepage (Optional)

Add a featured products carousel to showcase admin-featured items.

Create: `/frontend/src/components/sections/FeaturedProductsCarousel.jsx`

```javascript
// frontend/src/components/sections/FeaturedProductsCarousel.jsx

import { useEffect, useState } from "react";
import analyticsService from "../../services/analyticsService";
import ProductCard from "../ProductCard";
import "./FeaturedProductsCarousel.css";

export default function FeaturedProductsCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await analyticsService.getFeaturedProducts("homepage", 8);
        setProducts(data.data || []);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) return <div className="featured-loading">Loading featured...</div>;

  return (
    <section className="featured-carousel-section">
      <h2>⭐ Handpicked For You</h2>
      <div className="featured-carousel">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

Create: `/frontend/src/components/sections/FeaturedProductsCarousel.css`

```css
.featured-carousel-section {
  padding: var(--spacing-lg, 32px) var(--spacing-md, 16px);
  background: linear-gradient(135deg, var(--color-primary, #0F766E) 0%, var(--color-primary-light, #14b8a6) 100%);
  border-radius: var(--border-radius-lg, 12px);
  margin: var(--spacing-lg, 32px) 0;
}

.featured-carousel-section h2 {
  color: white;
  font-size: var(--font-size-2xl, 24px);
  margin-bottom: var(--spacing-md, 16px);
  text-align: center;
}

.featured-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md, 16px);
}

@media (max-width: 640px) {
  .featured-carousel {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
```

Then add to `HomeUpdated1.jsx`:

```javascript
import FeaturedProductsCarousel from "../components/sections/FeaturedProductsCarousel";

// In render, add:
{!keyword && <FeaturedProductsCarousel />}
```

**Status**: Optional enhancement

---

## Design System Utilities Now Available

Your `theme.css` now includes comprehensive utilities:

### Button Classes
```html
<!-- Primary button -->
<button className="btn btn-primary">Action</button>

<!-- Large secondary button -->
<button className="btn btn-lg btn-secondary">Action</button>

<!-- Accent button block (full width) -->
<button className="btn btn-accent btn-block">Action</button>

<!-- Ghost button (outline style) -->
<button className="btn btn-ghost">Action</button>
```

### Color Classes
```html
<!-- Use semantic colors -->
<div className="text-primary">Primary text</div>
<div className="bg-accent">Accent background</div>
<span className="text-success">Success message</span>
<span className="text-danger">Danger alert</span>
```

### Spacing Classes
```html
<!-- Use spacing scale -->
<div className="p-md">16px padding</div>
<div className="m-lg">32px margin</div>
<div className="gap-sm">8px gap in flex/grid</div>
```

---

## Component Architecture

### Directory Structure

```
frontend/src/
├── components/
│   ├── sections/
│   │   ├── HeroSection.jsx
│   │   ├── HeroSection.css
│   │   ├── CategoryStrip.jsx
│   │   ├── CategoryStrip.css
│   │   ├── FeaturedShops.jsx
│   │   ├── FeaturedShops.css
│   │   ├── TrustSection.jsx
│   │   ├── TrustSection.css
│   │   └── FeaturedProductsCarousel.jsx (optional)
│   └── ...
├── pages/
│   ├── Admin/
│   │   ├── AdminMetrics.jsx
│   │   ├── AdminMetrics.css
│   │   └── AdminRoutes.jsx
│   └── ...
├── services/
│   └── analyticsService.js (NEW - create this)
└── styles/
    └── theme.css (enhanced)
```

---

## Testing Frontend Integration

1. **Homepage**
   ```bash
   # Should display:
   # - Hero section with gradient
   # - Scrollable categories
   # - Featured shops grid
   # - Trust messaging
   ```

2. **Admin Dashboard**
   ```javascript
   // Navigate to /admin/dashboard
   // Should display:
   // - 4 metric cards (Revenue, Orders, Users, Shops)
   // - 2 chart placeholders
   // - Recent orders table
   ```

3. **Featured Products API**
   ```bash
   curl http://localhost:3000/api/featured-products
   # Should return featured products if any exist
   ```

---

## Mobile Responsiveness

All new components are fully responsive:

- **Mobile First**: Components start at mobile size and scale up
- **Breakpoints**: 640px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Friendly**: Large tap targets, proper spacing
- **Performance**: Lazy loading images, optimized renders

### Responsive Behavior

- **HeroSection**: Single column on mobile, two columns on desktop
- **CategoryStrip**: Horizontal scroll on mobile, grid on desktop
- **FeaturedShops**: 1 column on mobile, 2-3 on tablet, 4+ on desktop
- **AdminMetrics**: Stacked on mobile, 2x2 grid on desktop

---

## Performance Optimization

### Image Optimization Utility

Already integrated in components via `imageOptimization.js`:

```javascript
import { getOptimizedProductImage } from "../../utils/imageOptimization";

// Usage:
<img src={getOptimizedProductImage(productUrl, "product")} alt="Product" />
```

### Lazy Loading

All images use lazy loading:
```html
<img loading="lazy" decoding="async" src={url} alt="Description" />
```

### CSS Optimization

- CSS variables reduce bundle size
- Utility classes prevent code duplication
- Minimal JavaScript in components
- No unnecessary re-renders

---

## Redux Integration (Optional)

To add analytics to Redux state:

Create: `/frontend/src/redux/features/analyticsSlice.js`

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticsService from "../../services/analyticsService";

export const fetchPlatformMetrics = createAsyncThunk(
  "analytics/fetchPlatformMetrics",
  async () => {
    const response = await analyticsService.getPlatformSummary();
    return response.data;
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: { data: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformMetrics.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default analyticsSlice.reducer;
```

Then use in components:
```javascript
import { useDispatch, useSelector } from "react-redux";
import { fetchPlatformMetrics } from "../../redux/features/analyticsSlice";

const metrics = useSelector((state) => state.analytics.data);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchPlatformMetrics());
}, []);
```

---

## Styling Reference

### Design Tokens Available

```css
/* Colors */
var(--color-primary)        /* #0F766E - Teal */
var(--color-secondary)      /* #1F2937 - Charcoal */
var(--color-accent)         /* #F59E0B - Amber */
var(--color-success)        /* #10B981 - Green */
var(--color-danger)         /* #EF4444 - Red */
var(--color-surface)        /* #F9FAFB - Light */

/* Spacing */
var(--spacing-sm)           /* 8px */
var(--spacing-md)           /* 16px */
var(--spacing-lg)           /* 32px */
var(--spacing-xl)           /* 48px */

/* Typography */
var(--font-size-sm)         /* 14px */
var(--font-size-base)       /* 16px */
var(--font-size-lg)         /* 18px */

/* Shadows */
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
```

---

## Troubleshooting

**Issue**: Sections not showing on homepage
- Check that components are imported in `HomeUpdated1.jsx`
- Verify component files exist in `/components/sections/`
- Check browser console for import errors

**Issue**: Admin dashboard showing mock data
- Create `analyticsService.js` with API calls
- Update `AdminMetrics.jsx` to use `useEffect` to fetch data
- Verify backend routes are registered and working

**Issue**: Styling looks broken
- Check that `theme.css` is imported in main layout
- Verify CSS variables are defined in `theme.css`
- Check for CSS conflicts with Tailwind

**Issue**: Featured products not loading
- Create `FeaturedProductsCarousel.jsx` component
- Verify featured products exist in MongoDB
- Check API endpoint `/api/featured-products` is working

---

## Next Steps

1. ✓ Ensure backend integration is complete (see BACKEND_INTEGRATION_GUIDE.md)
2. ✓ Register all routes in `backend/index.js`
3. ✓ Create `analyticsService.js` on frontend
4. ✓ Register admin dashboard route
5. ✓ Test homepage displays all sections
6. ✓ Test admin dashboard loads metrics
7. Optional: Add featured products carousel
8. Optional: Add chart library (Recharts/Chart.js)

