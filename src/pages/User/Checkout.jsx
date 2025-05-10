import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";

import Banner from "../../components/Banner";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  USER_TYPE,
} from "../../utils/Constants";
import instance from "../../services/axiosConfig";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import AuthContext from "../../context/AuthContext";
import { getProductVariantByProductInfo } from "../../data/productVariant";
import { createPaymentDetail } from "../../data/paymentDetail";
import { createOrder, sendMailDeliveryInfo } from "../../data/orders";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../stores/cart";
import { formatToVND } from "../../utils/format";
import Error from "../Error";
import {
  createUserAddress,
  getUserAddressByUserId,
  updateUserAddressById,
} from "../../data/userAddress";
import { getProductById } from "../../data/products";
import { getUserById } from "../../data/users";
import { jwtDecode } from "jwt-decode";
import { Modal } from "flowbite-react";
import { updateOrderAddress } from "../../data/orderAddress";

const apiUrl = "https://api.mysupership.vn";
const apiEndpointProvince = apiUrl + "/v1/partner/areas/province";
const apiEndpointDistrict = apiUrl + "/v1/partner/areas/district?province=";
const apiEndpointCommune = apiUrl + "/v1/partner/areas/commune?district=";

function Checkout() {
  const location = useLocation();
  const { orderSummary, type } = location.state;
  const { user, createCart } = useContext(AuthContext);
  const carts = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, setHasError } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [phone, setPhone] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("0");
  const [selectedDistrict, setSelectedDistrict] = useState("0");
  const [selectedCommune, setSelectedCommune] = useState("0");
  const [selectedUserAddress, setSelectedUserAddress] = useState(null);
  const [openSelectAddressModal, setOpenSelectAddressModal] = useState(false);
  const [openUpdateAddressModal, setOpenUpdateAddressModal] = useState(false);
  const [openAddAddressModal, setOpenAddAddressModal] = useState(false);
  const [userType, setUserType] = useState(
    !auth.isAuth ? USER_TYPE.GUEST : USER_TYPE.CUSTOMER
  );
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editCommune, setEditCommune] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [street, setStreet] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [updatedCarts, setUpdatedCarts] = useState(carts);
  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [userAddresses, setUserAddresses] = useState([]);

  const permission = Cookies.get("permission") ?? null;

  useEffect(() => {
    if (selectedProvince !== "0") {
      updateDistricts(selectedProvince);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict !== "0") {
      updateCommunes(selectedDistrict);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    updateProvince();
  }, []);

  async function fetchData(url) {
    try {
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async function updateProvince() {
    const provinceList = await fetchData(apiEndpointProvince);
    setProvinces(provinceList);
  }

  async function updateDistricts(idProvince) {
    const districtList = await fetchData(apiEndpointDistrict + idProvince);
    setDistricts(districtList);
  }

  async function updateCommunes(idDistrict) {
    const communeList = await fetchData(apiEndpointCommune + idDistrict);
    setCommunes(communeList);
  }

  const fetchUserAddress = async () => {
    try {
      const userAddr = await getUserAddressByUserId();
      setUserAddresses(userAddr.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      const details = await Promise.all(
        orderSummary.items.map(async (item) => {
          const product = await getProductById(item.productId);
          const variant = await getProductVariantByProductInfo(
            item.productId,
            item.color,
            item.size
          );
          return {
            productId: item.productId,
            productVariantId: variant._id,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );
      setOrderDetails(details);
      if (auth.isAuth) {
        await fetchUserAddress();
      }
    })();
  }, []);

  const handleLogin = () => {
    navigate("/login", { state: { orderSummary, type: "Buy Now" } });
  };

  const handleCheckoutWithMomo = async (amount, orderId) => {
    try {
      const momoResponse = await instance.post("/order/checkoutWithMoMo", {
        amount: amount,
        orderId: orderId,
      });

      window.open(momoResponse.data.payUrl, "_self");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
        duration: 2000,
      });
      return error;
    }
  };

  const handleCheckoutWithVNPay = async (amount, orderId) => {
    try {
      const vnPayResponse = await instance.post("/order/checkoutWithVnPay", {
        amount: amount,
        orderId: orderId,
      });

      window.open(vnPayResponse.data.url, "_self");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
        duration: 2000,
      });
      return error;
    }
  };

  const handleCheckoutWithZaloPay = async (amount, orderId) => {
    try {
      const zaloPayResponse = await instance.post(
        "/order/checkoutWithZaloPay",
        {
          amount: amount,
          orderId: orderId,
        }
      );

      console.log(zaloPayResponse.data);

      window.open(zaloPayResponse.data.order_url, "_self");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
        duration: 2000,
      });
      return error;
    }
  };

  const handleSubmit = async () => {
    const PAYMENT_METHOD_ENUM = PAYMENT_METHOD.reduce((acc, method) => {
      acc[method.value] = method.value;
      return acc;
    }, {});

    try {
      const selectedCityName = provinces.find(
        (p) => p.code === selectedProvince
      )?.name;
      const selectedDistrictName = districts.find(
        (d) => d.code === selectedDistrict
      )?.name;
      const selectedCommuneName = communes.find(
        (c) => c.code === selectedCommune
      )?.name;

      let accessToken;
      let userId;
      if (userType === USER_TYPE.GUEST) {
        const guestAccountResponse = await instance.post(
          "/auth/createGuestAccount",
          {
            email,
            fullName,
            phone,
          },
          { requiresAuth: false }
        );
        accessToken = guestAccountResponse.data.data.accessToken;

        Cookies.set(
          "token",
          JSON.stringify(guestAccountResponse.data.data.accessToken)
        );
        userId = jwtDecode(accessToken).id;
      } else {
        userId = user.id;
      }

      const userResponse = await getUserById(userId);
      let userAddress;
      if (!selectedUserAddress) {
        const userAddressResponse = await axios.post(
          "http://localhost:8000/api/v1/userAddress",
          {
            city: selectedCityName,
            district: selectedDistrictName,
            commune: selectedCommuneName,
            street: street,
            phone: phone,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        userAddress = userAddressResponse.data.data;
      }
      const userAddressId = selectedUserAddress
        ? selectedUserAddress._id
        : userAddress._id;

      let order;
      if (userType === USER_TYPE.CUSTOMER) {
        order = await createOrder(
          orderDetails,
          0,
          userAddressId,
          orderSummary.shipping,
          paymentMethod,
          {},
          undefined
        );
      } else {
        const orderResponse = await axios.post(
          "http://localhost:8000/api/v1/order",
          {
            orderItems: orderDetails,
            discount: 0,
            userAddressId: userAddressId,
            shippingFee: orderSummary.shipping,
            paymentMethod: paymentMethod,
            deliveryInfo: {},
            expectedDeliveryDate: undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        order = orderResponse.data.data;
      }
      if (paymentMethod === PAYMENT_METHOD_ENUM.COD) {
        toast.success("Tạo đơn hàng thành công", {
          duration: 2000,
        });

        await toast.promise(
          sendMailDeliveryInfo(order._id, userResponse.email),
          {
            loading: "Đang gửi email cập nhật trạng thái đơn hàng",
            success: "Gửi email cập nhật trạng thái đơn hàng thành công",
            error: "Gửi email cập nhật trạng thái đơn hàng thất bại",
          }
        );

        let items = null;
        if (type !== "Buy Now") {
          items = orderSummary.items;
          navigate(`/orderCompleted?orderId=${order._id}`, {
            state: { items },
          });
        } else {
          navigate(`/orderCompleted?orderId=${order._id}`);
        }
      } else if (paymentMethod === PAYMENT_METHOD_ENUM.MOMO) {
        await handleCheckoutWithMomo(orderSummary.totalPrice, order._id);
      } else if (paymentMethod === PAYMENT_METHOD_ENUM.VNPAY) {
        await handleCheckoutWithVNPay(orderSummary.totalPrice, order._id);
      } else {
        await handleCheckoutWithZaloPay(orderSummary.totalPrice, order._id);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message, {
        duration: 2000,
      });
    }
  };

  const handleAddUserAddress = async () => {
    try {
      const selectedCityName = provinces.find(
        (p) => p.code === selectedProvince
      )?.name;
      const selectedDistrictName = districts.find(
        (d) => d.code === selectedDistrict
      )?.name;
      const selectedCommuneName = communes.find(
        (c) => c.code === selectedCommune
      )?.name;

      try {
        const response = await createUserAddress(
          user.id,
          selectedCityName,
          selectedDistrictName,
          selectedCommuneName,
          street,
          phone
        );
        toast.success("Thêm mới thông tin giao hàng thành công", {
          duration: 2000,
        });

        setSelectedUserAddress(response);
        fetchUserAddress();
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message, {
          duration: 2000,
        });
      }
      setOpenAddAddressModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUserAddress = async () => {
    const selectedCityName = provinces.find((p) => p.code === editCity)?.name;
    const selectedDistrictName = districts.find(
      (d) => d.code === editDistrict
    )?.name;
    const selectedCommuneName = communes.find(
      (c) => c.code === editCommune
    )?.name;

    try {
      const response = await updateUserAddressById(
        selectedUserAddress._id,
        selectedCityName,
        selectedDistrictName,
        selectedCommuneName,
        editStreet,
        editPhone
      );
      toast.success("Cập nhật thông tin giao hàng thành công", {
        duration: 2000,
      });

      setSelectedUserAddress(response);
      fetchUserAddress();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
        duration: 2000,
      });
    }
    setOpenUpdateAddressModal(false);
  };

  useEffect(() => {
    if (isOrderCreated) {
      setUpdatedCarts(carts);
      createCart(updatedCarts);
    }
  }, [isOrderCreated]);

  return (
    <>
      <div className="mb-20">
        <Banner title="Thanh toán" route="Trang chủ / Giỏ hàng / Thanh toán" />
        <div className="flex flex-row gap-x-20 px-40 py-20">
          <div className="flex flex-col gap-y-6 w-[800px]">
            {!auth.isAuth && (
              <div className="flex flex-col gap-y-6">
                <p className="font-medium text-2xl">Loại khách hàng</p>
                <div className="flex flex-row gap-x-4 mb-4">
                  {Object.values(USER_TYPE).map((type, index) => (
                    <div
                      className="flex flex-row ml-2 items-center"
                      key={index}
                    >
                      <input
                        type="radio"
                        checked={userType === type}
                        onChange={() => setUserType(type)}
                        value={type}
                      />
                      <label className="ml-2">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {auth.isAuth && (
              <div className="flex flex-col gap-y-6">
                <p className="font-medium text-2xl">Thông tin giao hàng</p>
                <div className="flex flex-col items-start gap-5">
                  {selectedUserAddress && (
                    <div className="flex flex-col gap-y-2 w-full">
                      <p>Số điện thoại: {selectedUserAddress.phone}</p>
                      <p>Tỉnh/Thành phố: {selectedUserAddress.city}</p>
                      <p>Quận/Huyện: {selectedUserAddress.district}</p>
                      <p>Xã: {selectedUserAddress.commune}</p>
                      <p>Đường: {selectedUserAddress.street}</p>
                    </div>
                  )}
                  <div className="flex flex-row gap-5">
                    {!selectedUserAddress && (
                      <button
                        className="bg-[#a93f15] px-6 py-2 rounded-lg text-white font-semibold"
                        onClick={() => setOpenSelectAddressModal(true)}
                      >
                        Chọn thông tin
                      </button>
                    )}
                    {selectedUserAddress && (
                      <div className="flex flex-row gap-5">
                        <button
                          className="bg-[#a93f15] px-6 py-2 rounded-lg text-white font-semibold"
                          onClick={() => setOpenSelectAddressModal(true)}
                        >
                          Thay đổi thông tin
                        </button>
                        <button
                          className="bg-[#a93f15] px-6 py-2 rounded-lg text-white font-semibold"
                          onClick={async () => {
                            try {
                              const provincesList = await fetchData(
                                apiEndpointProvince
                              );
                              setProvinces(provincesList);

                              const selectedProvinceCode = provincesList.find(
                                (p) => p.name === selectedUserAddress.city
                              )?.code;

                              if (selectedProvinceCode) {
                                setEditCity(selectedProvinceCode);

                                const districtsList = await fetchData(
                                  apiEndpointDistrict + selectedProvinceCode
                                );
                                setDistricts(districtsList);

                                const selectedDistrictCode = districtsList.find(
                                  (d) => d.name === selectedUserAddress.district
                                )?.code;

                                if (selectedDistrictCode) {
                                  setEditDistrict(selectedDistrictCode);

                                  const communesList = await fetchData(
                                    apiEndpointCommune + selectedDistrictCode
                                  );
                                  setCommunes(communesList);

                                  const selectedCommuneCode = communesList.find(
                                    (c) =>
                                      c.name === selectedUserAddress.commune
                                  )?.code;

                                  if (selectedCommuneCode) {
                                    setEditCommune(selectedCommuneCode);
                                  }
                                }
                              }

                              setEditPhone(selectedUserAddress.phone);
                              setEditStreet(selectedUserAddress.street);
                            } catch (error) {
                              console.error(
                                "Error fetching order address data:",
                                error
                              );
                            }
                            setOpenUpdateAddressModal(true);
                          }}
                        >
                          Chỉnh sửa thông tin
                        </button>
                      </div>
                    )}
                    <button
                      className="bg-[#a93f15] px-6 py-2 rounded-lg text-white font-semibold"
                      onClick={() => setOpenAddAddressModal(true)}
                    >
                      Thêm mới thông tin
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userType === USER_TYPE.GUEST && (
              <div className="flex flex-col gap-y-6">
                <p className="font-medium text-2xl">Thông tin giao hàng</p>
                <div>
                  <p className="text-base">
                    Họ và tên <b className="text-red-500">*</b>
                  </p>
                  <input
                    className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  ></input>
                </div>
                <div>
                  <p className="text-base">
                    Email <b className="text-red-500">*</b>
                  </p>
                  <input
                    className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                  ></input>
                </div>
                <div>
                  <p className="text-base">
                    Số điện thoại <b className="text-red-500">*</b>
                  </p>
                  <input
                    className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                    type="number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  ></input>
                </div>
                <div>
                  <p className="text-base">
                    Tỉnh/Thành phố <b className="text-red-500">*</b>
                  </p>
                  <select
                    id="city-province"
                    class="w-[100%] border rounded-lg px-3 py-2.5 mt-2 text-sm"
                    name="city"
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setDistricts([]);
                      setCommunes([]);
                    }}
                  >
                    <option value="0">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-base">
                    Quận/Huyện <b className="text-red-500">*</b>
                  </p>
                  <select
                    id="district-town"
                    class="w-full border rounded-lg px-3 py-2.5 mt-2 text-sm disabled:cursor-not-allowed"
                    name="district"
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={districts.length === 0}
                  >
                    <option value="0">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-base">
                    Xã <b className="text-red-500">*</b>
                  </p>
                  <select
                    id="ward-commune"
                    class="w-full border rounded-lg px-3 py-2.5 text-sm mt-2 disabled:cursor-not-allowed"
                    name="ward"
                    disabled={communes.length === 0}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                  >
                    <option value="0">Chọn xã</option>
                    {communes.map((commune) => (
                      <option key={commune.code} value={commune.code}>
                        {commune.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-base">
                    Đường <b className="text-red-500">*</b>
                  </p>
                  <input
                    type="text"
                    className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                    placeholder="VD: Số 81, đường số 6"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  ></input>
                </div>
              </div>
            )}
            {!auth.isAuth && userType === USER_TYPE.CUSTOMER && (
              <button
                className="px-10 py-3 text-white font-medium bg-[#a93f15] rounded-lg self-center"
                onClick={handleLogin}
              >
                Đăng nhập để đặt hàng
              </button>
            )}
          </div>
          <div className="flex flex-col h-fit gap-y-10">
            <div className="flex-1 border border-[#818181] rounded-lg p-5 flex flex-col gap-y-4">
              <p className="font-bold text-xl">Tóm tắt đơn hàng</p>
              <hr className="border-[#818181]" />
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row justify-between">
                  <p className="text-[#4A4A4A]">Số lượng</p>
                  <p className="font-semibold">{orderSummary.totalItems}</p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="text-[#4A4A4A]">Tổng</p>
                  <p className="font-semibold">
                    {formatToVND(orderSummary.subTotal)}
                  </p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="text-[#4A4A4A]">Phí vận chuyển</p>
                  <p className="font-semibold">
                    {formatToVND(orderSummary.shipping)}
                  </p>
                </div>
              </div>
              <hr className="border-[#818181]" />
              <div className="flex flex-row justify-between">
                <p className="text-[#4A4A4A]">Tổng đơn hàng</p>
                <p className="font-semibold">
                  {formatToVND(orderSummary.totalPrice)}
                </p>
              </div>
            </div>
            <div className="flex-1 border border-[#818181] rounded-lg p-5 flex flex-col gap-y-4">
              <p className="font-bold text-xl">Phương thức thanh toán</p>
              <hr className="border-[#818181]" />
              <div className="flex flex-col gap-y-2">
                {PAYMENT_METHOD.map((method, index) => (
                  <div className="flex flex-row ml-2 items-center" key={index}>
                    <input
                      type="radio"
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      value={method.value}
                    />
                    <label className="ml-2">{method.title}</label>
                  </div>
                ))}
              </div>
              <hr className="border-[#818181]" />
              <button
                className="px-10 py-3 text-white font-medium bg-[#a93f15] rounded-lg w-full"
                onClick={handleSubmit}
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={openSelectAddressModal}
        size="lg"
        onClose={() => {
          setOpenSelectAddressModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-bold">
              Thông tin giao hàng
            </h3>
            <div className="flex flex-col overflow-scroll max-h-96 gap-5 mb-4 thin-scrollbar">
              {userAddresses.map((userAddress) => (
                <div className="flex flex-row gap-5 items-start">
                  <input
                    type="radio"
                    checked={selectedUserAddress?._id === userAddress._id}
                    onChange={() => {
                      setSelectedUserAddress(userAddress);
                      setOpenSelectAddressModal(false);
                    }}
                    value={userAddress._id}
                    className="mt-2 ml-2"
                  />
                  <div className="flex flex-col gap-y-2">
                    <p>Số điện thoại: {userAddress.phone}</p>
                    <p>Tỉnh/Thành phố: {userAddress.city}</p>
                    <p>Quận/Huyện: {userAddress.district}</p>
                    <p>Xã: {userAddress.commune}</p>
                    <p>Đường: {userAddress.street}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openUpdateAddressModal}
        size="lg"
        onClose={() => {
          setOpenUpdateAddressModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-bold">
              Chỉnh sửa thông tin giao hàng
            </h3>
            <div className="flex flex-col gap-5 mb-4">
              <div>
                <p className="text-base">
                  Số điện thoại <b className="text-red-500">*</b>
                </p>
                <input
                  className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                  type="number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                ></input>
              </div>
              <div>
                <p className="text-base">
                  Tỉnh/Thành phố <b className="text-red-500">*</b>
                </p>
                <select
                  id="city-province"
                  class="w-[100%] border rounded-lg px-3 py-2.5 mt-2 text-sm"
                  value={editCity}
                  name="city"
                  onChange={(e) => {
                    setEditCity(e.target.value);
                    setDistricts([]);
                    setCommunes([]);
                  }}
                >
                  <option value="0">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Quận/Huyện <b className="text-red-500">*</b>
                </p>
                <select
                  id="district-town"
                  class="w-full border rounded-lg px-3 py-2.5 mt-2 text-sm disabled:cursor-not-allowed"
                  name="district"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  disabled={districts.length === 0}
                >
                  <option value="0">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Xã <b className="text-red-500">*</b>
                </p>
                <select
                  id="ward-commune"
                  class="w-full border rounded-lg px-3 py-2.5 text-sm mt-2 disabled:cursor-not-allowed"
                  name="ward"
                  value={editCommune}
                  disabled={communes.length === 0}
                  onChange={(e) => setEditCommune(e.target.value)}
                >
                  <option value="0">Chọn xã</option>
                  {communes.map((commune) => (
                    <option key={commune.code} value={commune.code}>
                      {commune.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Đường <b className="text-red-500">*</b>
                </p>
                <input
                  type="text"
                  className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                  placeholder="VD: Số 81, đường số 6"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button
                className="px-6 py-2 rounded bg-[#a93f15] text-white font-bold mt-6"
                onClick={handleUpdateUserAddress}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openAddAddressModal}
        size="lg"
        onClose={() => {
          setOpenAddAddressModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-bold">
              Thêm mới thông tin giao hàng
            </h3>
            <div className="flex flex-col gap-5 mb-4">
              <div>
                <p className="text-base">
                  Số điện thoại <b className="text-red-500">*</b>
                </p>
                <input
                  className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                ></input>
              </div>
              <div>
                <p className="text-base">
                  Tỉnh/Thành phố <b className="text-red-500">*</b>
                </p>
                <select
                  id="city-province"
                  class="w-[100%] border rounded-lg px-3 py-2.5 mt-2 text-sm"
                  name="city"
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setDistricts([]);
                    setCommunes([]);
                  }}
                >
                  <option value="0">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Quận/Huyện <b className="text-red-500">*</b>
                </p>
                <select
                  id="district-town"
                  class="w-full border rounded-lg px-3 py-2.5 mt-2 text-sm disabled:cursor-not-allowed"
                  name="district"
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={districts.length === 0}
                >
                  <option value="0">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Xã <b className="text-red-500">*</b>
                </p>
                <select
                  id="ward-commune"
                  class="w-full border rounded-lg px-3 py-2.5 text-sm mt-2 disabled:cursor-not-allowed"
                  name="ward"
                  disabled={communes.length === 0}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                >
                  <option value="0">Chọn xã</option>
                  {communes.map((commune) => (
                    <option key={commune.code} value={commune.code}>
                      {commune.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base">
                  Đường <b className="text-red-500">*</b>
                </p>
                <input
                  type="text"
                  className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                  placeholder="VD: Số 81, đường số 6"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button
                className="px-6 py-2 rounded bg-[#a93f15] text-white font-bold mt-6"
                onClick={handleAddUserAddress}
              >
                Thêm mới
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Checkout;
