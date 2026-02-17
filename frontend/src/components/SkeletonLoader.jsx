import './SkeletonLoader.css';

export const ProductCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8 px-4 max-w-6xl mx-auto">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CarouselSkeleton = () => (
  <div className="skeleton-carousel">
    <div className="skeleton-image large"></div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="space-y-6 px-4">
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="skeleton-image large"></div>
      <div className="flex-1 space-y-4">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  </div>
);
