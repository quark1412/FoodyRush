import { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import AuthContext from "../../context/AuthContext";
import Error from "../Error";
import { mergeCart } from "../../stores/cart";
import instance from "../../services/axiosConfig";
import {
  ADMIN_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "../../utils/Constants";
import { getUserRoleById } from "../../data/userRoles";
import { getShoppingCartByUserId } from "../../data/shoppingCart";
import { getProductVariantById } from "../../data/productVariant";
import { useDispatch } from "react-redux";
import axios from "axios";

const EmailVerify = () => {
  const { setAuth, setUser, setHasError } = useContext(AuthContext);
  const [validUrl, setValidUrl] = useState(true);
  const [redirectTimer, setRedirectTimer] = useState(3);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [error, setError] = useState(null);
  const param = useParams();
  const id = param.id;
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasRunRef = useRef();

  const mergeUserCart = async (userId) => {
    try {
      const userCartData = await getShoppingCartByUserId(userId);
      if (userCartData) {
        const data = await Promise.all(
          userCartData.map(async (cart) => {
            const variant = await getProductVariantById(cart.productVariantId);
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

  const verifyEmailUrl = async () => {
    try {
      const response = await instance.get(`/auth/verifyAccount/${id}`, {
        requiresAuth: false,
      });
      const { refreshToken, accessToken } = response.data.data;
      const user = jwtDecode(accessToken);
      const role = user.roleName;

      setUser(user);
      setAuth((prevAuth) => ({
        ...prevAuth,
        isAuth: true,
      }));
      Cookies.set("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken);
      Cookies.set("user", JSON.stringify(user));
      setValidUrl(true);
      setHasError(false);

      if (role === "Customer") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: CUSTOMER_PERMISSIONS,
        }));
        Cookies.set("permission", CUSTOMER_PERMISSIONS);
        // await mergeUserCart(user.id);
      } else if (role === "Admin") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: ADMIN_PERMISSIONS,
        }));
        Cookies.set("permission", ADMIN_PERMISSIONS);
      } else if (role === "Employee") {
        setAuth((prevAuth) => ({
          ...prevAuth,
          permission: EMPLOYEE_PERMISSIONS,
        }));
        Cookies.set("permission", EMPLOYEE_PERMISSIONS);
      }

      setShouldRedirect(true);
    } catch (error) {
      console.log(error);
      setError(error);
      setValidUrl(false);
    }
  };

  useEffect(() => {
    if (!hasRunRef.current) {
      verifyEmailUrl();
      hasRunRef.current = true;
    }
  }, [id]);

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setInterval(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        const state = location.state;
        if (state && state.orderSummary) {
          navigate("/checkout", {
            state: { orderSummary: state.orderSummary },
          });
        } else {
          const user = JSON.parse(Cookies.get("user"));
          if (user.roleName === "Admin") navigate("/admin");
          else if (user.roleName === "Employee") navigate("/admin/orders");
          else navigate("/");
        }
      }, 3000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [shouldRedirect]);

  return validUrl && !error ? (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 28.9004V57.5004C5 60.1526 6.05357 62.6961 7.92893 64.5715C9.8043 66.4468 12.3478 67.5004 15 67.5004H65C67.6522 67.5004 70.1957 66.4468 72.0711 64.5715C73.9464 62.6961 75 60.1526 75 57.5004V28.9004L45.24 47.2104C43.6641 48.1799 41.8502 48.6932 40 48.6932C38.1498 48.6932 36.3359 48.1799 34.76 47.2104L5 28.9004Z"
          fill="black"
        />
        <path
          d="M75 23.0267V22.5C75 19.8478 73.9464 17.3043 72.0711 15.4289C70.1957 13.5536 67.6522 12.5 65 12.5H15C12.3478 12.5 9.8043 13.5536 7.92893 15.4289C6.05357 17.3043 5 19.8478 5 22.5V23.0267L37.38 42.9533C38.1679 43.4381 39.0749 43.6947 40 43.6947C40.9251 43.6947 41.8321 43.4381 42.62 42.9533L75 23.0267Z"
          fill="black"
        />
      </svg>

      <h1 className="font-medium text-4xl mt-8 text-center">
        <p className="mt-2">Địa chỉ email của bạn đã được xác thực</p>
      </h1>
      <p className="mt-8 mb-14 ml-auto mr-auto max-w-96 text-center text-[#9E9E9E]">
        Chuyển hướng đến Trang chủ trong {redirectTimer}s...
      </p>
    </div>
  ) : (
    <Error
      errorCode={error.status}
      title={"Có vẻ như đã có lỗi xảy ra."}
      content="Đừng lo lắng, đội ngũ của chúng tôi đã xử lý. Vui lòng thử làm mới trang hoặc quay lại sau."
    />
  );
};

export default EmailVerify;
