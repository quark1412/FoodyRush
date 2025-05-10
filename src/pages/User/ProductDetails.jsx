import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AuthContext from "../../context/AuthContext";
import { Modal } from "flowbite-react";

import { getProductById } from "../../data/products";
import { getCategoryById } from "../../data/categories";
import { getProductVariantsByProductId } from "../../data/productVariant";
import { getAllReviews } from "../../data/reviews";
import { getUserById } from "../../data/users";

import Banner from "../../components/Banner";
import Rating from "../../components/Rating";
import SellerFeedback from "../../components/SellerFeedback";
import Size from "../../components/Size";
import Review from "../../components/Review";
import Pagination from "../../components/Pagination";
import {
  FREE_SHIPPING,
  REVIEW_STATUS,
  REVIEW_TYPE,
  REVIEWS_PER_PAGE,
  SHIPPING_RATE,
} from "../../utils/Constants";
import { addToCart } from "../../stores/cart";
import { formatToVND, formatURL } from "../../utils/format";
import toast from "react-hot-toast";
import Error from "../Error";
import Cookies from "js-cookie";
import instance from "../../services/axiosConfig";

function ProductDetails() {
  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carts = useSelector((store) => store.cart.items);

  const [product, setProduct] = useState({});
  const [photos, setPhotos] = useState([]);
  const [variants, setVariants] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState();
  const [mainImage, setMainImage] = useState();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [openModal, setOpenModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchProduct = async () => {
    const product = await getProductById(id);
    const fetchedImages = product.images ?? [];

    setMainImage(fetchedImages[0]?.url ?? "");
    setPhotos(fetchedImages);

    let categoryName = "";
    if (product?.categoryId) {
      const category = await getCategoryById(product.categoryId);
      categoryName = category?.name || "";
    }

    setProduct({
      productName: product.name,
      price: product.price,
      description: product.description,
      rating: product.rating,
      category: categoryName,
      soldQuantity: product.soldQuantity,
      totalReview: product.totalReview,
    });
  };

  const fetchVariants = async () => {
    const fetchedVariants = await getProductVariantsByProductId(id);
    if (fetchedVariants) {
      const variantsData = await Promise.all(
        fetchedVariants.map(async (variant) => {
          const size = variant.size;
          return { size, quantity: variant.stock };
        })
      );
      setSelectedSize(variantsData[0]?.size ?? "");
      setVariants(variantsData);
    }
  };

  const fetchReviews = async () => {
    const fetchedReviews = await getAllReviews(
      true,
      undefined,
      undefined,
      id,
      undefined,
      undefined
    );
    const data = await Promise.all(
      fetchedReviews.map(async (review) => {
        const user = await getUserById(review.userId);
        const response = review.response;
        let userResponse = null;
        let reviewResponse = null;
        if (response.length > 0) {
          userResponse = await getUserById(response[0]?.userId);
          reviewResponse ??= response[0];
        }
        return { ...review, user, userResponse, reviewResponse };
      })
    );
    setReviews(data);
  };

  const addToProductView = async () => {
    try {
      const response = await instance.post(
        "/productView",
        { productId: id },
        { requiresAuth: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchVariants();
    fetchReviews();
    if (user) addToProductView();
  }, [id]);

  useEffect(() => {
    const filteredSizes = variants.map((variant) => variant.size);
    setAvailableSizes(filteredSizes);
  }, [variants]);

  useEffect(() => {
    if (product.productName) {
      document.title = product.productName;
    }
  }, [product]);

  const handleAddToCart = async () => {
    const productData = {
      productId: id,
      name: product.name,
      categoryId: product.category,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      image: mainImage,
    };
    dispatch(addToCart(productData));
    toast.success("Sản phẩm đã được thêm vào giỏ hàng", { duration: 2000 });
  };

  const [currentPage, setCurrentPage] = useState(1);

  const currentReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const percentage = Math.round((product.rating / 5) * 100);

  const handleCheckout = () => {
    const subTotal = quantity * product.price;
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
      subTotal: quantity * product.price,
      shipping: shipping,
      totalPrice: totalPrice,
    };

    if (selectedCartItems.length > 0) {
      // if (!auth.isAuth) {
      //   navigate("/login", { state: { orderSummary, type: "Buy Now" } });
      // } else {
      navigate("/checkout", { state: { orderSummary, type: "Buy Now" } });
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
        <Banner
          title="Chi tiết sản phẩm"
          route={`Trang chủ / Cửa hàng / Chi tiết sản phẩm / ${product.productName}`}
        />
        <div className="px-40">
          <div className="flex flex-row mt-10 gap-x-20">
            <div className="flex flex-col gap-y-2 w-[40%]">
              <img src={mainImage} alt={product.productName} />

              <div className="flex flex-row gap-x-[6.66px] overflow-y-scroll">
                {Array.isArray(photos) &&
                  photos.map((image, index) => (
                    <img
                      loading="lazy"
                      key={index}
                      src={image.url}
                      alt={`Thumbnail ${index}`}
                      onClick={() => {
                        setMainImage(image.url);
                        setSelectedImageIndex(index);
                      }}
                      className={`cursor-pointer border-2 w-28 transition-all duration-300 ${
                        selectedImageIndex === index
                          ? "border-[#a93f15]"
                          : "border-transparent"
                      }`}
                    />
                  ))}
              </div>
            </div>
            <div className="flex-1 gap-y-4 flex flex-col">
              <p>{product.category}</p>
              <div className="flex flex-col gap-y-1">
                <div className="flex gap-x-3 items-center">
                  <p className="font-semibold text-2xl">
                    {product.productName}
                  </p>
                  <p className="ml-3 text-xl">
                    (Đã bán: {product.soldQuantity})
                  </p>
                </div>
                <div className="flex flex-row items-center">
                  <Rating percentage={percentage} />
                  <p className="ml-2 text-lg">
                    {product.rating
                      ? product.rating.toFixed(1)
                      : "Chưa có đánh giá"}
                  </p>
                  <p className="ml-5 text-xl">
                    ({product.totalReview} đánh giá)
                  </p>
                </div>
                <p className="font-semibold text-xl">
                  {formatToVND(product.price)}
                </p>
              </div>
              <div>
                <p className="font-medium text-xl mb-1">Kích cỡ:</p>
                <div className="flex flex-row gap-x-2">
                  {availableSizes.map((size) => (
                    <Size
                      key={size}
                      size={size}
                      isSelected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-row gap-x-5 mt-2">
                <div className="flex items-center justify-between border border-[#a93f15] rounded-lg w-40">
                  <button
                    className="px-3 py-2 text-gray-600 flex-1 flex items-center justify-center"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <svg
                      width="20"
                      height="20"
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
                  <div className="w-px h-8 bg-[#a93f15]"></div>
                  <span className="px-3 py-2 text-center flex-1 text-[#a93f15]">
                    {quantity}
                  </span>
                  <div className="w-px h-8 bg-[#a93f15]"></div>
                  <button
                    className="px-3 py-2 text-[#a93f15] flex-1 flex items-center justify-center"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    <svg
                      width="20"
                      height="20"
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
                <button
                  className="px-10 py-3 text-white font-medium bg-[#a93f15] rounded-lg"
                  onClick={handleAddToCart}
                >
                  Giỏ hàng
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-10 py-3 text-white font-medium bg-[#a93f15] rounded-lg"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="mt-8 mb-24">
              <div className="border-b border-gray-200">
                <nav
                  className="-mb-px flex justify-center gap-x-10"
                  aria-label="Tabs"
                >
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`border-b-2 py-4 px-1 text-2xl font-medium ${
                      activeTab === "description"
                        ? "border-black text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Mô tả
                  </button>
                  <button
                    onClick={() => setActiveTab("review")}
                    className={`border-b-2 py-4 px-1 text-2xl font-medium ${
                      activeTab === "review"
                        ? "border-black text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Đánh giá
                  </button>
                </nav>
              </div>
              <div className="mt-4 justify-center">
                {activeTab === "description" && (
                  <p className="text-sm">{product.description}</p>
                )}
                {activeTab === "review" && (
                  <>
                    <div className="flex justify-center">
                      <div className="flex flex-col mb-10 mt-5 w-fit gap-y-5">
                        <div className="flex justify-center gap-x-10">
                          <div className="flex flex-col justify-center gap-y-2">
                            <p className="text-xl text-center">
                              <label className="font-medium text-3xl mr-1">
                                {product.rating.toFixed(1)}
                              </label>{" "}
                              trên 5.0
                            </p>
                            <div className="flex flex-row gap-x-2">
                              {[...Array(5)].map((_, index) => (
                                <svg
                                  key={index}
                                  width="24"
                                  height="24"
                                  viewBox="0 0 40 40"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20.0001 28.7833L26.9168 32.9667C28.1835 33.7333 29.7335 32.6 29.4001 31.1666L27.5668 23.3L33.6835 18C34.8001 17.0333 34.2001 15.2 32.7335 15.0833L24.6835 14.4L21.5335 6.96665C20.9668 5.61665 19.0335 5.61665 18.4668 6.96665L15.3168 14.3833L7.26679 15.0666C5.80012 15.1833 5.20012 17.0166 6.31679 17.9833L12.4335 23.2833L10.6001 31.15C10.2668 32.5833 11.8168 33.7167 13.0835 32.95L20.0001 28.7833Z"
                                    fill="#FFE066"
                                  />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <div className="w-[1px] bg-[#818181]"></div>
                          <div className="flex items-center justify-center">
                            <label className="text-4xl font-medium mr-2">
                              {product.totalReview}
                            </label>{" "}
                            đánh giá
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-[#818181]"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-4">
                      {/* {reviews.length > 0 ? ( */}
                      <>
                        {currentReviews.map((review) => (
                          <div key={review._id} className="mt-5">
                            <div className={`flex flex-col gap-y-5`}>
                              <Review {...review} />
                              {review.userResponse && review.reviewResponse && (
                                <SellerFeedback
                                  user={review.userResponse}
                                  content={review.reviewResponse.content}
                                  createdDate={review.reviewResponse.createdAt}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                        {reviews.length > 0 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(
                              reviews.length / REVIEWS_PER_PAGE
                            )}
                            onPageChange={setCurrentPage}
                            svgClassName={"w-6 h-6"}
                            textClassName={"text-xl px-3 py-2"}
                          />
                        )}
                      </>
                      {/* // ) : ( //{" "}
                      <div className="text-center font-bold text-2xl">
                        // Chưa có đánh giá nào //{" "}
                      </div>
                      // )} */}
                    </div>
                  </>
                )}
              </div>
            </div>
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
              <img
                src={mainImage}
                alt={product.productName}
                className="w-40 rounded-lg"
              />
              <div className="flex flex-col justify-between flex-1">
                <p className="text-sm">{product.category}</p>
                <div className="flex flex-col gap-y-1">
                  <p className="font-medium text-base">{product.productName}</p>
                  <div className="flex flex-row items-center">
                    <Rating percentage={(product.rating / 5) * 100} />
                    <p className="ml-2 text-lg">
                      {product.rating ? product.rating : "Chưa có đánh giá"}
                    </p>
                  </div>
                  <p className="font-semibold text-base">
                    {formatToVND(product.price)}
                  </p>
                </div>
                <div className="flex flex-row gap-x-5 items-center">
                  <p className="font-medium">Số lượng: </p>
                  <div className="flex w-32 items-center justify-between border border-[#818181] rounded-lg">
                    <button
                      className="py-1 text-gray-600 flex-1 flex items-center justify-center"
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
                          stroke="#0A0A0A"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-[#818181]"></div>
                    <span className="py-1 text-center flex-1">{quantity}</span>
                    <div className="w-px h-6 bg-[#818181]"></div>
                    <button
                      className="py-1 text-gray-600 flex-1 flex items-center justify-center"
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
                          stroke="#0A0A0A"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 12H19"
                          stroke="#0A0A0A"
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
                                          ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                                          : "bg-white text-black border-gray-300"
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
              <p>{formatToVND(product.price * quantity)}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-center">
            <button
              onClick={handleCheckout}
              className="px-6 py-2 rounded bg-[#0A0A0A] text-white font-medium"
            >
              Mua ngay
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProductDetails;
