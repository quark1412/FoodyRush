import { useState, useContext } from "react";
import Cookies from "js-cookie";
import AuthContext from "../../context/AuthContext";
import PersonalInformation from "../PersonalInformation";
import PasswordManager from "../PasswordManager";
import Error from "../Error";

export default function AdminAccount() {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const [activeTab, setActiveTab] = useState("personal");
  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const tabs = [
    { id: "personal", label: "Thông tin cá nhân" },
    { id: "password", label: "Quản lý mật khẩu" },
  ];

  if (!permission || !permission.includes("ADMIN_ACCOUNT")) {
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
    <div className="p-10 w-full">
      <p className="font-extrabold text-xl">Tài khoản</p>
      <div className="bg-white rounded-lg mt-10 p-6 shadow-md flex flex-col gap-y-5">
        <div className="flex flex-row gap-x-20 mt-10">
          <div className="flex flex-col gap-y-5 ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-lg py-3 px-6 font-bold text-left ${
                  activeTab === tab.id
                    ? "bg-[#a93f15] text-white"
                    : "bg-white text-[#a93f15] hover:bg-gray-100 outline outline-1 outline-[#a93f15]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-[800px]">
            {activeTab === "personal" && <PersonalInformation user={user} />}
            {activeTab === "password" && <PasswordManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
