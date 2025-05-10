import { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Cookies from "js-cookie";

import SideBar from "../../components/SideBar";
import Error from "../Error";

import AuthContext from "../../context/AuthContext";

export default function Admin() {
  const { auth, hasError } = useContext(AuthContext);
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const handleCheckRole = async () => {
      if (!user) {
        setError({
          errorCode: 401,
          title: "Unauthorized",
          content: "Cần xác thực để truy cập trang này.",
        });
        return;
      }

      const role = user.roleName;
      if (role === "Admin" || role === "Employee") {
        setUserRole(role);
      } else {
        setError({
          errorCode: 403,
          title: "Forbidden",
          content: "Bạn không có quyền truy cập trang này.",
        });
      }
    };

    handleCheckRole();
  }, [auth, user]);

  if (error) {
    return <Error {...error} />;
  }

  return (
    <div className="bg-[#F9F9F9] flex flex-row admin-font h-screen">
      {!hasError && <SideBar userRole={userRole} />}
      <div className="overflow-y-auto flex-1">
        <Outlet />
      </div>
    </div>
  );
}
