import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";

import Banner from "../../components/Banner";
import PersonalInformation from "../PersonalInformation";
import PasswordManager from "../PasswordManager";
import MyOrders from "./MyOrders";
import Error from "../Error";

function Account() {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const [activeTab, setActiveTab] = useState("personal");
  const permission = Cookies.get("permission") ?? null;
  const { auth, setHasError } = useContext(AuthContext);

  const tabs = [
    { id: "personal", label: "Thông tin cá nhân" },
    { id: "orders", label: "Đơn hàng của tôi" },
    { id: "password", label: "Quản lý mật khẩu" },
  ];

  if (!permission || !permission.includes("ACCOUNT")) {
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
    <div className="mb-20">
      <Banner title="Tài khoản" route="Trang chủ / Tài khoản" />
      <div className="px-40 justify-center flex">
        <div className="flex flex-row gap-x-20 mt-10">
          <div className="flex flex-col gap-y-5 ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-lg py-3 px-6 text-left font-bold ${
                  activeTab === tab.id
                    ? "bg-[#a93f15] text-white"
                    : "bg-white text-[#a93f15] outline outline-1 outline-[#a93f15]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-[800px]">
            {activeTab === "personal" && <PersonalInformation user={user} />}
            {activeTab === "orders" && <MyOrders />}
            {activeTab === "password" && <PasswordManager />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
