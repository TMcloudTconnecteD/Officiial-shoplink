import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useUpdateShopMutation, useFetchShopsQuery, useUploadShopImageMutation, useDeleteShopMutation } from '../../redux/Api/shopApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader.jsx';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const UpdateShop = () => {
  const { id } = useParams(); // shop ID from URL
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: categories } = useFetchCategoriesQuery();
  const { data: shops, isLoading: shopsLoading } = useFetchShopsQuery();
  const shop = (Array.isArray(shops) ? shops : shops?.data || []).find((item) => item._id === id);
  const ownerId = typeof shop?.owner === 'object' ? shop.owner?._id : shop?.owner;
  const canManageShop = Boolean(userInfo?.isSuperAdmin || (
    ownerId && String(ownerId) === String(userInfo?._id || userInfo?.id)
  ));

  const [updateShop, { isLoading }] = useUpdateShopMutation();
  const [uploadShopImage] = useUploadShopImageMutation();
  const [deleteShop] = useDeleteShopMutation();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [telephone, setTelephone] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // populate fields when shop data loads
  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setLocation(shop.location);
      setTelephone(shop.telephone);
      setCategory(shop.category?._id || '');
      setImageUrl(shop.image);
      setDescription(shop.description || '');
    }
  }, [shop]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Shop photos must be 2 MB or smaller.');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await uploadShopImage(formData).unwrap();
      setImageUrl(res.imageUrl || res.image);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !telephone || !category || !imageUrl) {
      toast.error('Complete the required shop details.');
      return;
    }

    try {
      const shopData = new FormData();
      shopData.append("name", name.trim());
      shopData.append("location", location.trim());
      shopData.append("telephone", telephone);
      shopData.append("category", category);
      shopData.append("image", imageUrl);
      shopData.append("description", description.trim());
      await updateShop({
        mallId: id,
        formData: shopData,
      }).unwrap();

      toast.success('Shop updated successfully');
      navigate(`/admin/my-shop?shop=${id}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update shop');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    try {
      await deleteShop(id).unwrap();
      toast.success('Shop deleted successfully');
      navigate('/admin/my-shop');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to delete shop');
    }
  };

  if (shopsLoading) return <Loader />;
  if (!shop) return <p role="alert" className="mx-auto mt-10 max-w-3xl px-4">This shop could not be found.</p>;
  if (!canManageShop) return <p role="alert" className="mx-auto mt-10 max-w-3xl px-4">You can only edit a shop you manage.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow relative">
      
      {/* Back Button */}
      <AdminMenu />

      <button type="button" onClick={() => navigate(`/admin/my-shop?shop=${id}`)} className="mb-6 flex items-center gap-2 font-semibold text-emerald-700">
        <FaArrowLeft aria-hidden="true" /> Back to my shop
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">Update shop</h2>

      {imageUrl && (
        <div className="text-center mb-4">
          <img src={imageUrl} alt="shop" className="mx-auto max-h-48 rounded-xl shadow-md" />
        </div>
      )}

      <div className="mb-6 text-center">
        <label className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200">
          {uploadingImage ? 'Uploading photo…' : 'Change shop image'}
          <input
            type="file"
            accept="image/*"
            disabled={uploadingImage}
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Shop Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telephone</label>
            <input
              type="tel"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Select Category</option>
              {categories?.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">About the shop</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader /> : 'Update Shop'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2"
          >
            <FaTrash /> Delete Shop
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateShop;
