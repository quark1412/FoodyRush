import { useLayoutEffect, useEffect, useContext } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Admin from "./pages/Admin/Admin";
import Report from "./pages/Admin/Report";
import Categories from "./pages/Admin/Categories";
import Dashboard from "./pages/Admin/Dashboard";
import Products from "./pages/Admin/AdminProducts";
import Users from "./pages/Admin/Users";
// import Sizes from "./pages/Admin/Sizes";
// import Colors from "./pages/Admin/Colors";
import AdminAccount from "./pages/Admin/Account";
import CreateProduct from "./pages/Admin/CreateProduct";

import Account from "./pages/User/Account";
import AuthSuccess from "./pages/User/AuthSuccess";
import Checkout from "./pages/User/Checkout";
import EmailVerify from "./pages/User/EmailVerify";
import ForgotPassword from "./pages/User/ForgotPassword";
import Home from "./pages/User/Home";
import OrderCompleted from "./pages/User/OrderCompleted";
import ProductDetails from "./pages/User/ProductDetails";
import SetNewPassword from "./pages/User/SetNewPassword";
import Shop from "./pages/User/Shop";
import ShoppingCart from "./pages/User/ShoppingCart";
import SignIn from "./pages/User/SignIn";
import SignUp from "./pages/User/SignUp";
import VerifyCode from "./pages/User/VerifyCode";

import Header from "./components/Header";
import AdminProductDetails from "./pages/Admin/AdminProductDetails";
import UpdateProduct from "./pages/Admin/AdminUpdateProduct";
import Orders from "./pages/Admin/Orders";
import Reviews from "./pages/Admin/Reviews";
import OrderDetails from "./pages/Admin/OrderDetails";
import UpdateOrder from "./pages/Admin/UpdateOrder";
import TrackOrder from "./pages/User/TrackOrder";
import Chatbot from "./components/Chatbot";
import AuthContext from "./context/AuthContext";
import AboutUs from "./pages/User/AboutUs";
import ContactUs from "./pages/User/ContactUs";
import Footer from "./components/Footer";
import EditAddress from "./pages/User/EditAddress";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasError } = useContext(AuthContext);
  const noHeaderRoutes = [
    "/login",
    "/signup",
    "/forgotPassword",
    "/verifyCode",
    "/verify",
    "/setPassword",
    "/admin",
  ];

  useLayoutEffect(() => {
    switch (location.pathname) {
      case "/products":
        document.title = "Menu";
        break;
      case "/login":
        document.title = "Đăng nhập";
        break;
      case "/signup":
        document.title = "Đăng ký";
        break;
      case "/verify":
        document.title = "Xác thực email";
        break;
      case "/cart":
        document.title = "Giỏ hàng";
        break;
      case "/checkout":
        document.title = "Thanh toán";
        break;
      case "/orderCompleted":
        document.title = "Hoàn tất đơn hàng";
        break;
      case "/account":
        document.title = "Tài khoản";
        break;
      case "/forgotPassword":
        document.title = "Quên mật khẩu";
        break;
      case "/verifyCode":
        document.title = "Xác thực mã";
        break;
      case "/setPassword":
        document.title = "Đặt lại mật khẩu";
        break;
      case "/admin/orders":
        document.title = "Đơn hàng";
        break;
      case "/admin/reviews":
        document.title = "Đánh giá";
        break;
      case "/admin/account":
        document.title = "Tài khoản";
        break;
      case "/admin/products":
        document.title = "Sản phẩm";
        break;
      case "/admin/users":
        document.title = "Người dùng";
        break;
      case "/admin/categories":
        document.title = "Danh mục";
        break;
      case "/admin/report":
        document.title = "Báo cáo";
        break;
      case "/admin/dashboard":
        document.title = "Dashboard";
        break;
      case "/aboutUs":
        document.title = "Giới thiệu";
        break;
      case "/contactUs":
        document.title = "Liên hệ";
        break;
      default:
        document.title = "FoodyRush";
    }
  }, [location]);

  const AdminRedirect = () => {
    const location = useLocation();
    return location.pathname === "/admin" ? (
      <Navigate to="/admin/dashboard" />
    ) : null;
  };

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isVerifyEmail = location.pathname.startsWith("/verify");

  return (
    <div>
      {!noHeaderRoutes.includes(location.pathname) &&
        !isAdminRoute &&
        !isVerifyEmail &&
        !hasError && <Header />}
      <AdminRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify/:id" element={<EmailVerify />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/products/details/:id" element={<ProductDetails />} />
        <Route path="/orderCompleted" element={<OrderCompleted />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verifyCode" element={<VerifyCode />} />
        <Route path="/trackOrder/:id" element={<TrackOrder />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/account/myOrders/editAddress/:id"
          element={<EditAddress />}
        />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/contactUs" element={<ContactUs />} />
        <Route path="/loginGoogle/success/*" element={<AuthSuccess />} />
        <Route path="/setPassword" element={<SetNewPassword />} />
        <Route
          path="/admin"
          element={
            <div className="admin">
              <Admin />
            </div>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="/admin/products/create" element={<CreateProduct />} />
          <Route
            path="/admin/products/details/:id"
            element={<AdminProductDetails />}
          />
          <Route
            path="/admin/products/update/:id"
            element={<UpdateProduct />}
          />
          <Route path="categories" element={<Categories />} />
          <Route path="report" element={<Report />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="/admin/orders/details/:id" element={<OrderDetails />} />
          <Route path="/admin/orders/update/:id" element={<UpdateOrder />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>
      </Routes>
      {!noHeaderRoutes.includes(location.pathname) &&
        !isAdminRoute &&
        !hasError && <Chatbot />}
      {!noHeaderRoutes.includes(location.pathname) &&
        !isAdminRoute &&
        !isVerifyEmail &&
        !hasError && <Footer />}
    </div>
  );
}

export default App;
