import { Link } from 'react-router-dom';
import { useGetProductsQuery, useGetTopProductsQuery } from '../redux/Api/productApiSlice';
import { getOptimizedProductImage } from '../utils/imageOptimization';

const CommunityPage = () => {
  const { data: productsData } = useGetProductsQuery({ keyword: '' }, { skip: false });
  const { data: topProducts } = useGetTopProductsQuery();

  const products = productsData?.products || topProducts || [];

  const stats = [
    { label: 'Best Rated', value: '4.8/5' },
    { label: 'Most Bought', value: '1.2k+' },
    { label: 'Most Requested', value: '89%' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="rounded-[28px] overflow-hidden border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-xl">
        <div className="p-6 md:p-10">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-700 font-semibold">Community</p>
              <h1 className="mt-2 text-3xl md:text-5xl font-black text-slate-900">Student life, powered by local trust.</h1>
            </div>
            <Link to="/shop" className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              Explore products
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/80 p-5 shadow-sm border border-slate-100">
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Community picks</p>
              <h2 className="mt-3 text-2xl font-bold">Trending near campus</h2>
              <div className="mt-6 space-y-4">
                {products.slice(0, 3).map((product) => (
                  <div key={product._id} className="flex items-center gap-4 rounded-2xl bg-white/5 p-3">
                    <img src={getOptimizedProductImage(product.image, 200)} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{product.name}</div>
                      <div className="text-sm text-slate-300">{product.brand || 'Popular pick'}</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-300">KES {Number(product.price || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-700 font-semibold">Campus buzz</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">What students are asking for</h2>
              <div className="mt-6 space-y-4 text-slate-700">
                <div className="rounded-2xl bg-emerald-50 p-4">“Need affordable study snacks near the hostel.”</div>
                <div className="rounded-2xl bg-amber-50 p-4">“Best quality campus backpacks and chargers.”</div>
                <div className="rounded-2xl bg-sky-50 p-4">“Fast pickup and delivery after class.”</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
