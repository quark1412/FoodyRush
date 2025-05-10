import { useState, useEffect, useContext } from "react";
import { Card, Table } from "flowbite-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../../components/DashboardCard";
import { getAllOrders } from "../../data/orders";
import { getAllProducts, getBestSellerProducts } from "../../data/products";
import { getAllUsers, getUserById } from "../../data/users";
import { getAllImagesByProductId } from "../../data/productImages";

import { formatDate, formatToVND, formatURL } from "../../utils/format";
import { ORDER_STATUS } from "../../utils/Constants";
import { getPaymentDetailById } from "../../data/paymentDetail";
import { getOrderDetailsByOrderId } from "../../data/orderDetail";
import { getOrderTrackingByOrderId } from "../../data/orderTracking";
import { getStatistics } from "../../data/statistic";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import Error from "../Error";
import Cookies from "js-cookie";
import Pagination from "../../components/Pagination";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [yearRevenue, setYearRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const BEST_SELLER_PRODUCTS_PER_PAGE = 3;

  const { setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  async function fetchOrders() {
    try {
      const fetchedOrders = await getAllOrders();
      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const user = order.userInfo;
          const paymentMethod = order.paymentMethod;
          const trackingData = order.deliveryInfo;
          const tracking = trackingData.length
            ? trackingData[trackingData.length - 1]
            : {};

          return {
            ...order,
            user,
            paymentMethod,
            tracking,
          };
        })
      );

      setOrders(ordersWithDetails);

      const sortedOrders = ordersWithDetails.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setLatestOrders(sortedOrders.slice(0, 5));
    } catch (error) {}
  }

  const fetchProduct = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {}
  };

  const fetchUser = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {}
  };

  const fetchBestSellerProducts = async () => {
    try {
      const fetchedBestSeller = await getBestSellerProducts();
      const data = await Promise.all(
        fetchedBestSeller.map(async (product) => {
          const images = product.images;
          return { ...product, images };
        })
      );
      setBestSellerProducts(data);
    } catch (error) {}
  };

  const fetchStatistics = async () => {
    try {
      const data = await getStatistics(undefined, undefined, undefined);
      const total = data.reduce((sum, stat) => {
        return sum + stat.totalRevenue;
      }, 0);
      setTotalRevenue(total);
    } catch (error) {}
  };

  const fetchYearStatistics = async () => {
    try {
      const data = await getStatistics(undefined, undefined, dayjs().year());

      const yearlyRevenue = Array(12).fill(0);
      const yearlyOrder = Array(12).fill(0);

      data.forEach((stat) => {
        if (stat._id) {
          if (stat._id.month) {
            const monthIndex = stat._id.month - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              yearlyOrder[monthIndex] += stat.totalOrder || 0;
              yearlyRevenue[monthIndex] += stat.totalRevenue || 0;
            }
          }
        }
      });

      const monthlyReport = yearlyRevenue.map((totalRevenue, index) => ({
        year: dayjs().year(),
        month: index + 1,
        totalOrder: yearlyOrder[index],
        totalRevenue: totalRevenue,
      }));

      setStatistics(monthlyReport);

      const total = data.reduce((sum, stat) => {
        return sum + stat.totalRevenue;
      }, 0);
      // setStatistics(data);
      setYearRevenue(total);
    } catch (error) {}
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.SHIPPED:
        return "bg-green-100 text-green-600";
      case ORDER_STATUS.ACCEPTED:
        return "bg-blue-100 text-blue-600";
      case ORDER_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-600";
      case ORDER_STATUS.IN_DELIVERY:
        return "bg-orange-100 text-orange-600";
      case ORDER_STATUS.PROCESSING:
        return "bg-purple-100 text-purple-600";
      case ORDER_STATUS.CANCELLED_BY_EMPLOYEE:
        return "bg-red-100 text-red-600";
      case ORDER_STATUS.CANCELLED_BY_YOU:
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const currentBestSellerProducts = bestSellerProducts.slice(
    (currentPage - 1) * BEST_SELLER_PRODUCTS_PER_PAGE,
    currentPage * BEST_SELLER_PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    fetchOrders();
    fetchProduct();
    fetchUser();
    fetchBestSellerProducts();
    fetchStatistics();
    fetchYearStatistics();
  }, []);

  const chartData = statistics.map((stat) => ({
    date: `${stat.month}/${stat.year}`,
    revenue: stat.totalRevenue,
  }));

  // if (!permission || !permission.includes("DASHBOARD")) {
  //   setHasError(true);
  //   return (
  //     <Error
  //       errorCode={403}
  //       title={"Forbidden"}
  //       content={"Bạn không có quyền truy cập trang này."}
  //     />
  //   );
  // }

  return (
    <div className="p-10 w-full">
      <p className="font-extrabold text-xl">Dashboard</p>
      <div className="flex flex-row gap-x-5 mt-10">
        <DashboardCard
          title={"Tổng đơn hàng"}
          value={orders.length}
          description={"Số lượng đơn hàng đã đặt"}
          icon={
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 30H31.875M22.5 37.5H31.875M22.5 45H31.875M39.375 46.875H45C46.4918 46.875 47.9226 46.2824 48.9775 45.2275C50.0324 44.1726 50.625 42.7418 50.625 41.25V15.27C50.625 12.4325 48.5125 10.025 45.685 9.79C44.75 9.71246 43.8141 9.64579 42.8775 9.59M42.8775 9.59C43.0434 10.1277 43.1252 10.6873 43.125 11.25C43.125 11.7473 42.9275 12.2242 42.5758 12.5758C42.2242 12.9275 41.7473 13.125 41.25 13.125H30C28.965 13.125 28.125 12.285 28.125 11.25C28.125 10.6725 28.2125 10.115 28.375 9.59M42.8775 9.59C42.17 7.295 40.03 5.625 37.5 5.625H33.75C32.5481 5.62528 31.3779 6.01036 30.4107 6.72385C29.4434 7.43734 28.7301 8.44175 28.375 9.59M28.375 9.59C27.435 9.6475 26.5 9.715 25.565 9.79C22.7375 10.025 20.625 12.4325 20.625 15.27V20.625M20.625 20.625H12.1875C10.635 20.625 9.375 21.885 9.375 23.4375V51.5625C9.375 53.115 10.635 54.375 12.1875 54.375H36.5625C38.115 54.375 39.375 53.115 39.375 51.5625V23.4375C39.375 21.885 38.115 20.625 36.5625 20.625H20.625ZM16.875 30H16.895V30.02H16.875V30ZM16.875 37.5H16.895V37.52H16.875V37.5ZM16.875 45H16.895V45.02H16.875V45Z"
                stroke="#0A0A0A"
                stroke-width="3.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
        <DashboardCard
          title={"Tổng doanh thu"}
          value={`${formatToVND(totalRevenue)}`}
          description={"Doanh thu từ các đơn hàng thành công"}
          icon={
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.625 46.875C18.964 46.8641 32.245 48.6305 45.1175 52.1275C46.935 52.6225 48.75 51.2725 48.75 49.3875V46.875M9.375 11.25V13.125C9.375 13.6223 9.17746 14.0992 8.82583 14.4508C8.47419 14.8025 7.99728 15 7.5 15H5.625M5.625 15V14.0625C5.625 12.51 6.885 11.25 8.4375 11.25H50.625M5.625 15V37.5M50.625 11.25V13.125C50.625 14.16 51.465 15 52.5 15H54.375M50.625 11.25H51.5625C53.115 11.25 54.375 12.51 54.375 14.0625V38.4375C54.375 39.99 53.115 41.25 51.5625 41.25H50.625M5.625 37.5V38.4375C5.625 39.1834 5.92132 39.8988 6.44876 40.4262C6.97621 40.9537 7.69158 41.25 8.4375 41.25H9.375M5.625 37.5H7.5C7.99728 37.5 8.47419 37.6975 8.82583 38.0492C9.17746 38.4008 9.375 38.8777 9.375 39.375V41.25M50.625 41.25V39.375C50.625 38.8777 50.8225 38.4008 51.1742 38.0492C51.5258 37.6975 52.0027 37.5 52.5 37.5H54.375M50.625 41.25H9.375M37.5 26.25C37.5 28.2391 36.7098 30.1468 35.3033 31.5533C33.8968 32.9598 31.9891 33.75 30 33.75C28.0109 33.75 26.1032 32.9598 24.6967 31.5533C23.2902 30.1468 22.5 28.2391 22.5 26.25C22.5 24.2609 23.2902 22.3532 24.6967 20.9467C26.1032 19.5402 28.0109 18.75 30 18.75C31.9891 18.75 33.8968 19.5402 35.3033 20.9467C36.7098 22.3532 37.5 24.2609 37.5 26.25ZM45 26.25H45.02V26.27H45V26.25ZM15 26.25H15.02V26.27H15V26.25Z"
                stroke="#0A0A0A"
                stroke-width="3.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
        <DashboardCard
          title={"Tổng sản phẩm"}
          value={products.length}
          description={"Số lượng sản phẩm của cửa hàng"}
          icon={
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50.625 15.9375C50.625 21.6325 41.39 26.25 30 26.25C18.61 26.25 9.375 21.6325 9.375 15.9375M50.625 15.9375C50.625 10.2425 41.39 5.625 30 5.625C18.61 5.625 9.375 10.2425 9.375 15.9375M50.625 15.9375V44.0625C50.625 49.7575 41.39 54.375 30 54.375C18.61 54.375 9.375 49.7575 9.375 44.0625V15.9375M50.625 15.9375V25.3125M9.375 15.9375V25.3125M50.625 25.3125V34.6875C50.625 40.3825 41.39 45 30 45C18.61 45 9.375 40.3825 9.375 34.6875V25.3125M50.625 25.3125C50.625 31.0075 41.39 35.625 30 35.625C18.61 35.625 9.375 31.0075 9.375 25.3125"
                stroke="#0A0A0A"
                stroke-width="3.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
        <DashboardCard
          title={"Tổng người dùng"}
          value={users.length}
          description={"Số lượng người dùng của website"}
          icon={
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M37.4999 47.82C39.6324 48.4391 41.8419 48.7523 44.0624 48.75C47.6334 48.7552 51.158 47.9409 54.3649 46.37C54.4597 44.1293 53.8215 41.9187 52.5469 40.0733C51.2723 38.228 49.4309 36.8484 47.3017 36.1438C45.1725 35.4391 42.8717 35.4478 40.7478 36.1685C38.624 36.8892 36.7931 38.2826 35.5324 40.1375M37.4999 47.82V47.8125C37.4999 45.03 36.7849 42.4125 35.5324 40.1375M37.4999 47.82V48.085C32.6886 50.9827 27.1765 52.5095 21.5599 52.5C15.7324 52.5 10.2799 50.8875 5.62494 48.085L5.62244 47.8125C5.62052 44.2737 6.79647 40.8348 8.9649 38.0382C11.1333 35.2415 14.1709 33.2461 17.5987 32.3665C21.0264 31.4869 24.6495 31.7732 27.8966 33.1802C31.1437 34.5873 33.8302 37.035 35.5324 40.1375M29.9999 15.9375C29.9999 18.1753 29.111 20.3214 27.5287 21.9037C25.9463 23.4861 23.8002 24.375 21.5624 24.375C19.3247 24.375 17.1786 23.4861 15.5962 21.9037C14.0139 20.3214 13.1249 18.1753 13.1249 15.9375C13.1249 13.6997 14.0139 11.5536 15.5962 9.97129C17.1786 8.38895 19.3247 7.5 21.5624 7.5C23.8002 7.5 25.9463 8.38895 27.5287 9.97129C29.111 11.5536 29.9999 13.6997 29.9999 15.9375ZM50.6249 21.5625C50.6249 23.303 49.9335 24.9722 48.7028 26.2029C47.4721 27.4336 45.8029 28.125 44.0624 28.125C42.322 28.125 40.6528 27.4336 39.422 26.2029C38.1913 24.9722 37.4999 23.303 37.4999 21.5625C37.4999 19.822 38.1913 18.1528 39.422 16.9221C40.6528 15.6914 42.322 15 44.0624 15C45.8029 15 47.4721 15.6914 48.7028 16.9221C49.9335 18.1528 50.6249 19.822 50.6249 21.5625Z"
                stroke="#0A0A0A"
                stroke-width="3.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
      </div>
      <div className="flex flex-row mt-5 gap-x-5">
        <div className="flex-[2] p-6 bg-white rounded-lg shadow-md flex flex-col gap-y-2">
          <p className="font-bold mb-10">Doanh thu (năm nay)</p>
          <p className="text-2xl font-bold">{formatToVND(yearRevenue)}</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              className="font-semibold text-xs"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 p-6 bg-white rounded-lg shadow-md flex flex-col gap-y-2">
          <p className="font-bold">Sản phẩm bán chạy</p>
          <Table>
            <Table.Head className="normal-case text-sm">
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>Tên sản phẩm</Table.HeadCell>
              <Table.HeadCell>Đơn giá</Table.HeadCell>
              <Table.HeadCell>Số đã bán</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentBestSellerProducts.map((product) => (
                <Table.Row
                  key={product._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="min-w-32">
                    <img src={product.images[0].url} className="w-full" />
                  </Table.Cell>
                  <Table.Cell className="min-w-40">{product.name}</Table.Cell>
                  <Table.Cell>{formatToVND(product.price)}</Table.Cell>
                  <Table.Cell>
                    <p className="font-medium">{product.soldQuantity}</p>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(
              bestSellerProducts.length / BEST_SELLER_PRODUCTS_PER_PAGE
            )}
            onPageChange={setCurrentPage}
            svgClassName={"w-4 h-4"}
            textClassName={"text-sm px-3 py-2"}
          />
        </div>
      </div>
      <div className="flex-1 p-6 mt-5 bg-white rounded-lg shadow-md flex flex-col gap-y-2">
        <p className="font-bold">Đơn hàng gần đây</p>
        <Table hoverable>
          <Table.Head className="normal-case text-base">
            <Table.HeadCell>Mã đơn hàng</Table.HeadCell>
            <Table.HeadCell>Ngày tạo</Table.HeadCell>
            <Table.HeadCell>Tên khách hàng</Table.HeadCell>
            <Table.HeadCell>Trạng thái</Table.HeadCell>
            <Table.HeadCell>Tổng tiền</Table.HeadCell>
            <Table.HeadCell>Phương thức</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {latestOrders.map((order) => (
              <Table.Row
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                key={order._id}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {order._id}
                </Table.Cell>
                <Table.Cell>{formatDate(order.createdAt)}</Table.Cell>
                <Table.Cell>{order.user.fullName}</Table.Cell>
                <Table.Cell>
                  <div
                    className={`px-3 py-1 rounded-lg text-center font-semibold ${getStatusClass(
                      order.tracking.status
                    )}`}
                  >
                    {order.tracking.status}
                  </div>
                </Table.Cell>
                <Table.Cell>{formatToVND(order.finalPrice)}</Table.Cell>
                <Table.Cell>{order.paymentMethod}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
