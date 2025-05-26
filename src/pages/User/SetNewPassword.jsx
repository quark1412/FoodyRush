import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import instance from "../../services/axiosConfig";

function SetNewPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshToken } = location.state;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    const passwordPattern =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!password || !confirmPassword) {
      toast.error("Vui lòng điền vào các trường", { duration: 2000 });
      return;
    }

    if (!passwordPattern.test(password)) {
      toast.error(
        "Mật khẩu cần ít nhất 8 kí tự, chứa ít nhất 1 số và 1 kí tự đặc biệt",
        {
          duration: 2000,
        }
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không trùng khớp", { duration: 2000 });
      return;
    }

    try {
      const tokenResponse = await instance.post(
        "/auth/refreshToken",
        { refreshToken: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const accessToken = tokenResponse.data.data.accessToken;
      const response = await instance.post(
        "/auth/forgotPassword",
        {
          newPassword: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Đặt lại mật khẩu thành công!", { duration: 2000 });
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra", {
        duration: 2000,
      });
    }
  };

  return (
    <div className="items-center h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-28">
        <p className="font-semibold text-3xl">Đặt mật khẩu mới</p>
        <div className="mt-8">
          <p className="font-medium text-base">
            Mật khẩu <b className="text-red-500">*</b>
          </p>
          <input
            className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div className="mt-4">
          <p className="font-medium text-base">
            Xác nhận mật khẩu <b className="text-red-500">*</b>
          </p>
          <input
            className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></input>
        </div>
        <button
          className="bg-[#a93f15] w-[100%] py-3 rounded-lg mt-8 text-white font-semibold text-lg"
          onClick={handleResetPassword}
        >
          Đặt lại mật khẩu
        </button>
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

export default SetNewPassword;
