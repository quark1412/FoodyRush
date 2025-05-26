import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../services/axiosConfig";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../stores/cart";
import {
  getProductVariantById,
  getProductVariantByProductInfo,
} from "../data/productVariant";
import {
  createShoppingCart,
  deleteShoppingCartById,
  getShoppingCartByUserId,
  getShoppingCartByUserIdProductVariantId,
  updateShoppingCartQuantityById,
} from "../data/shoppingCart";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    permission: null,
    isAuth: false,
  });
  const [user, setUser] = useState();
  const carts = useSelector((state) => state.cart.items);
  const [hasError, setHasError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signup = async (email, fullName, phone, password) => {
    try {
      const response = await instance.post(
        "/auth/signup",
        { email, fullName, phone, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Đăng ký thành công", { duration: 2000 });
      const id = response.data.data._id;
      const sendMailResponse = await toast.promise(
        instance.post(
          "/auth/sendMailVerifyAccount",
          {
            email: email,
            id: id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Đang gửi email xác thực...",
          success: "Email xác thực được gửi thành công",
          error: "Gửi email xác thực thất bại",
        }
      );
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra", {
        duration: 2000,
      });
    }
  };

  const createCart = async (currentCarts) => {
    const user = Cookies.get("user");
    try {
      const previousCarts = await getShoppingCartByUserId(user.id);

      const enrichedPreviousCarts = await Promise.all(
        previousCarts.map(async (item) => {
          const variantDetails = item.productVariantId;
          return {
            ...item,
            productId: variantDetails.productId,
            color: variantDetails.color,
            size: variantDetails.size,
          };
        })
      );

      const addedItems = currentCarts.filter(
        (currentItem) =>
          !enrichedPreviousCarts.some(
            (prevItem) =>
              prevItem.productId === currentItem.productId &&
              prevItem.color === currentItem.color &&
              prevItem.size === currentItem.size
          )
      );

      const deletedItems = enrichedPreviousCarts.filter(
        (prevItem) =>
          !currentCarts.some(
            (currentItem) =>
              currentItem.productId === prevItem.productId &&
              currentItem.color === prevItem.color &&
              currentItem.size === prevItem.size
          )
      );

      const updatedItems = currentCarts.filter((currentItem) => {
        const matchingItem = enrichedPreviousCarts.find(
          (prevItem) =>
            prevItem.productId === currentItem.productId &&
            prevItem.color === currentItem.color &&
            prevItem.size === currentItem.size
        );
        return matchingItem && matchingItem.quantity !== currentItem.quantity;
      });

      const promises = [];

      console.log({ addedItems, deletedItems, updatedItems });

      addedItems.forEach((item) => {
        promises.push(
          getProductVariantByProductInfo(
            item.productId,
            item.color,
            item.size
          ).then((variantResponse) => {
            console.log(variantResponse);
            createShoppingCart(variantResponse._id, item.quantity);
          })
        );
      });

      deletedItems.forEach((item) => {
        promises.push(deleteShoppingCartById(item._id));
      });

      updatedItems.forEach((item) => {
        const matchedCart = enrichedPreviousCarts.find(
          (prevItem) =>
            prevItem.productId === item.productId &&
            prevItem.color === item.color &&
            prevItem.size === item.size
        );

        console.log(matchedCart);

        if (matchedCart) {
          promises.push(
            updateShoppingCartQuantityById(matchedCart._id, item.quantity)
          );
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.log(error);
      toast.error("Đồng bộ giỏ hàng thất bại");
    }
  };

  const logout = async () => {
    try {
      let refreshToken = Cookies.get("refreshToken");
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
      const response = await instance.post(
        "/auth/logout",
        {
          refreshToken: refreshToken,
        },
        { requiresAuth: true }
      );
      if (response.status === 200) {
        setAuth({ permission: null, isAuth: false });
        setUser(null);
        await createCart(carts);
        dispatch(clearCart());
        Cookies.remove("carts");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("permission");
        toast.success("Đăng xuất thành công", { duration: 2000 });
        navigate("/login");
        Cookies.remove("user");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Đăng xuất thất bại", {
        duration: 2000,
      });
    }
  };

  const contextData = {
    user: user,
    setAuth: setAuth,
    auth: auth,
    setUser: setUser,
    signup: signup,
    logout: logout,
    createCart: createCart,
    hasError: hasError,
    setHasError: setHasError,
  };

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      setUser(jwtDecode(accessToken));
      setAuth((prevAuth) => ({
        ...prevAuth,
        isAuth: true,
      }));
    } else {
      setUser(null);
      setAuth((prevAuth) => ({
        ...prevAuth,
        isAuth: false,
      }));
    }
  }, []);

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
