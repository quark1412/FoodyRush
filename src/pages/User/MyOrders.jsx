import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Modal, Button } from "flowbite-react";

import AuthContext from "../../context/AuthContext";
import {
  ITEM_PER_PAGE,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../../utils/Constants";
import { getOrderByUserId, updateDeliveryInfoById } from "../../data/orders";
import { getOrderById } from "../../data/orders";
import { getOrderDetailsByOrderId } from "../../data/orderDetail";
import { getPaymentDetailById } from "../../data/paymentDetail";
import { getUserById } from "../../data/users";
import { getProductVariantById } from "../../data/productVariant";
import { getProductById } from "../../data/products";
import { getCategoryById } from "../../data/categories";
import { formatDate, formatToVND, formatURL } from "../../utils/format";
import { getAllImagesByProductId } from "../../data/productImages";
import {
  createOrderTracking,
  getOrderTrackingByOrderId,
} from "../../data/orderTracking";
import { createReview, getAllReviews, updateReview } from "../../data/reviews";
import toast from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Pagination from "../../components/Pagination";
import instance from "../../services/axiosConfig";

export default function MyOrders() {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [openAddReviewModal, setOpenAddReviewModal] = useState(false);
  const [openEditReviewModal, setOpenEditReviewModal] = useState(false);
  const [openCancelOrderModal, setOpenCancelOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [reviewHistory, setReviewHistory] = useState([]);
  const [review, setReview] = useState({
    productId: "",
    rating: 0,
    content: "",
    orderId: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasReview, setHasReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const orders = await getOrderByUserId(user.id);
      const fetchedOrders = await Promise.all(
        orders.map(async (order) => {
          const paymentDetails = {
            status: order.paymentStatus,
            paymentMethod: order.paymentMethod,
          };
          const details = order.orderItems;
          const trackingData = order.deliveryInfo;
          const tracking = trackingData.length
            ? trackingData[trackingData.length - 1]
            : {};

          const orderDetails = {
            ...order,
            paymentDetails,
            details,
            tracking,
          };

          const detailedItems = await Promise.all(
            orderDetails.details.map(async (item) => {
              const productVariant = await getProductVariantById(
                item.productVariantId
              );
              const product = await getProductById(productVariant.productId);
              const images = product.images;
              const size = productVariant.size;
              const category = product.categoryId;

              return {
                product: product,
                images: images,
                size: size,
                category: category,
                quantity: item.quantity,
              };
            })
          );
          return {
            ...orderDetails,
            detailedItems,
          };
        })
      );

      let filteredOrders =
        selectedStatus !== "All"
          ? fetchedOrders.filter((o) =>
              o.tracking.status
                .toLowerCase()
                .includes(selectedStatus.toLowerCase())
            )
          : fetchedOrders;

      setCurrentPage(1);

      setOrders(
        filteredOrders.filter(
          (order) =>
            !(
              order.paymentDetails.paymentMethod === "MOMO" &&
              order.paymentDetails.status === PAYMENT_STATUS.UNPAID
            )
        )
      );
      const reviews = await getAllReviews();
      setReviewHistory(reviews);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching order details:", error);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleAddReview = async () => {
    try {
      const response = await instance.post(
        "/review",
        {
          productId: review.productId,
          rating: review.rating,
          content: review.content,
          orderId: review.orderId,
        },
        { requiresAuth: true }
      );
      setOpenAddReviewModal(false);
      toast.success("Đánh giá của bạn đã được gửi thành công!", {
        duration: 2000,
      });
      await fetchOrders();
    } catch (error) {
      toast.error(error.response.data.message || "Gửi đánh giá thất bại", {
        duration: 2000,
      });
    }
  };

  const handleUpdateReview = async () => {
    try {
      await instance.put(
        `/review/${review.id}`,
        {
          rating: review.rating,
          content: review.content,
        },
        { requiresAuth: true }
      );

      setOpenEditReviewModal(false);
      toast.success("Chỉnh sửa đánh giá thành công", { duration: 2000 });
      await fetchOrders();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message || "Chỉnh sửa đánh giá thất bại",
        {
          duration: 2000,
        }
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.SHIPPED:
        return "bg-green-100 text-green-600 border border-green-500";
      case ORDER_STATUS.ACCEPTED:
        return "bg-blue-100 text-blue-600 border border-blue-500";
      case ORDER_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-600 border border-yellow-500";
      case ORDER_STATUS.IN_DELIVERY:
        return "bg-orange-100 text-orange-600 border border-orange-500";
      case ORDER_STATUS.PROCESSING:
        return "bg-purple-100 text-purple-600 border border-purple-500";
      case ORDER_STATUS.CANCELLED_BY_EMPLOYEE:
        return "bg-red-100 text-red-600 border border-red-500";
      case ORDER_STATUS.CANCELLED_BY_YOU:
        return "bg-red-100 text-red-600 border border-red-500";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-500";
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      await updateDeliveryInfoById(
        order._id,
        ORDER_STATUS.CANCELLED_BY_YOU,
        order.tracking.currentAddress || "Không xác định",
        undefined
      );
      toast.success("Hủy đơn hàng thành công", { duration: 2000 });
      fetchOrders();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, { duration: 2000 });
    }
  };

  const handleEditAddress = async (order) => {
    console.log(order);
    navigate(`/account/myOrders/editAddress/${order.userAddressId}`);
  };

  const currentOrders = orders.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  return (
    <>
      {!isLoading && (
        <div className="mb-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Số đơn hàng:{" "}
              {
                orders.filter(
                  (order) =>
                    !(
                      order.paymentDetails.paymentMethod === "MOMO" &&
                      order.paymentDetails.status === PAYMENT_STATUS.UNPAID
                    )
                ).length
              }
            </h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-fit h-fit font-medium text-sm px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a]"
              required
            >
              <option value={"All"}>Tất cả</option>
              {Object.values(ORDER_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {orders.length > 0 ? (
            <div className="font-semibold text-lg mb-3">
              Hiển thị {(currentPage - 1) * ITEM_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEM_PER_PAGE, orders.length)} của{" "}
              {orders.length} kết quả
            </div>
          ) : (
            <div className="font-semibold text-lg mb-3">
              Hiển thị 0 - 0 của 0 kết quả
            </div>
          )}
          <>
            {orders.length > 0 ? (
              currentOrders.map((order) => (
                <>
                  <table key={order._id} className="mb-5 w-full">
                    <tr className="bg-[#0A0A0A]">
                      <td className="py-2 px-4 text-white rounded-tl-lg w-[25%]">
                        Mã đơn hàng
                        <br />
                        {order._id}
                      </td>
                      <td className="p-2 text-white w-[20%]">
                        Phương thức
                        <br />
                        {order.paymentDetails.paymentMethod}
                      </td>
                      <td className="p-2 text-white w-[20%]">
                        Tổng đơn hàng
                        <br />
                        {formatToVND(order.finalPrice)}
                      </td>
                      <td className="py-2 px-4 text-white rounded-tr-lg w-[35%]">
                        {order.tracking.status === ORDER_STATUS.SHIPPED
                          ? "Ngày giao hàng"
                          : "Ngày giao hàng dự kiến"}
                        <br />
                        {order.tracking.status === ORDER_STATUS.SHIPPED
                          ? formatDate(order.tracking.deliveryDate)
                          : formatDate(order.expectedDeliveryDate)}
                      </td>
                    </tr>
                    <tbody className="border-l border-r border-b">
                      <tr className="space-y-4 border-b mb-4">
                        <td colSpan={4} className="p-2">
                          {order.detailedItems.map((item, index) => {
                            const existingReview = reviewHistory.find(
                              (review) =>
                                review.productId?.toString() ===
                                  item.product._id?.toString() &&
                                review.orderId?.toString() ===
                                  order._id?.toString()
                            );

                            return (
                              <div className="flex flex-row justify-between items-center">
                                <div
                                  key={item.product._id}
                                  className="px-4 py-2 flex items-center"
                                >
                                  <img
                                    src={item.images ? item.images[0]?.url : ""}
                                    alt={item.name}
                                    className="w-16 h-16 mr-4"
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {item.product.name}
                                    </p>
                                    <p className="font-light">
                                      Kích cỡ: {item.size} | Số lượng:{" "}
                                      {order.details[index].quantity}
                                    </p>
                                  </div>
                                </div>
                                {order.tracking.status ===
                                  ORDER_STATUS.SHIPPED && (
                                  <button
                                    className="bg-black h-fit text-white px-4 py-2 rounded-md"
                                    onClick={() => {
                                      if (!existingReview) {
                                        setReview({
                                          productId: item.product._id,
                                          orderId: order._id,
                                          rating: 0,
                                          content: "",
                                        });
                                        setOpenAddReviewModal(true);
                                      } else {
                                        setReview({
                                          id: existingReview._id,
                                          productId: existingReview.productId,
                                          orderId: existingReview.orderId,
                                          rating: existingReview.rating,
                                          content: existingReview.content,
                                        });
                                        setOpenEditReviewModal(true);
                                      }
                                    }}
                                  >
                                    {!existingReview
                                      ? "Thêm đánh giá"
                                      : "Chỉnh sửa đánh giá"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      </tr>

                      <tr className="font-medium">
                        <td colSpan={4} className="p-2">
                          <div className="p-2 flex items-center gap-x-2">
                            Trạng thái đơn hàng:{" "}
                            <p
                              className={`inline-block px-4 py-2 rounded ${getStatusClass(
                                order.tracking.status
                              )}`}
                            >
                              {order.tracking.status}
                            </p>
                          </div>
                        </td>
                      </tr>

                      {order.tracking.status !== ORDER_STATUS.SHIPPED &&
                        order.tracking.status !==
                          ORDER_STATUS.CANCELLED_BY_EMPLOYEE &&
                        order.tracking.status !==
                          ORDER_STATUS.CANCELLED_BY_YOU && (
                          <tr>
                            <td className="px-4 pb-4 pt-2" colSpan={4}>
                              <div className="flex gap-x-2">
                                <Link
                                  to={`/trackOrder/${order._id}`}
                                  className="bg-[#a93f15] text-white px-4 py-2 rounded-md"
                                >
                                  Theo dõi đơn hàng
                                </Link>
                                {order.tracking.status ===
                                  ORDER_STATUS.PENDING && (
                                  <button
                                    className="bg-[#a93f15] text-white px-4 py-2 rounded-md"
                                    onClick={() => handleEditAddress(order)}
                                  >
                                    Chỉnh sửa thông tin giao hàng
                                  </button>
                                )}
                                {order.tracking.status ===
                                  ORDER_STATUS.PENDING && (
                                  <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOpenCancelOrderModal(true);
                                    }}
                                  >
                                    Hủy đơn hàng
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </>
              ))
            ) : (
              <p>Không tìm thấy đơn hàng.</p>
            )}
            <div className="flex justify-center items-center mt-5">
              {currentOrders.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(orders.length / ITEM_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  svgClassName={"w-6 h-6"}
                  textClassName={"text-lg px-4 py-2"}
                />
              )}
            </div>
          </>
        </div>
      )}
      <Modal
        show={openAddReviewModal}
        size="lg"
        onClose={() => {
          setOpenAddReviewModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Thêm đánh giá
            </h3>
            <div className="flex flex-row gap-x-4 items-center">
              <p className="font-manrope font-semibold text-sm">
                Số sao <b className="text-[#EF0606]">*</b>
              </p>
              <div className="flex flex-row gap-x-1">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    width="24"
                    height="24"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onMouseEnter={() => setHoveredRating(index + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setReview({ ...review, rating: index + 1 })}
                  >
                    <path
                      d="M20.0001 28.7833L26.9168 32.9667C28.1835 33.7333 29.7335 32.6 29.4001 31.1666L27.5668 23.3L33.6835 18C34.8001 17.0333 34.2001 15.2 32.7335 15.0833L24.6835 14.4L21.5335 6.96665C20.9668 5.61665 19.0335 5.61665 18.4668 6.96665L15.3168 14.3833L7.26679 15.0666C5.80012 15.1833 5.20012 17.0166 6.31679 17.9833L12.4335 23.2833L10.6001 31.15C10.2668 32.5833 11.8168 33.7167 13.0835 32.95L20.0001 28.7833Z"
                      fill={
                        index < (hoveredRating || review.rating)
                          ? "#FFE066"
                          : "#DCDCDC"
                      }
                      className="cursor-pointer"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">
                Bình luận <b className="text-[#EF0606]">*</b>
              </p>
              <textarea
                value={review.content}
                rows={5}
                className="w-full resize-none font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) =>
                  setReview({ ...review, content: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="px-6 py-2 rounded bg-[#0A0A0A] text-white font-extrabold mt-6 font-manrope"
              onClick={handleAddReview}
            >
              Đánh giá
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openEditReviewModal}
        size="lg"
        onClose={() => {
          setOpenEditReviewModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Chỉnh sửa đánh giá
            </h3>
            <div className="flex flex-row gap-x-4 items-center">
              <p className="font-manrope font-semibold text-sm">
                Số sao <b className="text-[#EF0606]">*</b>
              </p>
              <div className="flex flex-row gap-x-1">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    width="24"
                    height="24"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onMouseEnter={() => setHoveredRating(index + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setReview({ ...review, rating: index + 1 })}
                  >
                    <path
                      d="M20.0001 28.7833L26.9168 32.9667C28.1835 33.7333 29.7335 32.6 29.4001 31.1666L27.5668 23.3L33.6835 18C34.8001 17.0333 34.2001 15.2 32.7335 15.0833L24.6835 14.4L21.5335 6.96665C20.9668 5.61665 19.0335 5.61665 18.4668 6.96665L15.3168 14.3833L7.26679 15.0666C5.80012 15.1833 5.20012 17.0166 6.31679 17.9833L12.4335 23.2833L10.6001 31.15C10.2668 32.5833 11.8168 33.7167 13.0835 32.95L20.0001 28.7833Z"
                      fill={
                        index < (hoveredRating || review.rating)
                          ? "#FFE066"
                          : "#DCDCDC"
                      }
                      className="cursor-pointer"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">
                Bình luận <b className="text-[#EF0606]">*</b>
              </p>
              <textarea
                value={review.content}
                rows={5}
                className="w-full resize-none font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) =>
                  setReview({ ...review, content: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="px-6 py-2 rounded bg-[#0A0A0A] text-white font-extrabold mt-6 font-manrope"
              onClick={handleUpdateReview}
            >
              {"Lưu thay đổi"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openCancelOrderModal}
        size="md"
        onClose={() => setOpenCancelOrderModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bạn có chắc chắn muốn hủy đơn hàng không?
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button
                color="gray"
                onClick={() => setOpenCancelOrderModal(false)}
              >
                Không
              </Button>
              <Button
                color="failure"
                onClick={() => {
                  handleCancelOrder(selectedOrder);
                  setOpenCancelOrderModal(false);
                }}
              >
                <p className="text-white">Hủy đơn</p>
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
