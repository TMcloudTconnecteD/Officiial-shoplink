import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery } from "../../redux/Api/productApiSlice";
import AdminMenu from "./AdminMenu";

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) {
    return <div className="text-center text-lg text-gray-500">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-lg text-red-500">Error loading products</div>;
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-3/4 md:ml-[6rem]">
              <div className="mb-8 text-3xl font-bold text-gray-800">
                All Products ({products.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/admin/product/update/${product._id}`}
                    className="transform transition duration-300 hover:scale-105"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xl font-semibold text-gray-900">
                            {product?.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {moment(product.createdAt).format("MMM Do, YYYY")}
                          </p>
                        </div>

                        <p className="text-gray-500 text-sm mt-2">
                          {product?.description?.substring(0, 160)}...
                        </p>

                        <div className="flex justify-between items-center mt-4">
                          <Link
                            to={`/admin/product/update/${product._id}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700"
                          >
                            Update
                            <svg
                              className="w-4 h-4 ml-2"
                              fill="none"
                              viewBox="0 0 14 10"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                              />
                            </svg>
                          </Link>
                          <p className="text-lg font-semibold text-gray-800">
                            ${product?.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="md:w-1/4 mt-10 md:mt-0">
              <AdminMenu />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllProducts;
