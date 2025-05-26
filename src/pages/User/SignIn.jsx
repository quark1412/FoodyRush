import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Toaster, toast } from "react-hot-toast";

import AuthContext from "../../context/AuthContext";
import CheckBox from "../../components/CheckBox";
import { jwtDecode } from "jwt-decode";
import instance from "../../services/axiosConfig";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../../stores/cart";
import { getShoppingCartByUserId } from "../../data/shoppingCart";
import { getProductVariantById } from "../../data/productVariant";
import { getUserRoleById } from "../../data/userRoles";
import {
  ADMIN_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "../../utils/Constants";

function SignIn() {
  const { setUser, auth, setAuth, setHasError } = useContext(AuthContext);
  const navigate = useNavigate();
  const carts = useSelector((state) => state.cart.items);
  const [userCart, setUserCart] = useState([]);
  const dispatch = useDispatch();
  const location = useLocation();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  if (auth.isAuth) {
    navigate("/");
  }

  const mergeUserCart = async (userId) => {
    try {
      const userCartData = await getShoppingCartByUserId(userId);
      if (userCartData) {
        const data = await Promise.all(
          userCartData.map(async (cart) => {
            const variant = cart.productVariantId;
            const productId = variant.productId;
            const size = variant.size;
            const quantity = cart.quantity;
            return { productId, size, quantity };
          })
        );
        dispatch(mergeCart(data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await instance.post(
        "/auth/login",
        { email, password },
        { requiresAuth: false }
      );
      toast.success("Đăng nhập thành công", { duration: 1000 });
      const { accessToken, refreshToken, ...data } = response.data.data;

      setUser(jwtDecode(accessToken));
      setAuth((prevAuth) => ({
        ...prevAuth,
        isAuth: true,
      }));

      Cookies.set("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken);
      Cookies.set("user", JSON.stringify(jwtDecode(accessToken)));

      return Promise.resolve();
    } catch (error) {
      setAuth((prevAuth) => ({
        ...prevAuth,
        isAuth: false,
      }));
      if (error.status === 400) {
        toast.error("Tài khoản của bạn chưa được xác thực");
        const userId = error.response.data.data.userId;
        await toast.promise(
          instance.post(
            "/auth/sendMailVerifyAccount",
            {
              email: email,
              id: userId,
            },
            { requiresAuth: false }
          ),
          {
            loading: "Đang gửi email xác thực...",
            success: "Email xác thực được gửi thành công",
            error: "Gửi email xác thực thất bại",
          }
        );
      } else {
        toast.error(error.response.data.error);
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    window.open("http://localhost:8000/api/v1/auth/google", "_self");
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      toast.error("Vui lòng điền vào các trường", { duration: 2000 });
      return;
    }
    try {
      await login(data.email, data.password);
      const user = JSON.parse(Cookies.get("user"));
      const role = user.roleName;
      setHasError(false);
      if (role === "Customer") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: CUSTOMER_PERMISSIONS,
        }));
        Cookies.set("permission", CUSTOMER_PERMISSIONS);
        await mergeUserCart(user.id);
        const state = location.state;
        if (state && state.orderSummary) {
          navigate("/checkout", {
            state: { orderSummary: state.orderSummary },
          });
        } else {
          navigate("/");
        }
      } else if (role === "Admin") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: ADMIN_PERMISSIONS,
        }));
        Cookies.set("permission", ADMIN_PERMISSIONS);
        navigate("/admin");
      } else if (role === "Employee") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: EMPLOYEE_PERMISSIONS,
        }));
        Cookies.set("permission", EMPLOYEE_PERMISSIONS);
        navigate("/admin/orders");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("error")) {
      const errorType = urlParams.get("error");
      if (errorType === "auth") {
        toast.error("Xác thực thất bại. Vui lòng thử lại.", {
          duration: 2000,
        });
      }
    }
  });

  return (
    <div className="items-center h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-28">
        <p className="font-semibold text-3xl">Đăng nhập</p>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <p className="font-medium text-base">
              Email <b className="text-red-500">*</b>
            </p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
            ></input>
          </div>
          <div className="mt-4">
            <p className="font-medium text-base">
              Mật khẩu <b className="text-red-500">*</b>
            </p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
            ></input>
          </div>
          <div className="mt-4 flex flex-row items-center justify-between">
            <div className="flex-row gap-x-3 flex items-center"></div>
            <Link
              to="/forgotPassword"
              className="text-base text-[#a93f15] font-bold"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <button
            type="submit"
            className="bg-[#a93f15] w-[100%] py-3 rounded-lg mt-8 text-white font-semibold text-lg"
          >
            Đăng nhập
          </button>
        </form>

        <div className="flex flex-row justify-between items-center gap-x-10 mt-4">
          <div className="flex-1 h-[1px] bg-[#DEDEDE]"></div>
          <p className="text-[#818181]">hoặc đăng nhập với</p>
          <div className="flex-1 h-[1px] bg-[#DEDEDE]"></div>
        </div>
        <button
          className="mt-4 border border-[#0A0A0A] w-[100%] flex items-center justify-center py-3 rounded-lg"
          onClick={loginWithGoogle}
        >
          <div className="flex flex-row gap-x-3 items-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M29.0743 13.3887H28.0003V13.3333H16.0003V18.6667H23.5357C22.4363 21.7713 19.4823 24 16.0003 24C11.5823 24 8.00033 20.418 8.00033 16C8.00033 11.582 11.5823 8 16.0003 8C18.0397 8 19.895 8.76934 21.3077 10.026L25.079 6.25467C22.6977 4.03534 19.5123 2.66667 16.0003 2.66667C8.63699 2.66667 2.66699 8.63667 2.66699 16C2.66699 23.3633 8.63699 29.3333 16.0003 29.3333C23.3637 29.3333 29.3337 23.3633 29.3337 16C29.3337 15.106 29.2417 14.2333 29.0743 13.3887Z"
                fill="#FFC107"
              />
              <path
                d="M4.2041 9.79401L8.58477 13.0067C9.7701 10.072 12.6408 8.00001 16.0001 8.00001C18.0394 8.00001 19.8948 8.76934 21.3074 10.026L25.0788 6.25467C22.6974 4.03534 19.5121 2.66667 16.0001 2.66667C10.8788 2.66667 6.43743 5.55801 4.2041 9.79401Z"
                fill="#FF3D00"
              />
              <path
                d="M15.9999 29.3333C19.4439 29.3333 22.5732 28.0153 24.9392 25.872L20.8126 22.38C19.4291 23.4327 17.7383 24.0019 15.9999 24C12.5319 24 9.58722 21.7887 8.47788 18.7027L4.12988 22.0527C6.33655 26.3707 10.8179 29.3333 15.9999 29.3333Z"
                fill="#4CAF50"
              />
              <path
                d="M29.074 13.3887H28V13.3333H16V18.6667H23.5353C23.0095 20.1443 22.0622 21.4354 20.8107 22.3807L20.8127 22.3793L24.9393 25.8713C24.6473 26.1367 29.3333 22.6667 29.3333 16C29.3333 15.106 29.2413 14.2333 29.074 13.3887Z"
                fill="#1976D2"
              />
            </svg>
            <p className="font-medium text-[#a93f15]">Đăng nhập với Google</p>
          </div>
        </button>
        <p className="mt-4 text-center">
          Chưa có tài khoản?{" "}
          <Link to="/signup">
            <u className="text-[#a93f15]">Đăng ký</u>
          </Link>
        </p>
      </div>
      <div className="flex-1">
        <img
          className="object-cover w-full max-h-screen"
          src={require("../../assets/images/bg.jpg")}
        ></img>
      </div>
    </div>
  );
}

export default SignIn;
