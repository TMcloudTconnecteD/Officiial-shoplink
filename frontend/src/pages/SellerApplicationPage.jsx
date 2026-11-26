import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaImage, FaStore, FaTimes } from "react-icons/fa";
import "./SellerApplicationPage.css";
import { useFetchCategoriesQuery } from "../redux/Api/categoryApiSlice";
import { useUploadShopImageMutation } from "../redux/Api/shopApiSlice";
import { useApplyAsSellerMutation, useGetMySellerApplicationQuery } from "../redux/Api/sellerApiSlice";

const SellerApplicationPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: application, isLoading } = useGetMySellerApplicationQuery(undefined, { skip: !userInfo });
  const [apply, { isLoading: submitting }] = useApplyAsSellerMutation();
  const [form, setForm] = useState({ fullName: "", phone: "", shopName: "", location: "", category: "", description: "", image: "" });
  const [uploadShopImage, { isLoading: uploadingImage }] = useUploadShopImageMutation();

  useEffect(() => {
    if (userInfo?.username) setForm((current) => ({ ...current, fullName: current.fullName || userInfo.username }));
  }, [userInfo?.username]);

  useEffect(() => {
    if (!application) return;
    setForm((current) => ({
      ...current,
      fullName: application.fullName || current.fullName,
      phone: application.phone || current.phone,
      shopName: application.shopName || current.shopName,
      location: application.location || current.location,
      category: application.category?._id || application.category || current.category,
      description: application.description || current.description,
      image: application.image || current.image,
    }));
  }, [application]);

  const handleShopPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    const fileInput = event.currentTarget;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Shop photos must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);
    try {
      const response = await uploadShopImage(uploadData).unwrap();
      const cloudinaryUrl = response?.imageUrl;
      if (!cloudinaryUrl || !cloudinaryUrl.startsWith("https://res.cloudinary.com/")) {
        throw new Error("Cloudinary did not return a valid image URL.");
      }
      setForm((current) => ({ ...current, image: cloudinaryUrl }));
      toast.success("Shop photo uploaded");
    } catch (error) {
      toast.error(error?.data?.message || error.message || "Shop photo upload failed");
    } finally {
      fileInput.value = "";
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.image) {
      toast.error("Upload a shop photo before submitting your application.");
      return;
    }
    try {
      await apply(form).unwrap();
      toast.success("Seller application submitted");
    } catch (error) {
      toast.error(error?.data?.message || "Could not submit seller application");
    }
  };

  if (!userInfo) return (
    <div className="seller-application-page seller-application-page--signed-out">
      <h1>Sell on ShopLink</h1>
      <p>Sign in to apply for an approved shop account.</p>
      <Link to="/login?redirect=%2Fseller%2Fapply" className="seller-application-primary">Sign in</Link>
    </div>
  );

  return (
    <div className="seller-application-page">
      <div className="seller-application-card">
        <aside className="seller-application-intro">
          <FaStore aria-hidden="true" />
          <h1>Open your shop</h1>
          <p>Apply for your own ShopLink shop account. After approval, you will manage only your shop and products.</p>
          <span className="seller-application-intro__note">Your application is reviewed by a super administrator.</span>
        </aside>
        <section className="seller-application-content">
          <div className="seller-application-content__heading">
            <p>Seller onboarding</p>
            <h2>Seller application</h2>
          </div>
            {isLoading ? <p className="seller-application-loading">Loading your application…</p>
              : application?.status === "pending" ? (
                <div className="seller-application-state seller-application-state--pending">
                  <h3>Application under review</h3>
                  <p>The super administrator is reviewing your shop application.</p>
                </div>
              ) : application?.status === "approved" ? (
                <div className="seller-application-state seller-application-state--approved">
                  <h3>Your shop is approved</h3>
                  <p>Your shop is ready. Add products, update details, and follow orders.</p>
                  <Link to="/admin/my-shop" className="seller-application-primary">Manage my shop</Link>
                </div>
              ) : (
                <form onSubmit={submit} className="seller-application-form">
                  <h3 className="seller-application-form__title">{application?.status === "rejected" ? "Update and reapply" : "Your shop details"}</h3>
                  <div className="seller-application-photo-field">
                    <span className="seller-application-label">Shop photo</span>
                    <p className="seller-application-help">This photo will appear on your shop page after approval. JPG, PNG, GIF or WEBP up to 5 MB.</p>
                    {form.image ? (
                      <div className="seller-application-photo">
                        <img src={form.image} alt="Shop photo preview" />
                        <button type="button" aria-label="Remove shop photo" onClick={() => setForm((current) => ({ ...current, image: "" }))}>
                          <FaTimes aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <label className="seller-application-upload">
                        <FaImage aria-hidden="true" />
                        <span>{uploadingImage ? "Uploading to Cloudinary…" : "Choose shop photo"}</span>
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={uploadingImage} onChange={handleShopPhotoChange} />
                      </label>
                    )}
                    {form.image && (
                      <label className="seller-application-change">
                        {uploadingImage ? "Uploading…" : "Change photo"}
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={uploadingImage} onChange={handleShopPhotoChange} />
                      </label>
                    )}
                  </div>
                  {[
                    ["fullName", "Full name", "text"],
                    ["phone", "Phone number", "tel"],
                    ["shopName", "Shop name", "text"],
                    ["location", "Location", "text"],
                  ].map(([name, label, type]) => (
                    <label key={name} className="seller-application-field">
                      {label}
                      <input required type={type} name={name} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} />
                    </label>
                  ))}
                  <label className="seller-application-field seller-application-field--wide">
                    Shop category
                    <select required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                      <option value="">Select category</option>
                      {(Array.isArray(categories) ? categories : categories?.categories || []).map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="seller-application-field seller-application-field--wide">
                    About the shop
                    <textarea rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  </label>
                  <button type="submit" disabled={submitting || uploadingImage || !form.image} className="seller-application-primary seller-application-submit">
                    {submitting ? "Submitting..." : "Submit seller application"}
                  </button>
                </form>
              )}
        </section>
      </div>
    </div>
  );
};

export default SellerApplicationPage;
