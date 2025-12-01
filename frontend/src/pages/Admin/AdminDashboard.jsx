import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

import { useGetUsersQuery } from "../../redux/Api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/Api/orderApiSlice";

const AdminDashboard = () => {
  // Queries
  const { data: sales, isLoading: loadingSales } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loadingCustomers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: salesDetail, isLoading: loadingSalesDetail } = useGetTotalSalesByDateQuery();

  // Chart state
  const [chartState, setChartState] = useState({
    options: {
      chart: { type: "line" },
      tooltip: { theme: "dark" },
      colors: ["#00E396"],
      dataLabels: { enabled: true },
      stroke: { curve: "smooth" },
      title: { text: "Sales Trend", align: "left" },
      grid: { borderColor: "#ccc" },
      markers: { size: 3 },
      xaxis: { categories: [], title: { text: "Date" } },
      yaxis: { title: { text: "Sales (KES)" }, min: 0 },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  // Update chart when salesDetail is available
  useEffect(() => {
    if (salesDetail && salesDetail.length > 0) {
      const formattedSales = salesDetail.map(item => ({
        x: item._id,
        y: Number(item.totalSales),
      }));

      setChartState(prev => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { ...prev.options.xaxis, categories: formattedSales.map(f => f.x) },
        },
        series: [{ name: "Sales", data: formattedSales.map(f => f.y) }],
      }));
    }
  }, [salesDetail]);

  // Show loader if any critical data is still loading
  if (loadingSales || loadingCustomers || loadingOrders || loadingSalesDetail) {
    return <Loader />;
  }

  return (
    <>
      <AdminMenu />

      <section className="xl:ml-[4rem] md:ml-[0rem] p-4">
        <div className="w-full flex flex-wrap justify-around gap-5">
          {/* Sales Card */}
          <div className="rounded-lg bg-black p-5 w-[20rem] text-white mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-orange-500 text-center p-3">
              KES
            </div>
            <p className="mt-5">Sales</p>
            <h1 className="text-xl font-bold">
              {sales ? Number(sales.totalSales).toFixed(2) : "0.00"}
            </h1>
          </div>

          {/* Customers Card */}
          <div className="rounded-lg bg-black p-5 w-[20rem] text-white mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-orange-500 text-center p-3">
              👥
            </div>
            <p className="mt-5">Customers</p>
            <h1 className="text-xl font-bold">{customers ? customers.length : 0}</h1>
          </div>

          {/* Orders Card */}
          <div className="rounded-lg bg-black p-5 w-[20rem] text-white mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-orange-500 text-center p-3">
              📦
            </div>
            <p className="mt-5">All Orders</p>
            <h1 className="text-xl font-bold">{orders ? orders.totalOrders : 0}</h1>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="mt-10 ml-[2rem]">
          <Chart
            options={chartState.options}
            series={chartState.series}
            type="bar"
            width="80%"
          />
        </div>

        {/* Recent Orders */}
        <div className="mt-10">
          <OrderList />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
