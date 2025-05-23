import React, { useState } from 'react';
import ShopList from '../../components/ShopList.jsx';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateShopMutation, useUploadShopImageMutation } from '../../redux/Api/shopApiSlice.js';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice.js';
import AdminMenu from '../Admin/AdminMenu';
import Loader from '../../components/Loader.jsx';

const AddShop = () => {
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [telephone, setTelephone] = useState('');
  const [category, setCategory] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [isLoading, setIsLoading] = useState(false);
  const[errors, setErrors] = useState({
    name: '',
    location: '',
    telephone: '',
  });

  const navigate = useNavigate();
  const [uploadShopImage] = useUploadShopImageMutation();
  const [createShop] = useCreateShopMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !location || !telephone || !category || !image) {
      toast.error('Please fill in all required fields and upload an image');
      return;
    }

    setIsLoading(true);
    try {
      const mallData = new FormData();
      mallData.append('image', image);
      mallData.append('name', name);
      mallData.append('location', location);
      mallData.append('telephone', telephone);
      mallData.append('category', category);

      // Debugging logs
      console.log('FormData content:');
      for (let [key, value] of mallData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await createShop(mallData);

      if (response.error) {
        toast.error(response.error.data?.message || 'Cannot create shop, try again');
      } else if (response.data) {
        toast.success(`${response.data.name} created successfully`);
        navigate('/Admin/shops/all');
      } else {
        toast.error('Unexpected error occurred');
      }
    } catch (error) {
      console.error('Shop creation error:', error);
      toast.error('Failed to create shop');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFileHandler = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Server did not return JSON');
      }
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      setImage(data.data.secure_url);
      setImageUrl(data.data.secure_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Shop 🏬</h2>

        {imageUrl && (
          <div className="text-center mb-4">
            <img
              src={imageUrl}
              alt="shop"
              className="mx-auto max-h-48 rounded-xl shadow-md"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-4 text-center rounded-xl shadow-sm transition-all duration-200">
            {image ? 'Change Shop Image' : 'Upload Shop Image'}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={uploadFileHandler}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Shop Name {errors.name &&  <span className="text-red-500 text-xs"> - {errors.name}</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                   if (e.target.value.length > 50) {
                      setErrors({...errors, name: 'Max 50 characters'});
                    } else {
                      setErrors({...errors, name: ''});
                      setName(e.target.value);
                    }
                  }}
                placeholder="Shop name"
                className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400`}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {name.length}/50
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Info</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-1/3 p-3 border border-gray-300 rounded-lg"
                >
                  <option value="+254">🇰🇪 +254</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <input
                  type="number"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="712345678"
                  className="w-2/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option disabled value="">
                  Select Category
                </option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader className='bg-green-200' /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShop;
