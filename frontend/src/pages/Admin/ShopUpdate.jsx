import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetShopDetailsQuery,
  useUpdateShopMutation,
  useUploadShopImageMutation
} from "../../redux/Api/shopApiSlice";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";

const ShopUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: shop, isLoading } = useGetShopDetailsQuery(id);
  const [updateShop] = useUpdateShopMutation();
  const [uploadShopImage] = useUploadShopImageMutation();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setLocation(shop.location);
      setDescription(shop.description || "");
      setImageUrl(shop.image);
    }
  }, [shop]);

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be under 2MB");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const res = await uploadShopImage(formData).unwrap();
      setImageUrl(res.imageUrl || res.image);
      setImage(res.imageUrl || res.image);

      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const shopData = { name, location, description, image: image || imageUrl };

      await updateShop({ mallId: id, formData: shopData }).unwrap();

      toast.success("Shop updated successfully");
      navigate("/admin/shops");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
        <h2 className="text-2xl font-bold mb-6">Update Shop</h2>

        {imageUrl && (
          <div className="text-center mb-4">
            <img
              src={imageUrl}
              alt="shop"
              className="mx-auto w-48 h-48 object-cover rounded-xl shadow"
            />
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium">Change Photo</span>
          <input
            type="file"
            className="block mt-2"
            onChange={handleImageUpload}
          />
        </label>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Shop Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold"
          >
            Update Shop
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopUpdate;
