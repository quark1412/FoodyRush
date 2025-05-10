import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Banner from "../../components/Banner";
import { FREE_SHIPPING, SHIPPING_RATE, TAX_RATE } from "../../utils/Constants";
import { getProductById } from "../../data/products";
import { formatDate, formatToVND, formatURL } from "../../utils/format";
import { getOrderById } from "../../data/orders";
import { getProductVariantById } from "../../data/productVariant";
import Error from "../Error";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import instance from "../../services/axiosConfig";
import toast from "react-hot-toast";
import { removeItem } from "../../stores/cart";
import { useDispatch } from "react-redux";
import axios from "axios";

function OrderCompleted() {
  const url = window.location.href;
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const orderId = queryParams.get("orderId")
    ? queryParams.get("orderId")
    : queryParams.get("apptransid").split("_")[1];
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState({});
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState(false);

  const { setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const checkStatusTransaction = async (orderId) => {
    try {
      const checkStatusResponse = await instance.post(
        "/order/checkStatusTransaction",
        {
          orderId: orderId,
        }
      );
    } catch (error) {
      toast.error(error.response.data.message, {
        duration: 2000,
      });
      return error;
    }
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (orderId) {
          if (location.state) {
            const { items } = location.state;
            items.forEach((item) => {
              dispatch(
                removeItem({
                  productId: item.productId,
                  size: item.size,
                })
              );
            });
          }

          const token = Cookies.get("token")
            ? JSON.parse(Cookies.get("token"))
            : null;

          let data;

          if (token) {
            const orderResponse = await axios.get(
              `http://localhost:8000/api/v1/order/${orderId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            Cookies.remove("token");

            data = orderResponse.data.data;
          } else {
            data = await getOrderById(orderId);
          }
          const order = data[0];

          if (!data) {
            setError(true);
            return;
          }

          const items = order.orderItems;
          const fetchedItems = await Promise.all(
            items.map(async (item) => {
              const productVariant = await getProductVariantById(
                item.productVariantId
              );
              const product = await getProductById(item.productId);
              const size = productVariant.size;

              if (!location.state) {
                dispatch(
                  removeItem({
                    productId: productVariant.productId,
                    size: productVariant.size,
                  })
                );
              }

              const images = product.images;
              return {
                ...item,
                product,
                size,
                images,
              };
            })
          );

          setExpectedDeliveryDate(order.expectedDeliveryDate);
          if (order.paymentMethod === "MOMO") {
            await checkStatusTransaction(orderId);
          }
          setPaymentMethod(order.paymentMethod);
          setOrderData({ ...order, fetchedItems });
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message, {
          duration: 2000,
        });
      }
    };

    fetchItemDetails();
  }, [orderId]);

  if (user && (!permission || !permission.includes("ORDER_COMPLETED"))) {
    setHasError(true);
    return (
      <Error
        errorCode={403}
        title={"Forbidden"}
        content={"Bạn không có quyền truy cập trang này."}
      />
    );
  }

  if (!orderId) {
    return <Error />;
  }

  return (
    <div className="mb-20">
      <Banner
        title={"Hoàn tất đơn hàng"}
        route={"Trang chủ / Thanh toán / Hoàn tất đơn hàng"}
      />
      <div className="px-40">
        {!error ? (
          <div className="flex flex-col py-20 justify-center gap-y-10 items-center">
            <div className="flex flex-col justify-center items-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="40" cy="40" r="40" fill="#0A0A0A" />
                <path
                  d="M56 28L34 50L24 40"
                  stroke="white"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p className="text-xl font-bold text-center mt-5">
                Đơn hàng của bạn đã hoàn tất!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Cảm ơn. Đơn hàng của bạn đã được gửi về chúng tôi!
              </p>
            </div>
            <table className="mb-4 w-8/12">
              <tr>
                <td colSpan={4}>
                  <div className="bg-[#0A0A0A] rounded-t-lg py-6 grid grid-cols-3 divide-x items-center">
                    <p className="text-base text-white text-center">
                      Mã đơn hàng: <br /> {orderId}
                    </p>
                    <p className="text-base text-white text-center">
                      Phương thức thanh toán <br />
                      {paymentMethod}
                    </p>
                    <p className="text-base text-white text-center">
                      Ngày giao hàng dự kiên: <br />
                      {formatDate(expectedDeliveryDate)}
                    </p>
                  </div>
                </td>
              </tr>
              <tbody className="space-y-4 border-b border-r border-l mb-4">
                <tr>
                  <td className="px-10 pt-4 font-medium">Chi tiết đơn hàng</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-10 pt-4">
                    <hr />
                  </td>
                </tr>
                <tr>
                  <td className="px-10 pt-4 font-medium">Sản phẩm</td>
                  <td className="font-medium pt-4">Đơn giá</td>
                  <td className="font-medium pt-4 text-center">Số lượng</td>
                  <td className="font-medium pt-4 pr-10 text-right">
                    Tổng đơn giá
                  </td>
                </tr>
                {orderData.fetchedItems &&
                  orderData.fetchedItems.map((item) => (
                    <tr key={item.product.productId}>
                      <td className="px-10 pt-4">
                        <div className="flex items-center">
                          <img
                            src={formatURL(item.images[0].url)}
                            alt={item.product.name}
                            className="w-16 h-16 mr-4"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="font-light">Kích cỡ: {item.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="pt-4">
                        {formatToVND(item.product.price)}
                      </td>
                      <td className="pt-4 text-center">{item.quantity}</td>
                      <td className="pt-4 px-10 text-right">
                        {formatToVND(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={4} className="px-10 pt-4">
                    <hr />
                  </td>
                </tr>
                <tr>
                  <td className="px-10 pt-4 font-medium" colSpan={4}>
                    <div className="flex justify-between">
                      <label>Phí vận chuyển</label>
                      <label>{formatToVND(orderData.shippingFee)}</label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-10 pt-4">
                    <hr />
                  </td>
                </tr>
                <tr>
                  <td className="px-10 py-4 font-medium" colSpan={4}>
                    <div className="flex justify-between">
                      <label>Tổng đơn hàng</label>
                      <label>{formatToVND(orderData.finalPrice)}</label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-[60px]"
            >
              <path
                fill-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                clip-rule="evenodd"
              />
            </svg>

            <p className="text-xl font-bold text-center mt-5">
              Đơn hàng không thành công!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Đã có lỗi trong quá trình đặt hàng. Vui lòng thử lại sau
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 text-white font-medium mt-10 bg-black rounded-lg"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderCompleted;
