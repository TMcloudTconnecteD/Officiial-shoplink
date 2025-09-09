import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/Api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";

// 👇🏾 Loader Component (your custom one)
const Loader = () => (
  <div className="flex justify-center bg-black items-center min-h-[30vh]">
    <div className="loader animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-cyan-400"></div>
  </div>
);

const AdminProductUpdate = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: productData, isLoading } = useGetProductByIdQuery(params._id);
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [inStock, setInStock] = useState("");

  useEffect(() => {
    if (productData && productData._id) {
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setCategory(productData.category?._id);
      setQuantity(productData.quantity);
      setBrand(productData.brand);
      setImage(productData.image);
      setInStock(productData.inStock);
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully", { position: "top-right", autoClose: 2000 });
  setImage(res.imageUrl || res.image);
    } catch (error) {
      console.error("Image Upload Error:", error);
      const msg = error?.data?.message || error?.error || "Failed to upload image.";
      toast.error(msg, { position: "top-right", autoClose: 2000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("brand", brand);
      formData.append("inStock", inStock);

       const data = await updateProduct({ productId: params._id, formData })

       if (data?.error) {
        toast.error(data.error, {
            position: "top-right", autoClose: 3000
        });
      } else {
        toast.success(`Product successfully updated`, {
            position: "top-right", autoClose: 3000
        });
        navigate("/admin/allproductslist");
      }


    } catch (err) {
      console.log("Update Error:", err);
      const errorMessage = err?.data?.message || err?.error || "Product update failed. Try again.";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    }
  };

  const handleDelete = async () => {
    const answer = window.confirm("Are you sure you want to delete this product?");
    if (!answer) return;
  
    try {
      // Simply passing the product ID without needing to check or update other details
      await deleteProduct(params._id).unwrap();
      toast.success(`"${productData?.name}" has been deleted`, {
        position: "top-right", // Ensure this is in quotes
        autoClose: 2000,
      });
  
      navigate("/admin/allproductslist");
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage = err?.data?.message || err?.error || "Delete failed. Please try again.";
      toast.error(errorMessage, {
        position: "top-right", // Ensure this is in quotes
        autoClose: 3000,
      });
    }
  };
  
 
  if (isLoading) return <Loader />;

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0] text-white bg-[#0a0a0a] min-h-screen py-10">
      <div className="flex flex-col md:flex-row gap-5">
        <AdminMenu />
        <div className="md:w-3/4 p-4 rounded-lg shadow-md bg-[#121212]">
          <div className="text-xl font-bold text-cyan-400 mb-6">Update / Delete Product</div>

          {image && (
            <div className="text-center mb-4">
              <img
                src={image}
                alt="product"
                className="block mx-auto w-full max-h-[300px] object-cover rounded-xl shadow"
              />
            </div>
          )}

          <label className="block cursor-pointer text-center border-2 border-dashed border-cyan-600 py-4 mb-6 rounded-lg hover:bg-[#1a1a1a] transition-all">
            <span className="font-semibold text-cyan-400">
              {image ? "Change Image" : "Upload Image"}
            </span>
            <input type="file" onChange={uploadFileHandler} className="hidden" />
          </label>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
              />

              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
              />

              <input
                type="text"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
              />

              <input
                type="number"
                placeholder="Stock"
                value={inStock}
                onChange={(e) => setInStock(e.target.value)}
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
              />

              <select
                className="p-3 bg-[#101011] border border-cyan-600 rounded-lg"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option>Choose Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-5 p-3 w-full h-40 bg-[#101011] border border-cyan-600 rounded-lg resize-none"
            />

            <div className="mt-8 flex gap-6">
              <button
                type="submit"
                className="flex items-center gap-2 py-4 px-10 rounded-lg text-lg font-bold bg-cyan-600 text-white hover:bg-cyan-700 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Pencil className="w-5 h-5 animate-pulse" />
                Update
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 py-4 px-10 rounded-lg text-lg font-bold bg-pink-600 text-white hover:bg-pink-700 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Trash2 className="w-5 h-5 animate-bounce" />
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductUpdate;
