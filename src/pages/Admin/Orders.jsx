import { useState, useEffect, useContext } from "react";
import { Table, Modal } from "flowbite-react";

import Search from "../../components/Search";

import toast from "react-hot-toast";
import { getAllOrders } from "../../data/orders";
import { getOrderDetailsByOrderId } from "../../data/orderDetail";
import { Link } from "react-router-dom";
import { getPaymentDetailById } from "../../data/paymentDetail";
import {
  ITEM_PER_PAGE,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../../utils/Constants";
import { getUserById } from "../../data/users";
import { getOrderTrackingByOrderId } from "../../data/orderTracking";
import { formatToVND } from "../../utils/format";
import Pagination from "../../components/Pagination";
import AuthContext from "../../context/AuthContext";
import Error from "../Error";
import Cookies from "js-cookie";

export default function Orders() {
  const { setHasError, auth } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const [orderWithDetails, setOrdersWithDetails] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return "bg-green-100 text-green-600";
      case PAYMENT_STATUS.REFUNDED:
        return "bg-orange-100 text-orange-600";
      case PAYMENT_STATUS.UNPAID:
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  async function fetchOrders() {
    try {
      const fetchedOrders = await getAllOrders();
      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const user = order.userInfo;
          const paymentDetails = {
            status: order.paymentStatus,
            paymentMethod: order.paymentMethod,
          };
          const trackingData = order.deliveryInfo;
          const tracking = trackingData.length
            ? trackingData[trackingData.length - 1]
            : {};

          return {
            ...order,
            user,
            paymentDetails,
            tracking,
          };
        })
      );

      let filteredOrders =
        searchTerm !== ""
          ? ordersWithDetails.filter((order) =>
              order.user?.fullName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          : ordersWithDetails;

      filteredOrders =
        selectedStatus !== "All"
          ? filteredOrders.filter((o) =>
              o.tracking.status
                .toLowerCase()
                .includes(selectedStatus.toLowerCase())
            )
          : filteredOrders;

      filteredOrders =
        selectedMethod !== "All"
          ? filteredOrders.filter((o) =>
              o.paymentDetails.paymentMethod
                .toLowerCase()
                .includes(selectedMethod.toLowerCase())
            )
          : filteredOrders;

      filteredOrders =
        selectedPaymentStatus !== "All"
          ? filteredOrders.filter((o) =>
              o.paymentDetails.status
                .toLowerCase()
                .includes(selectedPaymentStatus.toLowerCase())
            )
          : filteredOrders;

      setCurrentPage(1);

      setOrdersWithDetails(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  const currentOrders = orderWithDetails.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, selectedMethod, selectedPaymentStatus, selectedStatus]);

  if (!permission || !permission.includes("ORDERS")) {
    setHasError(true);
    return (
      <Error
        errorCode={403}
        title={"Forbidden"}
        content={"Bạn không có quyền truy cập trang này."}
      />
    );
  }

  return (
    <>
      <div className="p-10 w-full">
        <p className="font-extrabold text-xl">Đơn hàng</p>
        <div className="bg-white rounded-lg mt-10 p-6 shadow-md flex flex-col">
          <div className="overflow-x-auto">
            <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center gap-x-3 pb-4">
              <Search
                placeholder={"Tên khách hàng..."}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
                required
              >
                <option value={"All"}>Tất cả</option>
                {Object.values(ORDER_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status === ORDER_STATUS.CANCELLED_BY_YOU
                      ? "Đã hủy bởi khách hàng"
                      : status}
                  </option>
                ))}
              </select>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
                required
              >
                <option value={"All"}>Tất cả</option>
                <option value={"MOMO"}>MOMO</option>
                <option value={"COD"}>COD</option>
              </select>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
                required
              >
                <option value={"All"}>Tất cả</option>
                {Object.values(PAYMENT_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <Table hoverable>
              <Table.Head className="normal-case text-base">
                <Table.HeadCell>Mã đơn hàng</Table.HeadCell>
                <Table.HeadCell>Tên khách hàng</Table.HeadCell>
                <Table.HeadCell>Trạng thái</Table.HeadCell>
                <Table.HeadCell>Tổng tiền</Table.HeadCell>
                <Table.HeadCell>Phương thức</Table.HeadCell>
                <Table.HeadCell>Trạng thái thanh toán</Table.HeadCell>
                <Table.HeadCell>Thao tác</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentOrders.map((order) => (
                  <Table.Row
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    key={order._id}
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white max-w-40 truncate overflow-hidden text-ellipsis">
                      {order._id}
                    </Table.Cell>
                    <Table.Cell>{order?.user?.fullName}</Table.Cell>
                    <Table.Cell>
                      <div
                        className={`px-3 py-1 rounded-lg text-center font-semibold ${getStatusClass(
                          order?.tracking?.status
                        )}`}
                      >
                        {order?.tracking?.status ===
                        ORDER_STATUS.CANCELLED_BY_YOU
                          ? "Đã hủy bởi khách hàng"
                          : order?.tracking?.status}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{formatToVND(order?.finalPrice)}</Table.Cell>
                    <Table.Cell className="w-20">
                      {order?.paymentDetails?.paymentMethod}
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        className={`px-3 py-1 rounded-lg text-center font-semibold ${getPaymentStatusClass(
                          order?.paymentDetails?.status
                        )}`}
                      >
                        {order?.paymentDetails?.status}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-row gap-x-3 items-center">
                        <Link
                          to={`/admin/orders/details/${order._id}`}
                          className="font-medium hover:underline"
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="size-5"
                            >
                              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                              <path
                                fill-rule="evenodd"
                                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            <p className="text-[#0A0A0A]">Xem</p>
                          </div>
                        </Link>
                        <Link
                          to={`/admin/orders/update/${order._id}`}
                          className="font-medium hover:underline"
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.4873 1.5127C14.1591 1.18458 13.7141 1.00024 13.25 1.00024C12.7859 1.00024 12.3408 1.18458 12.0127 1.5127L11.2413 2.28404L13.716 4.7587L14.4873 3.98737C14.8154 3.65919 14.9998 3.21412 14.9998 2.75004C14.9998 2.28596 14.8154 1.84088 14.4873 1.5127ZM13.0087 5.46604L10.534 2.99137L4.93399 8.59137C4.52255 9.0026 4.2201 9.50989 4.05399 10.0674L3.52065 11.8574C3.4949 11.9437 3.49298 12.0355 3.5151 12.1229C3.53721 12.2102 3.58253 12.29 3.64626 12.3538C3.71 12.4175 3.78978 12.4628 3.87716 12.4849C3.96454 12.507 4.05627 12.5051 4.14265 12.4794L5.93265 11.946C6.49014 11.7799 6.99743 11.4775 7.40865 11.066L13.0087 5.46604Z"
                                fill="#475BE8"
                              />
                              <path
                                d="M3.5 3.5C2.96957 3.5 2.46086 3.71071 2.08579 4.08579C1.71071 4.46086 1.5 4.96957 1.5 5.5V12.5C1.5 13.0304 1.71071 13.5391 2.08579 13.9142C2.46086 14.2893 2.96957 14.5 3.5 14.5H10.5C11.0304 14.5 11.5391 14.2893 11.9142 13.9142C12.2893 13.5391 12.5 13.0304 12.5 12.5V9C12.5 8.86739 12.4473 8.74022 12.3536 8.64645C12.2598 8.55268 12.1326 8.5 12 8.5C11.8674 8.5 11.7402 8.55268 11.6464 8.64645C11.5527 8.74022 11.5 8.86739 11.5 9V12.5C11.5 12.7652 11.3946 13.0196 11.2071 13.2071C11.0196 13.3946 10.7652 13.5 10.5 13.5H3.5C3.23478 13.5 2.98043 13.3946 2.79289 13.2071C2.60536 13.0196 2.5 12.7652 2.5 12.5V5.5C2.5 5.23478 2.60536 4.98043 2.79289 4.79289C2.98043 4.60536 3.23478 4.5 3.5 4.5H7C7.13261 4.5 7.25979 4.44732 7.35355 4.35355C7.44732 4.25979 7.5 4.13261 7.5 4C7.5 3.86739 7.44732 3.74021 7.35355 3.64645C7.25979 3.55268 7.13261 3.5 7 3.5H3.5Z"
                                fill="#475BE8"
                              />
                            </svg>
                            <p className="text-blue-600">Cập nhật</p>
                          </div>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-5">
            {orderWithDetails.length > 0 ? (
              <div className="font-semibold text-sm">
                Hiển thị {(currentPage - 1) * ITEM_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEM_PER_PAGE, orderWithDetails.length)}{" "}
                của {orderWithDetails.length} kết quả
              </div>
            ) : (
              <div className="font-semibold text-sm">
                Hiển thị 0 - 0 của 0 kết quả
              </div>
            )}
            {currentOrders.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(orderWithDetails.length / ITEM_PER_PAGE)}
                onPageChange={setCurrentPage}
                svgClassName={"w-5 h-5"}
                textClassName={"text-sm px-3 py-2"}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
