import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaImage, FaTimes, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice";
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

const ProductUpdate = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, isError } = useGetProductByIdQuery(_id);
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: shopsData = [], isLoading: shopsLoading } = useFetchShopsQuery();
  const shops = Array.isArray(shopsData) ? shopsData : shopsData?.data || [];
  const manageableShops = useMemo(() => shops.filter((item) => {
    if (userInfo?.isSuperAdmin) return true;
    const ownerId = typeof item.owner === "object" ? item.owner?._id : item.owner;
    return ownerId && String(ownerId) === String(userInfo?._id || userInfo?.id);
  }), [shops, userInfo]);
  const productShopId = String(product?.shop?._id || product?.shop || "");
  const canEdit = Boolean(product && (
    userInfo?.isSuperAdmin
    || manageableShops.some((item) => String(item._id) === productShopId)
  ));
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [inStock, setInStock] = useState("0");
  const [shop, setShop] = useState("");
  const [uploading, setUploading] = useState(false);
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  useEffect(() => {
    if (!product) return;
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price ?? "");
    setCategory(product.category?._id || product.category || "");
    setQuantity(product.quantity ?? "");
    setBrand(product.brand || "");
    setImages(product.images?.length ? product.images : product.image ? [product.image] : []);
    setInStock(product.inStock ?? "0");
    setShop(product.shop?._id || product.shop || "");
  }, [product]);

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (images.length + files.length > MAX_PHOTOS) {
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
      setImages((current) => [...current, ...uploaded].slice(0, MAX_PHOTOS));
      toast.success(`${uploaded.length === 1 ? "Photo" : "Photos"} uploaded`);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Could not upload product photos.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!images.length) {
      toast.error("Add at least one product photo.");
      return;
    }
    const formData = new FormData();
    formData.append("image", images[0]);
    formData.append("images", JSON.stringify(images));
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("brand", brand.trim());
    formData.append("category", category);
    formData.append("inStock", inStock);
    formData.append("shop", shop);

    try {
      await updateProduct({ productId: _id, formData }).unwrap();
      toast.success("Product updated");
      navigate(`/admin/allproductslist?shop=${encodeURIComponent(shop)}`);
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || "Could not update this product.");
    }
  };

  const removeProduct = async () => {
    if (!window.confirm(`Delete "${product?.name || "this product"}"?`)) return;
    try {
      await deleteProduct(_id).unwrap();
      toast.success("Product removed from your shop");
      navigate(`/admin/allproductslist?shop=${encodeURIComponent(shop)}`);
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || "Could not delete this product.");
    }
  };

  if (isLoading || shopsLoading) return <Loader />;
  if (isError || !product) {
    return <main className="admin-product-page"><AdminMenu /><Message variant="danger">This product could not be loaded.</Message></main>;
  }
  if (!canEdit) {
    return (
      <main className="admin-product-page">
        <AdminMenu />
        <Message variant="danger">You can only manage products in your own shop.</Message>
        <Link className="admin-workspace__action" to="/admin/my-shop">Back to my shop</Link>
      </main>
    );
  }

  return (
    <main className="admin-product-page">
      <AdminMenu />
      <section className="admin-product-panel">
        <header className="admin-product-panel__header">
          <Link className="admin-product-back" to={`/admin/allproductslist?shop=${encodeURIComponent(shop)}`}>
            <FaArrowLeft aria-hidden="true" /> Back to products
          </Link>
          <p className="admin-workspace__eyebrow">Manage your collection</p>
          <h1>Edit product</h1>
          <p>Update details and photos, or remove this product from your shop.</p>
        </header>
        <div className="admin-product-panel__body">
          <form onSubmit={submit}>
            <label className="admin-product-upload">
              <FaImage aria-hidden="true" />
              <span>{uploading ? "Uploading photos…" : `Add product photos (${images.length}/${MAX_PHOTOS})`}</span>
              <input type="file" accept="image/*" multiple disabled={uploading || images.length >= MAX_PHOTOS} onChange={uploadPhotos} />
            </label>
            <div className="admin-product-photo-grid" aria-label="Product photo previews">
              {images.map((image, index) => (
                <figure key={image}>
                  <img src={image} alt={`Product photo ${index + 1}`} />
                  <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setImages((current) => current.filter((item) => item !== image))}>
                    <FaTimes aria-hidden="true" />
                  </button>
                  {index === 0 && <figcaption>Cover photo</figcaption>}
                </figure>
              ))}
            </div>
            <div className="admin-product-form">
              <label className="admin-product-field">
                Product name
                <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={32} />
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
                <input value={brand} onChange={(event) => setBrand(event.target.value)} required />
              </label>
              <label className="admin-product-field">
                Available stock
                <input type="number" value={inStock} onChange={(event) => setInStock(event.target.value)} min="0" />
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
                  {manageableShops.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
              </label>
              <label className="admin-product-field admin-product-field--wide">
                Description
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required />
              </label>
              <div className="admin-product-submit admin-product-submit--split">
                <button type="button" className="admin-product-delete" onClick={removeProduct} disabled={deleting || saving || uploading}>
                  <FaTrash aria-hidden="true" /> {deleting ? "Deleting…" : "Delete product"}
                </button>
                <button type="submit" disabled={saving || deleting || uploading || !images.length}>
                  {saving ? "Saving changes…" : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ProductUpdate;
