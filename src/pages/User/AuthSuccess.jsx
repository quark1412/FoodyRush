import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import instance from "../../services/axiosConfig";
import { mergeCart } from "../../stores/cart";
import {
  ADMIN_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "../../utils/Constants";
import { getShoppingCartByUserId } from "../../data/shoppingCart";
import { getProductVariantById } from "../../data/productVariant";
import { useDispatch } from "react-redux";
import { getUserRoleById } from "../../data/userRoles";

function AuthSuccess() {
  const { setUser, setAuth, setHasError } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const url = location.pathname;
      const token = url.split("success/")[1];

      try {
        const response = await instance.post(
          "http://localhost:8000/api/v1/auth/loginGoogleSuccess",
          {
            token,
          }
        );
        const { refreshToken, accessToken, ...data } = response.data.data;
        setAuth((prevAuth) => ({ ...prevAuth, isAuth: true }));
        Cookies.set("accessToken", accessToken);
        Cookies.set("refreshToken", refreshToken);
        Cookies.set("user", JSON.stringify(jwtDecode(accessToken)));
        const user = jwtDecode(accessToken);
        setUser(user);
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
      } catch (error) {
        toast.error(error?.response?.data?.message || "Có lỗi xảy ra", {
          duration: 2000,
        });
        navigate("/login");
      }
    };
    handleAuthSuccess();
  }, []);

  return <div></div>;
}

export default AuthSuccess;
