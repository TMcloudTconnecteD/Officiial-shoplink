import { useEffect, useState } from "react";
import { FaArrowRight, FaImage, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Message from "../../components/Message";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

const ProductList = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: shopsData, isError: shopsError } = useFetchShopsQuery();
  const shops = Array.isArray(shopsData) ? shopsData : shopsData?.data || [];
  const manageableShops = shops.filter((shop) => {
    if (userInfo?.isSuperAdmin) return true;
    const ownerId = typeof shop.owner === "object" ? shop.owner?._id : shop.owner;
    return ownerId && String(ownerId) === String(userInfo?._id || userInfo?.id);
  });
  const requestedShopId = searchParams.get("shop") || "";
  const [shop, setShop] = useState(requestedShopId);
  const [photos, setPhotos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [createProduct, { isLoading: saving }] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  useEffect(() => {
    if (manageableShops.some((item) => item._id === shop)) return;
    setShop(manageableShops.some((item) => item._id === requestedShopId)
      ? requestedShopId
      : manageableShops[0]?._id || "");
  }, [manageableShops, requestedShopId, shop]);

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error("Choose up to three product photos.");
      return;
    }
    const invalidFile = files.find((file) => !file.type.startsWith("image/") || file.size > MAX_PHOTO_SIZE);
    if (invalidFile) {
      toast.error(invalidFile.size > MAX_PHOTO_SIZE
        ? "Each product photo must be 2 MB or smaller."
        : "Choose image files for your product photos.");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await uploadProductImage(formData).unwrap();
        const url = response?.imageUrl || response?.image;
        if (!url) throw new Error("The photo upload did not return an image URL.");
        return url;
      }));
      setPhotos((current) => [...current, ...uploaded].slice(0, MAX_PHOTOS));
      toast.success(`${uploaded.length === 1 ? "Photo" : "Photos"} uploaded`);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Could not upload product photos.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!photos.length) {
      toast.error("Add at least one product photo.");
      return;
    }
    if (!manageableShops.some((item) => item._id === shop)) {
      toast.error("Choose a shop you manage.");
      return;
    }

    const productData = new FormData();
    productData.append("image", photos[0]);
    productData.append("images", JSON.stringify(photos));
    productData.append("name", name.trim());
    productData.append("description", description.trim());
    productData.append("price", price);
    productData.append("quantity", quantity);
    productData.append("category", category);
    productData.append("brand", brand.trim());
    productData.append("inStock", stock);
    productData.append("shop", shop);

    try {
      await createProduct(productData).unwrap();
      toast.success("Product added to your shop");
      navigate(`/admin/allproductslist?shop=${encodeURIComponent(shop)}`);
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || "Could not add this product.");
    }
  };

  return (
    <main className="admin-product-page">
      <AdminMenu />
      <section className="admin-product-panel">
        <header className="admin-product-panel__header">
          <p className="admin-workspace__eyebrow">Build your collection</p>
          <h1>Add a product</h1>
          <p>Share the details customers need to find their next favorite.</p>
        </header>
        <div className="admin-product-panel__body">
          {shopsError && <Message variant="danger">We couldn’t load your shops. Please try again.</Message>}
          {!manageableShops.length ? (
            <div className="admin-workspace__empty">
              <h2>No shop to add products to yet</h2>
              <p>Your approved shop will appear here as soon as it is ready.</p>
              <Link className="admin-workspace__action" to="/admin/my-shop">Go to my shop</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label className="admin-product-upload">
                <FaImage aria-hidden="true" />
                <span>{uploading ? "Uploading photos…" : `Add product photos (${photos.length}/${MAX_PHOTOS})`}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading || photos.length >= MAX_PHOTOS}
                  onChange={uploadPhotos}
                />
              </label>

              {photos.length > 0 && (
                <div className="admin-product-photo-grid" aria-label="Product photo previews">
                  {photos.map((photo, index) => (
                    <figure key={photo}>
                      <img src={photo} alt={`Product photo ${index + 1}`} />
                      <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((current) => current.filter((item) => item !== photo))}>
                        <FaTimes aria-hidden="true" />
                      </button>
                      {index === 0 && <figcaption>Cover photo</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

              <div className="admin-product-form">
                <label className="admin-product-field">
                  Product name
                  <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={32} placeholder="e.g. Everyday tote bag" />
                </label>
                <label className="admin-product-field">
                  Price (KES)
                  <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} required min="0" step="0.01" />
                </label>
                <label className="admin-product-field">
                  Quantity
                  <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} required min="0" />
                </label>
                <label className="admin-product-field">
                  Brand
                  <input value={brand} onChange={(event) => setBrand(event.target.value)} required placeholder="Product brand" />
                </label>
                <label className="admin-product-field">
                  Available stock
                  <input type="number" value={stock} onChange={(event) => setStock(event.target.value)} min="0" />
                </label>
                <label className="admin-product-field">
                  Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                    <option value="">Choose a category</option>
                    {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="admin-product-field">
                  Shop
                  <select value={shop} onChange={(event) => setShop(event.target.value)} required>
                    <option value="">Choose your shop</option>
                    {manageableShops.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="admin-product-field admin-product-field--wide">
                  Description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required placeholder="What makes this product a great find?" />
                </label>
                <div className="admin-product-submit">
                  <button type="submit" disabled={saving || uploading || !photos.length}>
                    {saving ? "Adding product…" : <>Add product <FaArrowRight aria-hidden="true" /></>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductList;
