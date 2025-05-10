import { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Modal } from "flowbite-react";

import { getProductById } from "../data/products";
// import { getAllImagesByProductId } from "../data/productImages";
import { getCategoryById } from "../data/categories";
import { getProductVariantsByProductId } from "../data/productVariant";
import { formatToVND, formatURL } from "../utils/format";

import BestSellerIcon from "../assets/icons/best-seller.svg";
import NewArrivalIcon from "../assets/icons/new-arrival.svg";
import Rating from "./Rating";
import { FREE_SHIPPING, SHIPPING_RATE } from "../utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../stores/cart";

function ProductItem({
  id,
  usage,
  productName,
  rating,
  category,
  image,
  price,
}) {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);

  const fetchVariants = async () => {
    const fetchedVariants = await getProductVariantsByProductId(id);
    if (fetchedVariants) {
      const variantsData = await Promise.all(
        fetchedVariants.map(async (variant) => {
          const size = variant.size;
          return { size, quantity: variant.stock };
        })
      );
      setSelectedSize(variantsData[0].size);
      setVariants(variantsData);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [id]);

  const handleAddToCart = async () => {
    const product = {
      productId: id,
      name: productName,
      categoryId: category,
      price: price,
      quantity: quantity,
      size: selectedSize,
      image,
    };
    dispatch(addToCart(product));
    toast.success("Sản phẩm đã được thêm vào giỏ hàng", { duration: 2000 });
    setOpenCartModal(false);
  };

  useEffect(() => {
    const filteredSizes = variants.map((variant) => variant.size);
    setAvailableSizes(filteredSizes);
  }, [variants]);

  const handleCheckout = () => {
    const subTotal = quantity * price;
    const shipping =
      subTotal > FREE_SHIPPING || subTotal === 0 ? 0 : subTotal * SHIPPING_RATE;
    const totalPrice = subTotal + shipping;
    const selectedCartItems = [
      {
        productId: id,
        size: selectedSize,
        quantity: quantity,
      },
    ];

    const orderSummary = {
      items: selectedCartItems,
      totalItems: quantity,
      subTotal: quantity * price,
      shipping: shipping,
      totalPrice: totalPrice,
    };

    if (selectedCartItems.length > 0) {
      if (!auth.isAuth) {
        navigate("/login", { state: { orderSummary, type: "Buy Now" } });
      } else {
        navigate("/checkout", { state: { orderSummary, type: "Buy Now" } });
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <>
      <div
        className={`relative grid w-full max-w-64 flex-col overflow-hidden place-items-center rounded-lg border border-gray-100 bg-white shadow-md 
            ${
              usage === "product"
                ? "before:absolute before:content-[''] before:z-0 before:w-[50%] before:h-[180%] before:rotate-[30deg] before:bg-[#0A0A0A] hover:before:block hover:before:animate-[spinAround_.5s_linear] after:absolute after:content-[''] after:inset-[3px] after:rounded-[6px] after:bg-white after:z-0"
                : ""
            }
            ${
              usage === "new-arrival" || usage === "best-seller"
                ? "transform transition duration-500 hover:scale-105"
                : ""
            }`}
      >
        <Link
          className="mx-2 mt-3 flex h-50 overflow-hidden rounded-xl relative z-10"
          to={`/products/details/${id}`}
        >
          {usage === "new-arrival" && (
            <img
              src={NewArrivalIcon}
              className="absolute"
              width="45"
              height="45"
              alt=""
            />
          )}
          {usage === "best-seller" && (
            <img
              src={BestSellerIcon}
              className="absolute mt-2 ms-3"
              width="30"
              height="30"
              alt=""
            />
          )}
          <img
            className={`object-cover h-60 w-56`}
            src={image}
            alt="product image"
            onLoad={handleImageLoad}
            defaultValue={"https://via.placeholder.com/800x600?text=Team+Image"}
          />
        </Link>

        <div className="mt-2 px-4 pb-3 w-full z-10">
          <span>
            <h3
              className="text-[12px] font-medium text-[#616161] my-1"
              id="product-type"
            >
              {category}
            </h3>
          </span>
          <span>
            <h5
              className="tracking-tight font-bold text-base text-slate-900"
              id="product-name"
            >
              {productName}
            </h5>
          </span>
          <div className="mt-2 mb-3 flex items-center justify-between">
            <p>
              <span
                className="text-base font-bold text-slate-900"
                id="product-price"
              >
                {formatToVND(price)}
              </span>
            </p>
            <div className="flex items-center">
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-yellow-300"
                fill="#FFE066"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 rounded bg-yellow-200 px-2.5 py-0.5 text-xs font-bold">
                {rating ? rating.toFixed(1) : "Chưa có đánh giá"}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center justify-center rounded-md bg-[#a93f15] px-3 py-2 text-center text-[0.6rem] font-medium text-white hover:bg-[#FF7E4C] focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-6 fill-white"
                viewBox="0 0 24 24"
              >
                <g data-name="Layer 2">
                  <g data-name="shopping-bag">
                    <rect width="24" height="24" opacity="0" />
                    <path d="M20.12 6.71l-2.83-2.83A3 3 0 0 0 15.17 3H8.83a3 3 0 0 0-2.12.88L3.88 6.71A3 3 0 0 0 3 8.83V18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8.83a3 3 0 0 0-.88-2.12zm-12-1.42A1.05 1.05 0 0 1 8.83 5h6.34a1.05 1.05 0 0 1 .71.29L17.59 7H6.41zM18 19H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1z" />
                    <path d="M15 11a1 1 0 0 0-1 1 2 2 0 0 1-4 0 1 1 0 0 0-2 0 4 4 0 0 0 8 0 1 1 0 0 0-1-1z" />
                  </g>
                </g>
              </svg>
              Mua ngay
            </button>
            <button
              onClick={() => setOpenCartModal(true)}
              className="flex items-center justify-center rounded-md bg-[#a93f15] px-3 py-2 text-center text-[0.6rem] font-medium text-white hover:bg-[#FF7E4C] focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out ml-3"
              data-product-id={id}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Giỏ hàng
            </button>
          </div>
        </div>
      </div>
      <Modal
        show={openModal}
        size="lg"
        onClose={() => {
          setOpenModal(false);
          setQuantity(1);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="py-5 shadow-sm border-t border-b flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-row gap-x-5">
              <img src={image} alt={productName} className="w-40 rounded-lg" />
              <div className="flex flex-col gap-y-5 flex-1">
                <p className="text-sm">{category}</p>
                <div className="flex flex-col gap-y-1">
                  <p className="font-medium text-base">{productName}</p>
                  <div className="flex flex-row items-center">
                    <Rating percentage={(rating / 5) * 100} />
                    <p className="ml-2 text-sm font-medium">
                      {rating ? rating : "Chưa có đánh giá"}
                    </p>
                  </div>
                  <p className="font-semibold text-base">
                    {formatToVND(price)}
                  </p>
                </div>
                <div className="flex flex-row gap-x-5 items-center">
                  <p className="font-medium">Số lượng: </p>
                  <div className="flex w-32 items-center justify-between border border-[#a93f15] rounded-lg">
                    <button
                      className="py-1 text-[#a93f15] flex-1 flex items-center justify-center"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12H19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-[#a93f15]"></div>
                    <span className="py-1 text-center flex-1 text-[#a93f15]">
                      {quantity}
                    </span>
                    <div className="w-px h-6 bg-[#a93f15]"></div>
                    <button
                      className="py-1 text-[#a93f15] flex-1 flex items-center justify-center"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 5V19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 12H19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center gap-x-5">
              <p className="font-medium text-base mb-1">Kích cỡ:</p>
              <div className="flex flex-row gap-x-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`inline-block px-3 py-1 border rounded-md 
                                      ${
                                        selectedSize === size
                                          ? "bg-[#a93f15] text-white border-[#a93f15]"
                                          : "bg-white text-[#a93f15] border-[#a93f15]"
                                      } 
                                      cursor-pointer transition-all duration-300`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg py-3 px-5 flex flex-row justify-between bg-[#F8F9FA] font-medium text-xl mt-2">
              <p>Tổng:</p>
              <p>{formatToVND(price * quantity)}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-center">
            <button
              onClick={handleCheckout}
              className="flex items-center px-6 gap-x-2 py-2 rounded bg-[#a93f15] text-white font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-6 w-6 fill-white"
                viewBox="0 0 24 24"
              >
                <g data-name="Layer 2">
                  <g data-name="shopping-bag">
                    <rect width="24" height="24" opacity="0" />
                    <path d="M20.12 6.71l-2.83-2.83A3 3 0 0 0 15.17 3H8.83a3 3 0 0 0-2.12.88L3.88 6.71A3 3 0 0 0 3 8.83V18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8.83a3 3 0 0 0-.88-2.12zm-12-1.42A1.05 1.05 0 0 1 8.83 5h6.34a1.05 1.05 0 0 1 .71.29L17.59 7H6.41zM18 19H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1z" />
                    <path d="M15 11a1 1 0 0 0-1 1 2 2 0 0 1-4 0 1 1 0 0 0-2 0 4 4 0 0 0 8 0 1 1 0 0 0-1-1z" />
                  </g>
                </g>
              </svg>
              Mua ngay
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal
        show={openCartModal}
        size="lg"
        onClose={() => {
          setOpenCartModal(false);
          setQuantity(1);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="py-5 shadow-sm border-t border-b flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-row gap-x-5">
              <img src={image} alt={productName} className="w-40 rounded-lg" />
              <div className="flex flex-col gap-y-5 flex-1">
                <p className="text-sm">{category}</p>
                <div className="flex flex-col gap-y-1">
                  <p className="font-medium text-base">{productName}</p>
                  <div className="flex flex-row items-center">
                    <Rating percentage={(rating / 5) * 100} />
                    <p className="ml-2 text-sm font-medium">
                      {rating ? rating : "Chưa có đánh giá"}
                    </p>
                  </div>
                  <p className="font-semibold text-base">
                    {formatToVND(price)}
                  </p>
                </div>
                <div className="flex flex-row gap-x-5 items-center">
                  <p className="font-medium">Số lượng: </p>
                  <div className="flex w-32 items-center justify-between border border-[#a93f15] rounded-lg">
                    <button
                      className="py-1 text-[#a93f15] flex-1 flex items-center justify-center"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12H19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-[#a93f15]"></div>
                    <span className="py-1 text-center flex-1 text-[#a93f15]">
                      {quantity}
                    </span>
                    <div className="w-px h-6 bg-[#a93f15]"></div>
                    <button
                      className="py-1 text-[#a93f15] flex-1 flex items-center justify-center"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 5V19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 12H19"
                          stroke="#a93f15"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center gap-x-5">
              <p className="font-medium text-base mb-1">Kích cỡ:</p>
              <div className="flex flex-row gap-x-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`inline-block px-3 py-1 border rounded-md 
                                      ${
                                        selectedSize === size
                                          ? "bg-[#a93f15] text-white border-[#a93f15]"
                                          : "bg-white text-[#a93f15] border-[#a93f15]"
                                      } 
                                      cursor-pointer transition-all duration-300`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-center">
            <button
              onClick={handleAddToCart}
              className="px-6 py-2 flex items-center gap-x-2 rounded bg-[#a93f15] text-white font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Thêm vào giỏ hàng
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProductItem;
