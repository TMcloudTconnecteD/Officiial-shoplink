import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useUpdateShopMutation, useFetchShopsQuery, useUploadShopImageMutation, useDeleteShopMutation } from '../../redux/Api/shopApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader.jsx';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import resizeImageForUpload from '../../utils/resizeImageForUpload';

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
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [policies, setPolicies] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // populate fields when shop data loads
  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setLocation(shop.location);
      setTelephone(shop.telephone);
      setCategory(shop.category?._id || '');
      setImageUrl(shop.image);
      setCoverImageUrl(shop.coverImage || '');
      setDescription(shop.description || '');
      setPolicies(shop.policies || '');
    }
  }, [shop]);

  const handleImageUpload = async (e, imageKind) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }
    setUploadingImage(true);
    try {
      const resizedFile = await resizeImageForUpload(
        file,
        imageKind === 'cover' ? 1600 : 960,
        imageKind === 'cover' ? 700 : 960
      );
      if (resizedFile.size > 5 * 1024 * 1024) {
        throw new Error('The resized image is larger than the 5 MB upload limit.');
      }
      const formData = new FormData();
      formData.append('image', resizedFile);
      const res = await uploadShopImage(formData).unwrap();
      if (imageKind === 'cover') setCoverImageUrl(res.imageUrl || res.image);
      else setImageUrl(res.imageUrl || res.image);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.error || error.message || 'Image upload failed');
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
      shopData.append("coverImage", coverImageUrl);
      shopData.append("description", description.trim());
      shopData.append("policies", policies.trim());
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

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-pink-100 p-4">
              <p className="mb-3 font-semibold">Shop logo / photo</p>
              {imageUrl && <img src={imageUrl} alt="Shop logo preview" className="mb-3 h-40 w-full rounded-lg object-cover" />}
              <label className="cursor-pointer font-semibold text-pink-700">
                {uploadingImage ? 'Preparing or uploading…' : 'Replace shop photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} onChange={(event) => handleImageUpload(event, 'logo')} className="mt-2 block w-full text-sm" />
              </label>
            </div>
            <div className="rounded-xl border border-pink-100 p-4">
              <p className="mb-3 font-semibold">Cover photo</p>
              {coverImageUrl && <img src={coverImageUrl} alt="Shop cover preview" className="mb-3 h-40 w-full rounded-lg object-cover" />}
              <label className="cursor-pointer font-semibold text-pink-700">
                {uploadingImage ? 'Preparing or uploading…' : 'Replace cover photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} onChange={(event) => handleImageUpload(event, 'cover')} className="mt-2 block w-full text-sm" />
              </label>
              {coverImageUrl && <button type="button" onClick={() => setCoverImageUrl('')} className="mt-3 text-sm text-red-700 underline">Remove cover photo</button>}
            </div>
            <p className="md:col-span-2 -mt-4 text-sm text-gray-600">Images are resized for web before upload. Preview each image here, then save the shop to apply it.</p>
          </div>
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Shop policies</label>
            <textarea
              rows="5"
              value={policies}
              onChange={(e) => setPolicies(e.target.value)}
              placeholder="Share your return, delivery, and other shop policies with customers."
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
