import { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import Banner from "../../components/Banner";
import { ORDER_STATUS } from "../../utils/Constants";
import OrderStatus from "../../components/OrderStatus";
import { formatDate, formatURL, getTime } from "../../utils/format";
import { getOrderById } from "../../data/orders";
import { getOrderDetailsByOrderId } from "../../data/orderDetail";
import { getPaymentDetailById } from "../../data/paymentDetail";
import { getProductVariantById } from "../../data/productVariant";
import { getProductById } from "../../data/products";
import { getCategoryById } from "../../data/categories";
import { getAllImagesByProductId } from "../../data/productImages";
import { getOrderTrackingByOrderId } from "../../data/orderTracking";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import Error from "../Error";

const status = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.6673 2.66699H8.00065C7.29341 2.66699 6.61513 2.94794 6.11503 3.44804C5.61494 3.94814 5.33398 4.62641 5.33398 5.33366V26.667C5.33398 27.3742 5.61494 28.0525 6.11503 28.5526C6.61513 29.0527 7.29341 29.3337 8.00065 29.3337H24.0006C24.7079 29.3337 25.3862 29.0527 25.8863 28.5526C26.3864 28.0525 26.6673 27.3742 26.6673 26.667V10.667L18.6673 2.66699Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.666 2.66699V10.667H26.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.3327 17.333H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.3327 22.667H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3327 12H11.9993H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.PENDING,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.333 5.33301H23.9997C24.7069 5.33301 25.3852 5.61396 25.8853 6.11406C26.3854 6.61415 26.6663 7.29243 26.6663 7.99967V26.6663C26.6663 27.3736 26.3854 28.0519 25.8853 28.552C25.3852 29.0521 24.7069 29.333 23.9997 29.333H7.99967C7.29243 29.333 6.61415 29.0521 6.11406 28.552C5.61396 28.0519 5.33301 27.3736 5.33301 26.6663V7.99967C5.33301 7.29243 5.61396 6.61415 6.11406 6.11406C6.61415 5.61396 7.29243 5.33301 7.99967 5.33301H10.6663"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.0003 2.66699H12.0003C11.2639 2.66699 10.667 3.26395 10.667 4.00033V6.66699C10.667 7.40337 11.2639 8.00033 12.0003 8.00033H20.0003C20.7367 8.00033 21.3337 7.40337 21.3337 6.66699V4.00033C21.3337 3.26395 20.7367 2.66699 20.0003 2.66699Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 16L14.5 21.5L12 19"
          stroke="#0A0A0A"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.ACCEPTED,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28.2809 21.1868C27.4326 23.1927 26.1059 24.9604 24.4167 26.3352C22.7275 27.71 20.7272 28.65 18.5908 29.0731C16.4543 29.4963 14.2468 29.3896 12.1611 28.7625C10.0754 28.1354 8.17503 27.0069 6.62622 25.4756C5.07741 23.9444 3.92728 22.0571 3.27638 19.9787C2.62547 17.9003 2.49361 15.6941 2.89233 13.5529C3.29104 11.4118 4.20819 9.40094 5.56359 7.69614C6.91899 5.99135 8.67137 4.64453 10.6675 3.77344"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M29.3333 16.0003C29.3333 14.2494 28.9885 12.5156 28.3184 10.8979C27.6483 9.2802 26.6662 7.81035 25.4281 6.57223C24.19 5.33412 22.7201 4.35199 21.1024 3.68193C19.4848 3.01187 17.751 2.66699 16 2.66699V16.0003H29.3333Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.PROCESSING,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.333 4H1.33301V21.3333H21.333V4Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.333 10.667H26.6663L30.6663 14.667V21.3337H21.333V10.667Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.33333 27.9997C9.17428 27.9997 10.6667 26.5073 10.6667 24.6663C10.6667 22.8254 9.17428 21.333 7.33333 21.333C5.49238 21.333 4 22.8254 4 24.6663C4 26.5073 5.49238 27.9997 7.33333 27.9997Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M24.6663 27.9997C26.5073 27.9997 27.9997 26.5073 27.9997 24.6663C27.9997 22.8254 26.5073 21.333 24.6663 21.333C22.8254 21.333 21.333 22.8254 21.333 24.6663C21.333 26.5073 22.8254 27.9997 24.6663 27.9997Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.IN_DELIVERY,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 12.5333L10 5.61328"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M28 21.3329V10.6662C27.9995 10.1986 27.8761 9.73929 27.6421 9.33443C27.408 8.92956 27.0717 8.59336 26.6667 8.35954L17.3333 3.02621C16.9279 2.79216 16.4681 2.66895 16 2.66895C15.5319 2.66895 15.0721 2.79216 14.6667 3.02621L5.33333 8.35954C4.92835 8.59336 4.59197 8.92956 4.35795 9.33443C4.12392 9.73929 4.00048 10.1986 4 10.6662V21.3329C4.00048 21.8005 4.12392 22.2598 4.35795 22.6647C4.59197 23.0695 4.92835 23.4057 5.33333 23.6395L14.6667 28.9729C15.0721 29.2069 15.5319 29.3301 16 29.3301C16.4681 29.3301 16.9279 29.2069 17.3333 28.9729L26.6667 23.6395C27.0717 23.4057 27.408 23.0695 27.6421 22.6647C27.8761 22.2598 27.9995 21.8005 28 21.3329Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4.35938 9.28027L15.9994 16.0136L27.6394 9.28027"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16 29.44V16"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.SHIPPED,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M56.35 52.8L51.025 47.5L56.35 42.2L52.8 38.65L47.5 43.975L42.2 38.65L38.65 42.2L43.975 47.5L38.65 52.8L42.2 56.35L47.5 51.025L52.8 56.35M15 5C13.6739 5 12.4021 5.52678 11.4645 6.46447C10.5268 7.40215 10 8.67392 10 10V50C10 52.775 12.225 55 15 55H34.525C33.625 53.45 33 51.75 32.7 50H15V10H32.5V22.5H45V32.7C45.825 32.575 46.675 32.5 47.5 32.5C48.35 32.5 49.175 32.575 50 32.7V20L35 5M20 30V35H40V30M20 40V45H32.5V40H20Z"
          fill="black"
        />
      </svg>
    ),
    status: ORDER_STATUS.CANCELLED_BY_EMPLOYEE,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M56.35 52.8L51.025 47.5L56.35 42.2L52.8 38.65L47.5 43.975L42.2 38.65L38.65 42.2L43.975 47.5L38.65 52.8L42.2 56.35L47.5 51.025L52.8 56.35M15 5C13.6739 5 12.4021 5.52678 11.4645 6.46447C10.5268 7.40215 10 8.67392 10 10V50C10 52.775 12.225 55 15 55H34.525C33.625 53.45 33 51.75 32.7 50H15V10H32.5V22.5H45V32.7C45.825 32.575 46.675 32.5 47.5 32.5C48.35 32.5 49.175 32.575 50 32.7V20L35 5M20 30V35H40V30M20 40V45H32.5V40H20Z"
          fill="black"
        />
      </svg>
    ),
    status: ORDER_STATUS.CANCELLED_BY_YOU,
  },
];

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const [tracking, setTracking] = useState([]);
  const location = useLocation();
  const data = location.state ?? null;

  const getStatusObjectByStatus = (statusValue) => {
    return status.find((item) => item.status === statusValue);
  };

  const fetchOrder = async () => {
    try {
      let orderDetails;
      if (data) {
        const { trackingData, orderDetail } = data;
        const _id = trackingData[0].orderId;
        const details = orderDetail;
        const tracking = trackingData;
        orderDetails = {
          _id,
          details,
        };
        setTracking(trackingData);
      } else {
        const fetchedOrder = await getOrderById(id);
        const details = fetchedOrder[0].orderItems;
        const trackingData = fetchedOrder[0].deliveryInfo;
        orderDetails = {
          ...fetchedOrder[0],
          details,
        };
        setTracking(trackingData);
      }

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
      setOrder({
        ...orderDetails,
        detailedItems,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (user && (!permission || !permission.includes("TRACK_ORDER"))) {
    setHasError(true);
    return (
      <Error
        errorCode={403}
        title={"Forbidden"}
        content={"Bạn không có quyền truy cập trang này."}
      />
    );
  }

  console.log(order);

  return (
    <div className="mb-20">
      <Banner title="Theo dõi đơn hàng" route="Trang chủ / Theo dõi đơn hàng" />
      {order && (
        <div className="px-80 flex w-full">
          <div className="flex flex-col mt-10 w-full">
            <p className="text-2xl font-medium">Trạng thái đơn hàng</p>
            <p className="mt-1">Mã đơn hàng: {order._id}</p>
            <div className="border rounded-lg px-10 py-5 mt-6 flex flex-nowrap overflow-x-scroll w-full thin-scrollbar">
              {tracking.map((item, index) => (
                <OrderStatus
                  key={item._id}
                  icon={getStatusObjectByStatus(item.status).icon}
                  status={item.status}
                  index={index}
                  orderStatus={tracking[tracking.length - 1].status}
                  date={formatDate(item.deliveryDate)}
                  time={getTime(item.deliveryDate)}
                  address={item.deliveryAddress}
                  isEnd={item === tracking[tracking.length - 1]}
                />
              ))}
            </div>
            <div className="border rounded-lg px-10 py-5 mt-6 flex">
              <div key={order._id} className="mb-5 w-full">
                <p className="mb-3">Sản phẩm</p>
                <div className="space-y-4">
                  {order.detailedItems.map((item, index) => (
                    <div
                      key={item.product._id}
                      className="flex flex-row justify-between items-center"
                    >
                      <div className="flex flex-col w-full">
                        <hr />
                        <div className="py-3 flex items-center">
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="w-16 h-16 mr-4"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="font-light">
                              Kích cỡ: {item.size} | Số lượng:{" "}
                              {order.details[index].quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
