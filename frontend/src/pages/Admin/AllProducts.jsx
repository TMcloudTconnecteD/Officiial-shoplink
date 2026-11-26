import { useMemo, useState } from "react";
import { FaBoxOpen, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useAllProductsQuery } from "../../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const AllProducts = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useAllProductsQuery();
  const { data: shopsData = [], isLoading: shopsLoading, isError: shopsError } = useFetchShopsQuery();
  const [search, setSearch] = useState("");
  const allProducts = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const manageableShopIds = useMemo(() => {
    const shops = Array.isArray(shopsData) ? shopsData : shopsData?.data || [];
    return shops
      .filter((shop) => {
        if (userInfo?.isSuperAdmin) return true;
        const ownerId = typeof shop.owner === "object" ? shop.owner?._id : shop.owner;
        return ownerId && String(ownerId) === String(userInfo?._id || userInfo?.id);
      })
      .map((shop) => String(shop._id));
  }, [shopsData, userInfo]);
  const selectedShopId = searchParams.get("shop");
  const products = useMemo(() => allProducts.filter((product) => {
    const productShopId = String(product.shop?._id || product.shop || "");
    return manageableShopIds.includes(productShopId)
      && (!selectedShopId || productShopId === selectedShopId);
  }), [allProducts, manageableShopIds, selectedShopId]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => [
      product.name,
      product.brand,
      product.category?.name || product.category,
      product.shop?.name || product.shop,
      product._id,
    ].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [products, search]);

  return (
    <div className="admin-products-page">
      <AdminMenu />
      <header className="admin-workspace__header">
        <div>
          <p className="admin-workspace__eyebrow">Catalogue management</p>
          <h1>Products</h1>
          <p className="admin-workspace__description">Add, edit, and remove products in your shop.</p>
        </div>
        <div className="admin-workspace__summary">
          <div className="admin-workspace__stat"><span>Total products</span><strong>{products.length}</strong></div>
          <Link className="admin-workspace__action" to={selectedShopId ? `/admin/productlist?shop=${selectedShopId}` : "/admin/productlist"}>Add product</Link>
        </div>
      </header>

      <label className="admin-workspace__search">
        <FaSearch aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, brands, categories or shop"
          aria-label="Search products"
        />
      </label>

      {isLoading || shopsLoading ? <div className="admin-workspace__loading"><Loader /></div>
        : isError ? (
          <Message variant="danger">{error?.data?.message || error?.error || "Could not load products."}</Message>
        ) : shopsError ? (
          <Message variant="danger">We couldn’t load your shops, so product ownership can’t be verified.</Message>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-workspace__empty">
            <FaBoxOpen aria-hidden="true" />
            <h2>{search ? "No matching products" : "No products yet"}</h2>
            <p>{search ? "Try a different product name, brand, category, or shop." : "Create a product to start building your catalogue."}</p>
          </div>
        ) : (
          <div className="admin-products-grid">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/admin/product/update/${product._id}`}
                className="admin-product-card"
              >
                <img src={product.image} alt={product.name || "Product"} loading="lazy" />
                <div className="admin-product-card__body">
                  <h2>{product.name}</h2>
                  <p>{product.description || "No description provided."}</p>
                  <div className="admin-product-card__footer">
                    <strong>KES {Number(product.price || 0).toLocaleString()}</strong>
                    <span>{product.shop?.name || "Update details"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
};

export default AllProducts;
