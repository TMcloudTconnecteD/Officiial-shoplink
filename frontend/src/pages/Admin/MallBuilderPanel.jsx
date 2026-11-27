import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaArrowRight, FaPlus, FaStore, FaTrophy } from "react-icons/fa";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice.js";
import {
  useConvertShopToMallMutation,
  useCreateMallChildShopMutation,
  useGetMallAnalyticsQuery,
  useGetMallProgressQuery,
  useUploadShopImageMutation,
} from "../../redux/Api/shopApiSlice.js";
import Message from "../../components/Message.jsx";
import "./MallBuilderPanel.css";

const MallBuilderPanel = () => {
  const { data: progress, isLoading, isError, error } = useGetMallProgressQuery(undefined, { pollingInterval: 60000, refetchOnFocus: true });
  const { data: categoriesData = [] } = useFetchCategoriesQuery();
  const [convert, { isLoading: converting }] = useConvertShopToMallMutation();
  const [createChild, { isLoading: creatingChild }] = useCreateMallChildShopMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadShopImageMutation();
  const { data: analytics } = useGetMallAnalyticsQuery(progress?.mall?._id, { skip: !progress?.mall?._id });
  const [form, setForm] = useState({ name: "", location: "", telephone: "", category: "", image: "", description: "" });
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [];
  const usedCategoryIds = useMemo(
    () => new Set((progress?.mall?.childShops || []).map((shop) => String(shop.category?._id || shop.category))),
    [progress?.mall?.childShops]
  );

  if (isLoading) return null;
  if (isError) return <Message variant="danger">{error?.data?.message || "Mall progress could not be loaded."}</Message>;

  const earned = Number(progress?.lifetimePointsEarned || 0);
  const unlocked = earned >= 5000;
  const slotsAvailable = Number(progress?.slotsAvailable || 0);
  const slotsUsed = Number(progress?.slotsUsed || 0);
  const nextMilestone = 5000 + slotsAvailable * 1000;
  const pointsToNextSlot = Math.max(0, nextMilestone - earned);
  const progressPercent = unlocked
    ? Math.max(0, Math.min(100, ((earned - 5000) % 1000) / 10))
    : Math.max(0, Math.min(100, earned / 50));

  const convertShop = async () => {
    try {
      await convert(progress.sourceShop._id).unwrap();
      toast.success("Your mall is unlocked! Your existing shop and products are unchanged.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not unlock your mall.");
    }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    try {
      const uploaded = await uploadImage(body).unwrap();
      const image = uploaded?.imageUrl || uploaded?.image;
      if (!image) throw new Error("The image upload did not return a URL.");
      setForm((current) => ({ ...current, image }));
      toast.success("Shop image uploaded");
    } catch (error) {
      toast.error(error?.data?.message || error.message || "Shop image upload failed.");
    } finally {
      event.target.value = "";
    }
  };

  const submitChildShop = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    try {
      await createChild({ mallId: progress.mall._id, formData }).unwrap();
      setForm({ name: "", location: "", telephone: "", category: "", image: "", description: "" });
      toast.success("Child shop added to your mall.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not add this shop.");
    }
  };

  return (
    <section className="mall-builder" aria-label="Mall unlock and management">
      {!progress?.mall && progress?.sourceShop && (
        <div className="mall-builder__unlock">
          <div className="mall-builder__trophy"><FaTrophy /></div>
          <div className="mall-builder__unlock-copy">
            <p className="mall-builder__eyebrow">Lifetime points milestone</p>
            <h2>{unlocked ? "Your next big move starts here" : "Build toward your own mall"}</h2>
            <p>
              {unlocked
                ? `You've earned ${earned.toLocaleString()} points — turn your shop into a MALL!`
                : `${earned.toLocaleString()} / 5,000 lifetime points · ${progress.pointsToUnlock.toLocaleString()} more to unlock your mall.`}
            </p>
            {!unlocked && <div className="mall-builder__progress"><span style={{ width: `${progressPercent}%` }} /></div>}
          </div>
          {unlocked && (
            <button type="button" onClick={convertShop} disabled={converting}>
              {converting ? "Unlocking…" : "🏆 Build Your Mall"}
            </button>
          )}
        </div>
      )}

      {progress?.mall && (
        <>
          <header className="mall-builder__header">
            <div className="mall-builder__trophy"><FaTrophy /></div>
            <div>
              <p className="mall-builder__eyebrow">Mall owner studio</p>
              <h2>🏆 Mall Level {progress.level} — {slotsUsed}/{slotsAvailable} shops</h2>
              <p>{pointsToNextSlot > 0 ? `${pointsToNextSlot.toLocaleString()} more points = your next shop!` : "Next shop slot unlocked!"}</p>
            </div>
            <a href={`/malls/${progress.mall._id}`} target="_blank" rel="noreferrer">View mall <FaArrowRight /></a>
          </header>
          <div className="mall-builder__progress"><span style={{ width: `${progressPercent}%` }} /></div>

          <div className="mall-builder__analytics">
            {(analytics?.shops || []).map((shop) => (
              <article key={shop._id}>
                <strong>{shop.name}</strong>
                <span>{shop.orderCount} paid orders</span>
                <span>KES {Number(shop.revenue).toLocaleString()} revenue</span>
                <span>{shop.pointsEarned} owner points</span>
              </article>
            ))}
            {!analytics?.shops?.length && <p>Mall-wide shop analytics will appear here.</p>}
          </div>

          <div className="mall-builder__child-shops">
            <div className="mall-builder__section-title">
              <div><p className="mall-builder__eyebrow">Grow your storefront family</p><h3>Child shops</h3></div>
              <span>{Math.max(0, slotsAvailable - slotsUsed)} slots available</span>
            </div>
            <div className="mall-builder__children">
              {(progress.mall.childShops || []).map((shop) => (
                <article key={shop._id}><img src={shop.image} alt="" /><div><strong>{shop.name}</strong><span>{shop.category?.name || "Category"} · {shop.location}</span></div></article>
              ))}
              {!progress.mall.childShops?.length && <p className="mall-builder__empty">Your first child shop will join this mall.</p>}
            </div>
            {slotsUsed < slotsAvailable ? (
              <form className="mall-builder__form" onSubmit={submitChildShop}>
                <h4><FaPlus /> Open a child shop</h4>
                <div className="mall-builder__fields">
                  <label>Shop name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                  <label>Location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
                  <label>Phone<input required type="tel" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} /></label>
                  <label>Unique category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category._id} value={category._id} disabled={usedCategoryIds.has(String(category._id))}>{category.name}{usedCategoryIds.has(String(category._id)) ? " — already used in this mall" : ""}</option>)}
                  </select></label>
                  <label className="mall-builder__wide">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="2" /></label>
                </div>
                <div className="mall-builder__upload">
                  {form.image && <img src={form.image} alt="Child shop preview" />}
                  <label>{uploadingImage ? "Uploading…" : form.image ? "Replace shop photo" : "Upload shop photo"}<input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingImage} /></label>
                </div>
                <button type="submit" disabled={creatingChild || uploadingImage || !form.image}>
                  {creatingChild ? "Creating shop…" : "Add shop to mall"}
                </button>
              </form>
            ) : (
              <p className="mall-builder__next-slot">{pointsToNextSlot.toLocaleString()} more points = your next shop!</p>
            )}
          </div>
        </>
      )}
      {!progress?.mall && !progress?.sourceShop && (
        <div className="mall-builder__empty">
          <FaStore /><p>Your approved shop will be ready for mall milestones here.</p>
        </div>
      )}
    </section>
  );
};

export default MallBuilderPanel;
