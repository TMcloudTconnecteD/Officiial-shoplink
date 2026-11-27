import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useGetMallsQuery } from "../../redux/Api/shopApiSlice.js";
import { getOptimizedHeroImage } from "../../utils/imageOptimization.js";
import "../../pages/shops/MallExperience.css";

const FeaturedMallTakeover = () => {
  const { data } = useGetMallsQuery(undefined, { pollingInterval: 300000 });
  const mall = data?.malls?.find((item) => item.isFeaturedMall);
  if (!mall) return null;

  return (
    <section className="mx-auto my-8 max-w-7xl px-4" aria-label="Featured ShopLink mall">
      <Motion.div
        className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl md:min-h-[390px]"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <img src={getOptimizedHeroImage(mall.coverImage || mall.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/10" />
        <span className="mall-feature-ribbon">⚡ FEATURED</span>
        <div className="relative z-10 flex min-h-[300px] max-w-3xl flex-col justify-end p-7 md:min-h-[390px] md:p-12">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] backdrop-blur"><FaStar /> Official Mall</span>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-200">A ShopLink flagship destination</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">{mall.name}</h2>
          <p className="mt-3 max-w-xl text-white/85">{mall.shopCount} shops · {mall.productCount} products · {mall.orderCountThisWeek} orders this week</p>
          <Link to={`/malls/${mall._id}`} className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 font-black text-slate-900 transition hover:scale-[1.02]">
            Enter the mall <FaArrowRight />
          </Link>
        </div>
      </Motion.div>
    </section>
  );
};

export default FeaturedMallTakeover;