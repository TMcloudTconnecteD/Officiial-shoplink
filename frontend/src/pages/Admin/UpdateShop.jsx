import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useUpdateShopMutation, useFetchShopsQuery, useUploadShopImageMutation, useDeleteShopMutation } from '../../redux/Api/shopApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader.jsx';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';

const UpdateShop = () => {
  const { id } = useParams(); // shop ID from URL
  const navigate = useNavigate();

  const { data: categories } = useFetchCategoriesQuery();
  const { data: shops, isLoading: shopsLoading } = useFetchShopsQuery();
  const shop = shops?.find(s => s._id === id); // find the shop to edit

  const [updateShop, { isLoading }] = useUpdateShopMutation();
  const [uploadShopImage] = useUploadShopImageMutation();
  const [deleteShop] = useDeleteShopMutation();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [telephone, setTelephone] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // populate fields when shop data loads
  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setLocation(shop.location);
      setTelephone(shop.telephone);
      setCategory(shop.category?._id || '');
      setImageUrl(shop.image);
    }
  }, [shop]);

  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadShopImage(formData).unwrap();
      setImageUrl(res.imageUrl || res.image);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location || !telephone || !category || !imageUrl) {
      return toast.error('All fields are required');
    }

    try {
      await updateShop({
        mallId: id,
        formData: { name, location, telephone, category, image: imageUrl },
      }).unwrap();

      toast.success('Shop updated successfully');
      navigate('/admin/shops');
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
      navigate('/admin/shops');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to delete shop');
    }
  };

  if (shopsLoading || !shop) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow relative">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/shops')}
        className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-semibold mb-6 absolute top-4 left-4"
      >
        <FaArrowLeft size={18} /> Back to Shops
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">Update Shop</h2>

      {imageUrl && (
        <div className="text-center mb-4">
          <img src={imageUrl} alt="shop" className="mx-auto max-h-48 rounded-xl shadow-md" />
        </div>
      )}

      <div className="mb-6 text-center">
        <label className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200">
          Change Shop Image
          <input
            type="file"
            accept="image/*"
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
              type="number"
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
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
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
