import { useContext } from "react";
import { Link, useNavigate, useRouteError } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Cookies from "js-cookie";
import {
  ADMIN_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "../utils/Constants";
export default function Error({
  errorCode = "404",
  title = "Not Found",
  content = "Không tìm thấy tài nguyên hay trang",
}) {
  const navigate = useNavigate();
  const { setHasError, setAuth } = useContext(AuthContext);
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const handleCheckRole = async () => {
    if (!user) {
      setHasError(false);
      navigate("/");
      return;
    }

    const role = user.roleName;
    if (role === "Admin") {
      setHasError(false);
      navigate("/admin/dashboard");
    } else if (role === "Employee") {
      setHasError(false);
      navigate("/admin/orders");
    } else {
      setHasError(false);
      navigate("/");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.5 9.375C13.3288 9.375 14.1237 9.70424 14.7097 10.2903C15.2958 10.8763 15.625 11.6712 15.625 12.5V14.75L23.2833 12.8333C32.6912 10.4811 42.6303 11.5718 51.3042 15.9083L51.7542 16.1333C58.9465 19.73 67.1722 20.6913 75 18.85L87.9583 15.8C88.4443 15.686 88.9506 15.6901 89.4347 15.812C89.9188 15.9338 90.3666 16.1698 90.7407 16.5003C91.1149 16.8308 91.4044 17.2461 91.5851 17.7114C91.7657 18.1768 91.8323 18.6786 91.7792 19.175C90.2286 33.4905 90.2356 47.9319 91.8 62.2458C91.8833 63.0046 91.6861 63.7676 91.2455 64.3908C90.8049 65.0141 90.1514 65.4546 89.4083 65.6292L76.4333 68.6833C67.1817 70.8608 57.4594 69.7255 48.9583 65.475L48.5083 65.25C41.1696 61.5802 32.7603 60.6565 24.8 62.6458L15.625 64.9375V87.5C15.625 88.3288 15.2958 89.1237 14.7097 89.7097C14.1237 90.2958 13.3288 90.625 12.5 90.625C11.6712 90.625 10.8763 90.2958 10.2903 89.7097C9.70424 89.1237 9.375 88.3288 9.375 87.5V12.5C9.375 12.0896 9.45583 11.6833 9.61288 11.3041C9.76992 10.925 10.0001 10.5805 10.2903 10.2903C10.5805 10.0001 10.925 9.76992 11.3041 9.61288C11.6833 9.45583 12.0896 9.375 12.5 9.375Z"
          fill="black"
        />
      </svg>
      <h1 className="font-medium text-4xl mt-10 text-center">
        Lỗi {errorCode}
        <br />
        {title}
      </h1>
      <p className="mt-8 mb-14 ml-auto mr-auto max-w-96 text-center text-[#9E9E9E]">
        {content}
      </p>
      <button
        onClick={() => {
          handleCheckRole();
        }}
        className="px-6 py-3 text-white font-medium text-xs bg-black rounded-lg"
      >
        Quay về
      </button>
    </div>
  );
}
