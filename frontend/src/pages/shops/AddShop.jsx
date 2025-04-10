import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateShopMutation, useUploadShopImageMutation } from '../../redux/api/shopApiSlice';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import { toast } from 'react-toastify';
import AdminMenu from '../../pages/Admin/AdminMenu';

const CreateShop = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [uploadShopImage] = useUploadShopImageMutation();
  const [createShop] = useCreateShopMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const contactInfo = `${countryCode}${phoneNumber}`;
      const shopData = new FormData();
        shopData.append('name', name);
        shopData.append('description', description);
        shopData.append('category', category);
        shopData.append('location', location);
        shopData.append('contactInfo', contactInfo);
        shopData.append('image', image);
        

      const { data } = await createShop(shopData);
      if (data.error) {
        toast.error('Cannot create Shop, try again');
      } else {
        toast.success(`${data.name} created successfully`);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error creating shop, try again');
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await uploadShopImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.shopImage);
      setImageUrl(res.shopImage);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
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
            {image ? image.name : 'Upload Shop Image'}
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
              <label className="block text-sm font-medium mb-1">Shop Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shop name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
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
                  {/* Add more as needed */}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="712345678"
                  className="w-2/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
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
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShop;
