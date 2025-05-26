import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import Cookies from "js-cookie";

import toast from "react-hot-toast";
import instance from "../services/axiosConfig";

export default function PasswordManager() {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordPattern =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Vui lòng điền vào các trường", { duration: 2000 });
      return;
    }
    if (!passwordPattern.test(newPassword)) {
      toast.error(
        "Mật khẩu cần ít nhất 8 kí tự, chứa ít nhất 1 số và 1 kí tự đặc biệt",
        { duration: 2000 }
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu không trùng khớp", { duration: 2000 });
      return;
    }

    try {
      const response = await instance.post(
        `/auth/resetPassword`,
        {
          password: currentPassword,
          newPassword: newPassword,
        },
        { requiresAuth: true }
      );

      if (response.status === 200) {
        toast.success("Cập nhật mật khẩu thành công", { duration: 2000 });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra", {
        duration: 2000,
      });
    }
  };

  return (
    <div className="w-[600px] mb-20">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-base font-semibold mb-1">
            Mật khẩu <b className="text-red-500">*</b>
          </label>
          <input
            type="password"
            className="px-5 py-3 text-sm font-medium border rounded-lg w-full"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-semibold mb-1">
            Mật khẩu mới <b className="text-red-500">*</b>
          </label>
          <input
            type="password"
            className="px-5 py-3 text-sm font-medium border rounded-lg w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-semibold mb-1">
            Xác nhận mật khẩu mới <b className="text-red-500">*</b>
          </label>
          <input
            type="password"
            className="px-5 py-3 text-sm font-medium border rounded-lg w-full"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#a93f15] text-white mt-3 font-semibold px-8 text-sm py-3 rounded-lg"
        >
          Cập nhật mật khẩu
        </button>
      </form>
    </div>
  );
}
