import { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button } from "flowbite-react";

import AuthContext from "../../context/AuthContext.js";
import { removeItem, clearCart, mergeCart } from "../../stores/cart.js";
import { FREE_SHIPPING, SHIPPING_RATE } from "../../utils/Constants.js";

import CartItem from "../../components/CartItem.jsx";
import Banner from "../../components/Banner.jsx";
import CheckBox from "../../components/CheckBox.jsx";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { getProductById } from "../../data/products.js";
import { formatToVND } from "../../utils/format.js";
import Error from "../Error.jsx";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function ShoppingCart() {
  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const carts = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState({});
  const [type, setType] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [subTotal, setSubTotal] = useState(0);

  const selectedCartItems = carts.filter(
    (product) =>
      selectedItems[`${product.productId}-${product.color}-${product.size}`]
  );

  const totalItems = selectedCartItems.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  useEffect(() => {
    const calculateOrderSummary = async () => {
      const data = await Promise.all(
        selectedCartItems.map(async (cart) => {
          const product = await getProductById(cart.productId);
          return cart.quantity * product.price;
        })
      );
      setSubTotal(data.reduce((acc, curr) => acc + curr, 0));
    };

    calculateOrderSummary();
  }, [selectedCartItems]);

  const shipping = useMemo(
    () =>
      subTotal > FREE_SHIPPING || subTotal === 0 ? 0 : subTotal * SHIPPING_RATE,
    [subTotal]
  );
  const totalPrice = useMemo(() => subTotal + shipping, [subTotal, shipping]);

  const handleCheckboxChange = (productId, color, size) => {
    const key = `${productId}-${color}-${size}`;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRemoveItem = (productId, color, size) => {
    dispatch(removeItem({ productId, color, size }));
  };

  const handleRemoveSelectedItems = () => {
    Object.keys(selectedItems).forEach((key) => {
      const [productId, color, size] = key.split("-");
      if (selectedItems[key]) {
        dispatch(removeItem({ productId, color, size }));
      }
    });
    toast.success("Sản phẩm đã được xóa khỏi giỏ hàng!", { duration: 2000 });
    setSelectedItems({});
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setSelectedItems({});
  };

  const handleConfirmation = (type) => {
    if (type === "clear") {
      handleClearCart();
    } else if (type === "remove") {
      handleRemoveSelectedItems();
    }
  };

  const orderSummary = {
    items: selectedCartItems,
    totalItems,
    subTotal,
    shipping,
    totalPrice,
  };

  const handleCheckout = () => {
    if (selectedCartItems.length > 0) {
      // if (!auth.isAuth) {
      //   navigate("/login", { state: { orderSummary } });
      // } else {
      navigate("/checkout", { state: { orderSummary } });
      // }
    }
  };

  if (user && (!permission || !permission.includes("PRODUCT_DETAILS"))) {
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
      <div className="mb-20">
        <Banner title={"Giỏ hàng"} route={"Trang chủ / Giỏ hàng"} />
        <div className="flex flex-row gap-x-20 px-40 py-20">
          {/* Product List */}
          <div className="h-fit w-[800px]">
            <table className="border-collapse overflow-hidden w-full">
              <thead>
                <tr className="bg-[#0A0A0A] text-white rounded-lg">
                  <td className="rounded-tl-lg">&nbsp;</td>
                  <td className="">&nbsp;</td>
                  <td className="py-4 font-medium text-left text-white">
                    Sản phẩm
                  </td>
                  <td className="px-2 py-4 font-medium text-left text-white">
                    Đơn giá
                  </td>
                  <td className="px-2 py-4 font-medium text-left text-white">
                    Số lượng
                  </td>
                  <td className="px-2 py-4 font-medium text-left text-white rounded-tr-lg">
                    Tổng đơn giá
                  </td>
                </tr>
              </thead>
              <tbody>
                {carts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="text-center w-full flex flex-row justify-center gap-x-5 items-center mt-5">
                        <p className="text-xl font-medium">
                          Không có sản phẩm trong giỏ hàng.
                        </p>
                        <Link
                          to="/products"
                          className="px-8 py-3 text-white font-medium bg-[#0A0A0A] rounded-lg"
                        >
                          Đi đến Cửa hàng
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  carts.map((product) => (
                    <tr className="border-b border-[#818181]" key={product.id}>
                      <td align="center" className="w-8">
                        <CheckBox
                          isChecked={
                            !!selectedItems[
                              `${product.productId}-${product.color}-${product.size}`
                            ]
                          }
                          onChange={() =>
                            handleCheckboxChange(
                              product.productId,
                              product.color,
                              product.size
                            )
                          }
                        />
                      </td>
                      <td align="center" className="w-8 pr-1">
                        <button
                          onClick={() => {
                            handleRemoveItem(
                              product.productId,
                              product.color,
                              product.size
                            );
                          }}
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14.0841 12L18.3841 7.71C18.5724 7.5217 18.6782 7.2663 18.6782 7C18.6782 6.7337 18.5724 6.47831 18.3841 6.29C18.1958 6.1017 17.9404 5.99591 17.6741 5.99591C17.4078 5.99591 17.1524 6.1017 16.9641 6.29L12.6741 10.59L8.3841 6.29C8.1958 6.1017 7.9404 5.99591 7.6741 5.99591C7.4078 5.99591 7.15241 6.1017 6.9641 6.29C6.7758 6.47831 6.67001 6.7337 6.67001 7C6.67001 7.2663 6.7758 7.5217 6.9641 7.71L11.2641 12L6.9641 16.29C6.87037 16.383 6.79598 16.4936 6.74521 16.6154C6.69444 16.7373 6.6683 16.868 6.6683 17C6.6683 17.132 6.69444 17.2627 6.74521 17.3846C6.79598 17.5064 6.87037 17.617 6.9641 17.71C7.05707 17.8037 7.16767 17.8781 7.28953 17.9289C7.41139 17.9797 7.54209 18.0058 7.6741 18.0058C7.80611 18.0058 7.93682 17.9797 8.05868 17.9289C8.18054 17.8781 8.29114 17.8037 8.3841 17.71L12.6741 13.41L16.9641 17.71C17.0571 17.8037 17.1677 17.8781 17.2895 17.9289C17.4114 17.9797 17.5421 18.0058 17.6741 18.0058C17.8061 18.0058 17.9368 17.9797 18.0587 17.9289C18.1805 17.8781 18.2911 17.8037 18.3841 17.71C18.4778 17.617 18.5522 17.5064 18.603 17.3846C18.6538 17.2627 18.6799 17.132 18.6799 17C18.6799 16.868 18.6538 16.7373 18.603 16.6154C18.5522 16.4936 18.4778 16.383 18.3841 16.29L14.0841 12Z"
                              fill="#0A0A0A"
                            />
                          </svg>
                        </button>
                      </td>
                      <CartItem data={product} />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {carts.length !== 0 && (
              <div className="flex justify-end mt-10 gap-x-5">
                <button
                  className="px-8 py-3 text-white font-medium bg-red-700 rounded-lg disabled:bg-[#C81E1E]/50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setType("remove");
                    setOpenModal(true);
                  }}
                  disabled={selectedCartItems.length === 0}
                >
                  Xóa sản phẩm đã chọn
                </button>
                <button
                  className="px-10 py-3 text-white font-medium bg-red-700 rounded-lg"
                  onClick={() => {
                    setType("clear");
                    setOpenModal(true);
                  }}
                >
                  Xóa giỏ hàng
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex-1 border border-[#818181] rounded-lg p-5 flex flex-col gap-y-4 h-fit">
            <p className="font-bold text-xl">Tóm tắt đơn hàng</p>
            <hr className="border-[#818181]" />
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-row justify-between">
                <p className="text-[#4A4A4A]">Số lượng</p>
                <p className="font-semibold">{totalItems}</p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-[#4A4A4A]">Tổng</p>
                <p className="font-semibold">{formatToVND(subTotal)}</p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-[#4A4A4A]">Phí vận chuyển</p>
                <p className="font-semibold">{formatToVND(shipping)}</p>
              </div>
            </div>
            <hr className="border-[#818181]" />
            <div className="flex flex-row justify-between">
              <p className="text-[#4A4A4A]">Tổng đơn hàng</p>
              <p className="font-semibold">{formatToVND(totalPrice)}</p>
            </div>
            <button
              onClick={handleCheckout}
              className="px-10 py-3 text-white font-medium bg-[#a93f15] rounded-lg w-full disabled:bg-[#a93f15]/50 disabled:cursor-not-allowed"
              disabled={selectedCartItems.length === 0}
            >
              Chuyển đến Thanh toán
            </button>
          </div>
        </div>
      </div>
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bạn có chắc chắn muốn{" "}
              {type === "remove" ? "xóa các sản phẩm đã chọn" : "xóa giỏ hàng"}{" "}
              không?
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Hủy
              </Button>
              <Button
                color="failure"
                onClick={() => {
                  handleConfirmation(type);
                  setOpenModal(false);
                }}
              >
                <p className="text-white">Xóa</p>
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ShoppingCart;
