import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation, useUploadProductImageMutation } from '../../redux/Api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { toast } from 'react-toastify';
import product from '../../../../backend/models/productModel';

const ProductList = () => {
const [image, setImage] = useState('')
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [price, setPrice] = useState('')
const [quantity, setQuantity] = useState('')
const [category, setCategory] = useState('')
const [brand, setBrand] = useState('')
const [stock, setStock] = useState(0)
const [imageUrl, setImageUrl] = useState(null)
const navigate = useNavigate()


const [uploadProductImage] = useUploadProductImageMutation()
const [createProduct] = useCreateProductMutation()
const { data: categories } = useFetchCategoriesQuery()
// console.log(categories)

const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        
        const productData = new FormData()
        productData.append('image', image)
        productData.append('name', name)
        productData.append('description', description)
        productData.append('price', price)
        productData.append('quantity', quantity)
        productData.append('category', category)
        productData.append('brand', brand)
        productData.append('stock', stock)



        const { data } = await createProduct(productData)
            if (data?.error) {
                toast.error('Cannot create Product, try again')


            } else {
                toast.success(`${data.name} created successfully`)
                navigate('/');


            }







    } catch (error) {
        console.error(error)
        toast.error('Error creating product, try again')


        
        
    }

}



const uploadFileHandler = async (e) => {
    const formData = new FormData()
    formData.append('image', e.target.files[0])


    try {
        const res = await uploadProductImage(formData).unwrap()
        toast.success(res.message)
        setImage(res.image)
        setImageUrl(res.image)




    } catch (error) {
        toast.error(error?.data?.message || error.error)


        
    }


}
return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Product 🗽</h2>
  
        {imageUrl && (
          <div className="text-center mb-4">
            <img
              src={imageUrl}
              alt="product"
              className="mx-auto max-h-48 rounded-xl shadow-md"
            />
          </div>
        )}
  
        <div className="mb-6">
          <label className="block cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-4 text-center rounded-xl shadow-sm transition-all duration-200">
            {image ? image.name : 'Upload Product Image'}
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
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Product name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="$$"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
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
              <label className="block text-sm font-medium mb-1">In Stock</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
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
                <option disabled value="">Select Category</option>
                {categories?.map(c => (
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
  )
  }
  
  
export default ProductList;