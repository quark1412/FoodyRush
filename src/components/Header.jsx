import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

import { getAllProducts } from "../data/products";
import { formatToVND, formatURL } from "../utils/format";
import { getAllImagesByProductId } from "../data/productImages";
import { getUserById } from "../data/users";
import { getCategoryById } from "../data/categories";

import useSpeechToText from "react-hook-speech-to-text";

function Header() {
  const { auth, logout, user } = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const carts = useSelector((store) => store.cart.items);
  const modalRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isSpeechPopupOpen, setIsSpeechPopupOpen] = useState(false);
  const [speechTimeout, setSpeechTimeout] = useState(null);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    timeout: 3000,
    speechRecognitionProperties: {
      lang: "vi-VN",
      interimResults: true,
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getAllProducts();
      const updatedProducts = await Promise.all(
        fetchedProducts.map(async (product) => {
          const images = product.images;
          const category = product.categoryId;
          return {
            ...product,
            imagePath: images[0].url,
            category: category.name,
          };
        })
      );
      setProducts(updatedProducts);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userData = await getUserById(user.id);
        setUserData(userData);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    let total = 0;
    carts.forEach((cart) => (total += cart.quantity));
    setTotalQuantity(total);
  }, [carts]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSearchModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeSearchModal();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchModalOpen]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = searchQuery
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      setSearchQuery(lastResult.transcript);
    }
  }, [results]);

  const handleSpeech = () => {
    setIsSpeechPopupOpen(true);
    setSearchQuery("");
    stopSpeechToText();
    startSpeechToText();
  };

  useEffect(() => {
    if (isRecording) {
      const handleStopSpeaking = () => {
        setIsSpeechPopupOpen(false);
        stopSpeechToText();
      };

      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }

      const timeout = setTimeout(() => {
        handleStopSpeaking();
      }, 2000);

      setSpeechTimeout(timeout);

      window.addEventListener("speechend", handleStopSpeaking);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("speechend", handleStopSpeaking);
      };
    }
  }, [isRecording, results]);

  return (
    <>
      <header className="bg-white px-40 py-4 shadow-md min-w-full z-[50]">
        <div className="mx-auto flex justify-between items-center">
          <div className="brand flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 outline-none">
              <svg
                width="37"
                height="40"
                viewBox="0 0 37 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.62973 44.1691L5.66504 22.8233C5.66504 22.8233 7.44385 25.1948 11.2979 25.343C15.152 25.4913 21.0961 19.2782 24.0461 20.4516L20.4885 44.1691H8.62973Z"
                  fill="#A93F15"
                />
                <path
                  d="M29.0723 16.7518L24.4775 46.992L24.3242 47.9998H4.63574L4.49121 46.9803L0.192383 16.741L0 15.3885H20.1201C20.3607 16.2587 20.7604 17.0596 21.2861 17.7596H2.73242L6.69434 45.6278H22.2861L26.0898 20.5916L28.0439 21.0672L28.5342 19.0506L26.4023 18.5321L26.5205 17.7596H24.3066C23.4137 17.2028 22.7091 16.3767 22.3076 15.3885H29.2803L29.0723 16.7518Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M25.6762 1.63281L24.6439 10.5732C24.5598 11.3031 25.0814 11.9637 25.8109 12.0508C26.5442 12.1382 27.2092 11.6134 27.2943 10.8799L28.3295 1.94922L31.0131 2.26855L29.9809 11.1904C29.8963 11.9206 30.418 12.5819 31.1479 12.6689C31.8812 12.7564 32.5462 12.2316 32.6313 11.498L33.6635 2.58594L34.977 2.74121L36.2914 2.89844L34.9662 14.0049C34.5686 17.3378 31.5443 19.7179 28.2113 19.3203L27.0346 19.1797C23.7017 18.7821 21.3216 15.7577 21.7191 12.4248L23.0443 1.31836L25.6762 1.63281ZM35.1654 1.18848C35.9032 1.27645 36.4243 1.95387 36.3197 2.68945L36.2904 2.89746L33.6635 2.58496L33.6947 2.33594C33.7865 1.61452 34.4433 1.10241 35.1654 1.18848ZM29.8344 0.598632L29.8627 0.601562C30.5804 0.687143 31.0998 1.3291 31.0336 2.04883L31.0131 2.26855L28.3305 1.94922L28.351 1.77148C28.4351 1.03708 29.1004 0.511107 29.8344 0.598632ZM28.3305 1.94824L28.3295 1.94922L25.6762 1.63281L25.6771 1.63184L28.3305 1.94824ZM24.5307 0.00976525C25.2454 0.0950276 25.7617 0.734625 25.6938 1.45117L25.6762 1.63184L23.0443 1.31738L23.0521 1.21582C23.1145 0.467717 23.7852 -0.0791227 24.5307 0.00976525Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M23.3047 46.8142L27.9 16.5743"
                  stroke="#0A0A0A"
                  stroke-width="2.37175"
                />
                <circle cx="12.1872" cy="29.9383" r="1.63058" fill="white" />
                <circle cx="16.0415" cy="35.5713" r="1.03764" fill="white" />
                <circle cx="14.4113" cy="40.4629" r="0.592938" fill="white" />
              </svg>

              <span className="font-bold text-xl tracking-wide">FoodyRush</span>
            </Link>
          </div>
          <nav className="flex justify-between items-center align-middle w-[38%]">
            <Link
              to="/"
              className="text-[#a93f15] hover:text-red-600 font-semibold relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:bg-red-600 before:transition-all before:duration-300 before:-bottom-1 before:left-1/2 before:transform before:translate-x-[-50%] hover:before:w-full"
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="text-[#a93f15] hover:text-red-600 font-semibold relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:bg-red-600 before:transition-all before:duration-300 before:-bottom-1 before:left-1/2 before:transform before:translate-x-[-50%] hover:before:w-full"
            >
              Menu
            </Link>
            <Link
              to="/aboutUs"
              className="text-[#a93f15] hover:text-red-600 font-semibold relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:bg-red-600 before:transition-all before:duration-300 before:-bottom-1 before:left-1/2 before:transform before:translate-x-[-50%] hover:before:w-full"
            >
              Giới thiệu
            </Link>
            <Link
              to="/contactUs"
              className="text-[#a93f15] hover:text-red-600 font-semibold relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:bg-red-600 before:transition-all before:duration-300 before:-bottom-1 before:left-1/2 before:transform before:translate-x-[-50%] hover:before:w-full"
            >
              Liên hệ
            </Link>
          </nav>
          <div className="flex items-center space-x-4 justify-between w-40">
            <a
              className="hover:text-gray-600 cursor-pointer"
              onClick={openSearchModal}
            >
              <svg
                class="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="#a93f15"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M21.0004 20.9999L16.6504 16.6499"
                  stroke="#a93f15"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <Link to="/cart" className="hover:text-gray-600 relative">
              <svg
                class="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.8337 20.9999C20.4525 20.9999 21.046 21.2458 21.4836 21.6833C21.9212 22.1209 22.167 22.7144 22.167 23.3333C22.167 23.9521 21.9212 24.5456 21.4836 24.9832C21.046 25.4208 20.4525 25.6666 19.8337 25.6666C19.2148 25.6666 18.6213 25.4208 18.1837 24.9832C17.7462 24.5456 17.5003 23.9521 17.5003 23.3333C17.5003 22.0383 18.5387 20.9999 19.8337 20.9999ZM1.16699 2.33325H4.98199L6.07866 4.66659H23.3337C23.6431 4.66659 23.9398 4.7895 24.1586 5.00829C24.3774 5.22709 24.5003 5.52383 24.5003 5.83325C24.5003 6.03159 24.442 6.22992 24.3603 6.41659L20.1837 13.9649C19.787 14.6766 19.017 15.1666 18.142 15.1666H9.45033L8.40033 17.0683L8.36533 17.2083C8.36533 17.2856 8.39605 17.3598 8.45075 17.4145C8.50545 17.4692 8.57964 17.4999 8.65699 17.4999H22.167V19.8333H8.16699C7.54815 19.8333 6.95466 19.5874 6.51708 19.1498C6.07949 18.7122 5.83366 18.1188 5.83366 17.4999C5.83366 17.0916 5.93866 16.7066 6.11366 16.3799L7.70033 13.5216L3.50033 4.66659H1.16699V2.33325ZM8.16699 20.9999C8.78583 20.9999 9.37932 21.2458 9.81691 21.6833C10.2545 22.1209 10.5003 22.7144 10.5003 23.3333C10.5003 23.9521 10.2545 24.5456 9.81691 24.9832C9.37932 25.4208 8.78583 25.6666 8.16699 25.6666C7.54815 25.6666 6.95466 25.4208 6.51708 24.9832C6.07949 24.5456 5.83366 23.9521 5.83366 23.3333C5.83366 22.0383 6.87199 20.9999 8.16699 20.9999ZM18.667 12.8333L21.9103 6.99992H7.16366L9.91699 12.8333H18.667Z"
                  fill="#a93f15"
                />
              </svg>
              {totalQuantity !== 0 && (
                <span className="absolute left-1/2 bottom-1/2 inline-block w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full text-center leading-5">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {auth.isAuth ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex text-sm rounded-full md:me-0 focus:ring-gray-600"
                  type="button"
                  onClick={toggleDropdown}
                >
                  <img
                    className="w-8 h-8 rounded-full"
                    src={formatURL(userData?.avatarPath)}
                    alt="userData photo"
                  />
                </button>
                <div
                  className={`absolute left-4 -translate-x-1/2 mt-3 z-20 ${
                    isDropdownOpen ? "block" : "hidden"
                  } bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] w-32`}
                >
                  <div className="px-4 py-2 text-sm text-gray-700">
                    Xin chào, {userData?.fullName?.split(" ").pop()}
                  </div>
                  <hr className="mx-4" />
                  <ul className="pt-2 text-sm text-gray-700 text-gray-200">
                    <li>
                      <Link
                        to="/account"
                        className="block px-4 py-2 hover:bg-[#f3f4f6] flex flex-row gap-x-2"
                        onClick={() => {
                          toggleDropdown();
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="size-5"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                        <span>Tài khoản</span>
                      </Link>
                    </li>
                  </ul>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        toggleDropdown();
                      }}
                      className="block w-full flex flex-row gap-x-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f3f4f6]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.5 24.5H5.83333C5.21449 24.5 4.621 24.2542 4.18342 23.8166C3.74583 23.379 3.5 22.7855 3.5 22.1667V5.83333C3.5 5.21449 3.74583 4.621 4.18342 4.18342C4.621 3.74583 5.21449 3.5 5.83333 3.5H10.5"
                          stroke="#dc2626"
                          stroke-width="2.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M18.6667 19.8337L24.5001 14.0003L18.6667 8.16699"
                          stroke="#dc2626"
                          stroke-width="2.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M24.5 14H10.5"
                          stroke="#dc2626"
                          stroke-width="2.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span className="text-[#dc2626]">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login " className="hover:text-gray-600">
                <svg
                  class="nav-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="#a93f15"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="#a93f15"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>
      {isSearchModalOpen && (
        <div
          id="search-modal"
          className="h-[100vh] w-[100vw] fixed top-0 flex justify-center items-start pt-[10rem] z-[100]"
          style={{ backdropFilter: "blur(6px)" }}
        >
          <div
            ref={modalRef}
            className="w-[60%] flex items-center p-[1rem] bg-white rounded"
            style={{ boxShadow: "0 1rem 1rem rgba(0, 0, 0, .2)" }}
          >
            <div className="relative w-full flex justify-center items-center">
              <div className="flex rounded overflow-hidden w-full">
                <label htmlFor="search-input" className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path
                      d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                      stroke="#64748b"
                      fill="none"
                      stroke-width="2"
                      fill-rule="evenodd"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </label>
                <input
                  id="search-input"
                  className="flex-1 border-none focus:ring-0 focus:outline-none ml-[.75rem] mr-[1rem]"
                  type="text"
                  value={searchQuery}
                  placeholder="Tìm kiếm sản phẩm..."
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
              </div>
              <div
                className="absolute top-16 w-[80%] overflow-y-auto max-h-[300px] rounded-md bg-white"
                style={{ boxShadow: "0 1rem 1rem rgba(0, 0, 0, .2)" }}
              >
                {filteredProducts.map((product) => (
                  <div key={product._id}>
                    <Link
                      to={`/products/details/${product._id}`}
                      onClick={closeSearchModal}
                    >
                      <div className="flex items-center px-3 py-2 hover:bg-gray-100">
                        <img
                          src={formatURL(product.imagePath)}
                          alt={product.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-semibold">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatToVND(product.price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                {filteredProducts.length <= 0 && searchQuery != "" && (
                  <p className="p-3">Không có sản phẩm phù hợp</p>
                )}
              </div>
              <button
                className="mr-6 rounded-full disabled:cursor-not-allowed microphone-button"
                disabled={isRecording}
                onClick={handleSpeech}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`size-6 hover:fill-red-500 fill-current`}
                >
                  <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                  <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                </svg>
                {isRecording && <div className="microphone-animation" />}
              </button>
              {/* {isSpeechPopupOpen && (
                <div className="whitespace-nowrap mr-4">
                  <p>Đang nghe...</p>
                </div>
              )} */}
              <button
                onClick={closeSearchModal}
                id="close-search"
                class="w-[1.75rem] h-[1.5rem] rounded-[.375rem] flex items-center border-[#f1f5f9]"
                style={{
                  backgroundPosition: "50%",
                  padding: ".25rem .375rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="7"
                  fill="none"
                >
                  <path
                    d="M.506 6h3.931V4.986H1.736v-1.39h2.488V2.583H1.736V1.196h2.69V.182H.506V6ZM8.56 1.855h1.18C9.721.818 8.87.102 7.574.102c-1.276 0-2.21.705-2.205 1.762-.003.858.602 1.35 1.585 1.585l.634.159c.633.153.986.335.988.727-.002.426-.406.716-1.03.716-.64 0-1.1-.295-1.14-.878h-1.19c.03 1.259.931 1.91 2.343 1.91 1.42 0 2.256-.68 2.259-1.745-.003-.969-.733-1.483-1.744-1.71l-.523-.125c-.506-.117-.93-.304-.92-.722 0-.375.332-.65.934-.65.588 0 .949.267.994.724ZM15.78 2.219C15.618.875 14.6.102 13.254.102c-1.537 0-2.71 1.086-2.71 2.989 0 1.898 1.153 2.989 2.71 2.989 1.492 0 2.392-.992 2.526-2.063l-1.244-.006c-.117.623-.606.98-1.262.98-.883 0-1.483-.656-1.483-1.9 0-1.21.591-1.9 1.492-1.9.673 0 1.159.389 1.253 1.028h1.244Z"
                    fill="#334155"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
