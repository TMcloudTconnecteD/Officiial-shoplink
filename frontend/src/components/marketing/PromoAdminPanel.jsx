import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useGetAllReferralsQuery,
  useGetAdminRewardCreditsQuery,
  useGetPromoAdminCatalogQuery,
  useGetPromoAnalyticsQuery,
  useGetPointsAnalyticsQuery,
  useToggleProductFeatureMutation,
  useUpdateFeaturedSlotMutation,
  useUpdatePromoModulesMutation,
  useUpdateRewardCreditStatusMutation,
  useUpdateRewardProgramMutation,
} from "../../redux/Api/marketingApiSlice";
import { useGetMallsQuery, useUpdateMallFeatureMutation } from "../../redux/Api/shopApiSlice.js";

const moduleLabels = [
  ["freshDrops", "Fresh Drops"],
  ["welcomeToast", "Welcome Toast"],
  ["trendingNow", "Trending Now"],
  ["cartNudge", "Smart Cart Nudge"],
  ["referralRibbon", "Referral Ribbon"],
  ["sellerSpotlight", "Shop of the Day"],
  ["postOrderDelight", "Post-order Delight"],
];

const PromoAdminPanel = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = Boolean(userInfo?.isAdmin || userInfo?.isSuperAdmin);
  const isSuperAdmin = Boolean(userInfo?.isSuperAdmin);
  const { data: catalog, isLoading, error } = useGetPromoAdminCatalogQuery(undefined, { skip: !isAdmin });
  const { data: analytics = [] } = useGetPromoAnalyticsQuery(undefined, { skip: !isSuperAdmin });
  const { data: pointsAnalytics, error: pointsAnalyticsError } = useGetPointsAnalyticsQuery(undefined, { skip: !isSuperAdmin });
  const { data: referralReport } = useGetAllReferralsQuery(undefined, { skip: !isSuperAdmin });
  const { data: mallDirectory } = useGetMallsQuery(undefined, { skip: !isSuperAdmin });
  const [voucherPage, setVoucherPage] = useState(1);
  const [voucherStatus, setVoucherStatus] = useState("");
  const [voucherSearch, setVoucherSearch] = useState("");
  const { data: voucherLedger, isLoading: loadingVouchers, error: voucherError } = useGetAdminRewardCreditsQuery(
    { page: voucherPage, status: voucherStatus, search: voucherSearch },
    { skip: !isSuperAdmin }
  );
  const [toggleProduct] = useToggleProductFeatureMutation();
  const [updateModules, { isLoading: savingModules }] = useUpdatePromoModulesMutation();
  const [updateSlots, { isLoading: savingSlots }] = useUpdateFeaturedSlotMutation();
  const [updateRewardProgram, { isLoading: savingRewardProgram }] = useUpdateRewardProgramMutation();
  const [updateRewardCreditStatus] = useUpdateRewardCreditStatusMutation();
  const [updateMallFeature] = useUpdateMallFeatureMutation();
  const [modules, setModules] = useState({});
  const [featuredShop, setFeaturedShop] = useState("");
  const [featuredProduct, setFeaturedProduct] = useState("");
  const [rewardProgramEnabled, setRewardProgramEnabled] = useState(true);

  useEffect(() => {
    if (!catalog?.settings) return;
    setModules(catalog.settings.modules || {});
    setFeaturedShop(catalog.settings.featuredShop || "");
    setFeaturedProduct(catalog.settings.featuredProduct || "");
    setRewardProgramEnabled(catalog.settings.rewardProgramEnabled !== false);
  }, [catalog]);

  const analyticsByModule = useMemo(() => analytics.reduce((totals, item) => {
    totals[item.module] ||= { impression: 0, click: 0 };
    totals[item.module][item.event] = item.count;
    return totals;
  }, {}), [analytics]);

  if (!isAdmin) return null;
  if (isLoading) return <section className="marketing-admin">Loading promotion controls…</section>;
  if (error) return <section className="marketing-admin" role="alert">Promotion controls could not be loaded.</section>;

  const saveModules = async () => {
    try {
      await updateModules({ modules }).unwrap();
      toast.success("Promotion settings saved");
    } catch (saveError) {
      toast.error(saveError?.data?.message || "Could not save promotion settings");
    }
  };

  const saveSlots = async () => {
    try {
      await updateSlots({ shopId: featuredShop || null, productId: featuredProduct || null }).unwrap();
      toast.success("Featured slots saved");
    } catch (saveError) {
      toast.error(saveError?.data?.message || "Could not save featured slots");
    }
  };

  const saveRewardProgramStatus = async (enabled) => {
    setRewardProgramEnabled(enabled);
    try {
      await updateRewardProgram({ enabled }).unwrap();
      toast.success(enabled ? "Automatic rewards resumed" : "Automatic rewards paused");
    } catch (saveError) {
      setRewardProgramEnabled(!enabled);
      toast.error(saveError?.data?.message || "Could not update the rewards program");
    }
  };

  return (
    <section className="marketing-admin">
      <h2>Marketplace promotions</h2>
      <p>Promotional products are limited to shops this account manages.</p>

      {isSuperAdmin && (
        <>
          <h3>Customer modules</h3>
          <div className="marketing-admin__switches">
            {moduleLabels.map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={modules[key] !== false}
                  onChange={(event) => setModules((current) => ({ ...current, [key]: event.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
          <button type="button" disabled={savingModules} onClick={saveModules}>
            {savingModules ? "Saving…" : "Save module settings"}
          </button>

          <div className="marketing-admin__rewards-control">
            <div>
              <h3>ShopLink Rewards</h3>
                <p>Customers and shop owners can redeem points at checkout at 10 points per KES 1. Pausing prevents point redemption and preserves existing balances and legacy reward credits.</p>
            </div>
            <label>
              <input
                type="checkbox"
                checked={rewardProgramEnabled}
                disabled={savingRewardProgram}
                onChange={(event) => saveRewardProgramStatus(event.target.checked)}
              />
              {rewardProgramEnabled ? "Enabled" : "Paused"}
            </label>
          </div>

          <h3 className="mt-6">Global featured slots</h3>
          <div className="marketing-admin__slots">
            <label className="marketing-admin__field">
              Shop of the day
              <select value={featuredShop} onChange={(event) => setFeaturedShop(event.target.value)}>
                <option value="">Rotate shops automatically</option>
                {(catalog?.shops || []).map((shop) => <option key={shop._id} value={shop._id}>{shop.name}</option>)}
              </select>
            </label>
            <label className="marketing-admin__field">
              Featured product
              <select value={featuredProduct} onChange={(event) => setFeaturedProduct(event.target.value)}>
                <option value="">No manual product</option>
                {(catalog?.products || []).map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
              </select>
            </label>
          </div>
          <button type="button" disabled={savingSlots} onClick={saveSlots}>
            {savingSlots ? "Saving…" : "Save featured slots"}
          </button>

          <h3 className="mt-6">Featured mall takeovers</h3>
          <p>Feature a mall to show its immersive banner on the homepage and add the ⚡ FEATURED ribbon across its mall pages.</p>
          <div className="marketing-admin__product-list">
            {(mallDirectory?.malls || []).map((mall) => (
              <div className="marketing-admin__product" key={mall._id}>
                <span>{mall.name}{mall.location ? ` · ${mall.location}` : ""}</span>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(mall.isFeaturedMall)}
                    onChange={async (event) => {
                      try {
                        await updateMallFeature({ mallId: mall._id, featured: event.target.checked }).unwrap();
                        toast.success(`${mall.name} ${event.target.checked ? "featured" : "unfeatured"}`);
                      } catch (featureError) {
                        toast.error(featureError?.data?.message || "Could not update mall promotion");
                      }
                    }}
                  />
                  Feature mall
                </label>
              </div>
            ))}
            {!mallDirectory?.malls?.length && <p>No malls have been unlocked yet.</p>}
          </div>
        </>
      )}

      <h3 className="mt-6">Eligible product features</h3>
      <div className="marketing-admin__product-list">
        {(catalog?.products || []).map((product) => (
          <div className="marketing-admin__product" key={product._id}>
            <span>{product.name}{product.shop?.name ? ` · ${product.shop.name}` : ""}</span>
            <label>
              <input
                type="checkbox"
                checked={Boolean(product.isPromoFeatured)}
                onChange={async (event) => {
                  try {
                    await toggleProduct({ productId: product._id, featured: event.target.checked }).unwrap();
                  } catch (toggleError) {
                    toast.error(toggleError?.data?.message || "Could not update product feature");
                  }
                }}
              />
              Feature
            </label>
          </div>
        ))}
        {!catalog?.products?.length && <p>No eligible products are available yet.</p>}
      </div>

      {isSuperAdmin && (
        <>
          <h3 className="mt-6">Last 30 days</h3>
          <div className="marketing-admin__stats">
            {moduleLabels.map(([key, label]) => (
              <div className="marketing-admin__stat" key={key}>
                <strong>{label}</strong>
                <span>{analyticsByModule[key]?.impression || 0} views · {analyticsByModule[key]?.click || 0} clicks</span>
              </div>
            ))}
          </div>

          <h3 className="mt-6">Platform points wallet</h3>
          {pointsAnalyticsError ? (
            <p role="alert">Platform points analytics could not be loaded.</p>
          ) : (
            <div className="marketing-admin__stats">
              <div className="marketing-admin__stat"><strong>Points issued</strong><span>{Number(pointsAnalytics?.pointsIssued || 0).toLocaleString()}</span></div>
              <div className="marketing-admin__stat"><strong>Points redeemed</strong><span>{Number(pointsAnalytics?.pointsRedeemed || 0).toLocaleString()}</span></div>
              <div className="marketing-admin__stat"><strong>Points refunded</strong><span>{Number(pointsAnalytics?.pointsRefunded || 0).toLocaleString()}</span></div>
              <div className="marketing-admin__stat"><strong>Current balances</strong><span>{Number(pointsAnalytics?.pointsOutstanding || 0).toLocaleString()} points</span></div>
            </div>
          )}

          <h3 className="mt-6">Referrals</h3>
          <p>
            {referralReport?.referrals?.length || 0} recent referrals
            {referralReport?.totals?.length
              ? ` · ${referralReport.totals.map((entry) => `${entry.count} ${entry._id}`).join(" · ")}`
              : ""}
          </p>

          <div className="marketing-admin__voucher-ledger">
            <div className="marketing-admin__voucher-heading">
              <div>
                <h3>All customer reward vouchers</h3>
                <p>Voucher ownership is tied to the customer's account email. Disable only unused vouchers; reserved and redeemed entries remain in the audit ledger.</p>
              </div>
              <strong>{voucherLedger?.total || 0} issued</strong>
            </div>
            <div className="marketing-admin__voucher-filters">
              <label>
                Search customer
                <input
                  type="search"
                  placeholder="Email or username"
                  value={voucherSearch}
                  onChange={(event) => {
                    setVoucherSearch(event.target.value);
                    setVoucherPage(1);
                  }}
                />
              </label>
              <label>
                Voucher status
                <select
                  value={voucherStatus}
                  onChange={(event) => {
                    setVoucherStatus(event.target.value);
                    setVoucherPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="available">Available</option>
                  <option value="disabled">Disabled</option>
                  <option value="reserved">Reserved</option>
                  <option value="redeemed">Redeemed</option>
                </select>
              </label>
              <div className="marketing-admin__voucher-totals">
                {["available", "disabled", "reserved", "redeemed"].map((status) => (
                  <span key={status}>{status}: {voucherLedger?.statusTotals?.[status] || 0}</span>
                ))}
              </div>
            </div>
            {voucherError ? (
              <p role="alert">Could not load the customer voucher ledger.</p>
            ) : loadingVouchers ? (
              <p>Loading vouchers…</p>
            ) : voucherLedger?.credits?.length ? (
              <div className="marketing-admin__voucher-list">
                {voucherLedger.credits.map((credit) => (
                  <article className="marketing-admin__voucher-row" key={credit._id}>
                    <div className="marketing-admin__voucher-code">
                      <strong>{credit.code}</strong>
                      <span>KES {credit.discountAmount} · {credit.pointsSpent} points</span>
                    </div>
                    <div className="marketing-admin__voucher-owner">
                      <strong>{credit.user?.username || "Deleted account"}</strong>
                      <span>{credit.user?.email || "No account email"}</span>
                    </div>
                    <span className={`marketing-admin__voucher-status is-${credit.status}`}>{credit.status}</span>
                    {(credit.status === "available" || credit.status === "disabled") && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateRewardCreditStatus({ creditId: credit._id, enabled: credit.status === "disabled" }).unwrap();
                            toast.success(credit.status === "disabled" ? "Voucher enabled" : "Voucher disabled");
                          } catch (saveError) {
                            toast.error(saveError?.data?.message || "Could not update the voucher");
                          }
                        }}
                      >
                        {credit.status === "disabled" ? "Enable" : "Disable"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p>No reward vouchers match this search.</p>
            )}
            {voucherLedger?.pages > 1 && (
              <div className="marketing-admin__voucher-pagination">
                <button type="button" disabled={voucherPage <= 1} onClick={() => setVoucherPage((page) => page - 1)}>Previous</button>
                <span>Page {voucherPage} of {voucherLedger.pages}</span>
                <button type="button" disabled={voucherPage >= voucherLedger.pages} onClick={() => setVoucherPage((page) => page + 1)}>Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default PromoAdminPanel;
