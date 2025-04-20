import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation, useUploadProductImageMutation } from '../../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import { toast } from 'react-toastify';
import AdminMenu from './AdminMenu';
import { useFetchShopsQuery } from '../../redux/api/shopApiSlice';

// Stock Indicator Component
const StockIndicator = ({ stock }) => {
  const stockLevel = stock > 5 ? 'high' : stock > 0 ? 'low' : 'out';
  const colors = {
    high: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800', 
    out: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[stockLevel]}`}>
      {stockLevel === 'high' ? 'In Stock' : stockLevel === 'low' ? 'Low Stock' : 'Out of Stock'}
    </span>
  );
};

const ProductList = () => {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [shop, setShop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    quantity: '',
    brand: ''
  });

  const navigate = useNavigate();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: malls } = useFetchShopsQuery();

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
      if (data.error) {
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

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
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
                setImage(null);
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
            {image ? image.name : 'Upload Product Image (Max 2MB)'}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]?.size > 2 * 1024 * 1024) {
                  toast.error('Image size must be less than 2MB');
                  return;
                }
                uploadFileHandler(e);
              }}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name {errors.name && <span className="text-red-500 text-xs"> - {errors.name}</span>}
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
                placeholder="Product name"
                className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400`}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {name.length}/50
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">KES</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full pl-12 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Original"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">In Stock</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <StockIndicator stock={stock} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option disabled value="">Select Category</option>
                {categories?.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium mb-1">Shop</label>
              <select
                value={shop}
                onChange={e => setShop(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option disabled value="">Select Shop</option>
                {malls?.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
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

          <div className="mt-10 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductList;
