import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../../redux/Api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { toast } from 'react-toastify';
import AdminMenu from './AdminMenu';

// Stock Indicator Component
const StockIndicator = ({ stock }) => {
  const stockLevel = stock > 5 ? 'high' : stock > 0 ? 'low' : 'out';
  const colors = {
    high: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    out: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[stockLevel]}`}>
      {stockLevel === 'high' ? 'In Stock' : stockLevel === 'low' ? 'Low Stock' : 'Out of Stock'}
    </span>
  );
};

const ProductList = () => {
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [shop, setShop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    quantity: '',
    brand: '',
  });

  const navigate = useNavigate();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: malls } = useFetchShopsQuery();

  const uploadFileHandler = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    const file = e.target.files[0];

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const res = await uploadProductImage(formData).unwrap();
      setImage(res.imageUrl); // used when submitting form
      setImageUrl(res.imageUrl); // for preview
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = new FormData();
      productData.append('image', image);
      productData.append('name', name);
      productData.append('description', description);
      productData.append('price', price);
      productData.append('quantity', quantity);
      productData.append('category', category);
      productData.append('brand', brand);
      productData.append('inStock', stock);
      productData.append('shop', shop);

      const { data } = await createProduct(productData);
      if (data?.error) {
        toast.error('Cannot create Product, try again');
      } else {
        toast.success(`${data.name} created successfully`);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error creating product, try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Product 🗽</h2>

        {imageUrl && (
          <div className="text-center mb-4">
            <img
              src={imageUrl}
              alt="product preview"
              className="mx-auto max-h-48 rounded-xl shadow-md"
            />
            <button
              type="button"
              onClick={() => {
                setImage('');
                setImageUrl(null);
              }}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Remove Image
            </button>
          </div>
        )}

        <div className="mb-6">
          <label className="block cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-4 text-center rounded-xl shadow-sm transition-all duration-200">
            {uploading ? 'Uploading...' : image ? 'Change Image' : 'Upload Product Image (Max 2MB)'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name {errors.name && <span className="text-red-500 text-xs"> - {errors.name}</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  if (e.target.value.length > 50) {
                    setErrors({ ...errors, name: 'Max 50 characters' });
                  } else {
                    setErrors({ ...errors, name: '' });
                    setName(e.target.value);
                  }
                }}
                placeholder="Product name"
                className={`w-full p-3 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400`}
              />
              <div className="text-xs text-gray-500 text-right mt-1">{name.length}/50</div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">KES</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Original"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Stock + Indicator */}
            <div>
              <label className="block text-sm font-medium mb-1">In Stock</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <StockIndicator stock={stock} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop */}
            <div>
              <label className="block text-sm font-medium mb-1">Shop</label>
              <select
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Select shop</option>
                {malls?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Enter product description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              ></textarea>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductList;
