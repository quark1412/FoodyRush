import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";

import toast from "react-hot-toast";
import instance from "../services/axiosConfig";
import { formatURL } from "../utils/format";
import { getUserById } from "../data/users";

export default function PersonalInformation({ user }) {
  const [data, setData] = useState({
    avatarPath: user?.avatarPath || "",
    avatarFile: null,
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    const originalData = {
      fullName: user.fullName,
      phone: user.phone,
      avatarPath: user.avatarPath,
    };

    const changesDetected =
      value !== originalData[name] ||
      (name === "avatarFile" && data.avatarFile !== null);

    setIsChanged(changesDetected);
  };

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, avatarPath: reader.result, avatarFile: file });
        setIsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const refreshToken = Cookies.get("refreshToken");
    try {
      const tokenResponse = await instance.post(
        "/auth/refreshToken",
        {
          refreshToken: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const accessToken = tokenResponse.data.data.accessToken;
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("phone", data.phone);
      if (data.avatarFile) {
        formData.append("avatarPath", data.avatarFile);
      }

      const response = await instance.put(`/user/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        toast.success("Cập nhật thông tin thành công", { duration: 2000 });
        setData({
          avatarPath:
            data.avatarPath instanceof File
              ? URL.createObjectURL(data.avatarFile)
              : data.avatarPath,
          fullName: data.fullName,
          phone: data.phone,
        });
        setIsChanged(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra", {
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      if (user && !isLoaded) {
        const userData = await getUserById(user.id);
        if (userData) {
          setData({
            avatarPath: userData.avatarPath || "",
            fullName: userData.fullName || "",
            phone: userData.phone || "",
          });
          setIsLoaded(true);
        }
      }
    };
    getUserData();
  }, [user, isLoaded]);

  return (
    <div className="w-[600px] mb-20">
      <div className="mb-6 relative w-24 h-24">
        <img
          src={formatURL(data?.avatarPath)}
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
        />
        <button
          type="button"
          onClick={handleImageClick}
          className="p-1 rounded-full absolute -bottom-1 -right-2"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="20"
              cy="20"
              r="19"
              fill="#a93f15"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M28.1574 11.2336L28.6491 11.7252C29.3266 12.4036 29.2241 13.6061 28.4183 14.4111L18.2791 24.5502L14.9941 25.7519C14.5816 25.9036 14.1799 25.7069 14.0983 25.3144C14.0707 25.172 14.0837 25.0248 14.1358 24.8894L15.3608 21.5761L25.4716 11.4644C26.2774 10.6594 27.4799 10.5552 28.1574 11.2336ZM17.8366 12.2419C17.946 12.2419 18.0544 12.2634 18.1555 12.3053C18.2566 12.3472 18.3485 12.4086 18.4258 12.486C18.5032 12.5634 18.5646 12.6552 18.6065 12.7563C18.6484 12.8574 18.6699 12.9658 18.6699 13.0752C18.6699 13.1847 18.6484 13.293 18.6065 13.3941C18.5646 13.4952 18.5032 13.5871 18.4258 13.6645C18.3485 13.7419 18.2566 13.8032 18.1555 13.8451C18.0544 13.887 17.946 13.9086 17.8366 13.9086H14.5033C14.0612 13.9086 13.6373 14.0842 13.3247 14.3967C13.0122 14.7093 12.8366 15.1332 12.8366 15.5752V25.5752C12.8366 26.0173 13.0122 26.4412 13.3247 26.7537C13.6373 27.0663 14.0612 27.2419 14.5033 27.2419H24.5033C24.9453 27.2419 25.3692 27.0663 25.6818 26.7537C25.9943 26.4412 26.1699 26.0173 26.1699 25.5752V22.2419C26.1699 22.0209 26.2577 21.8089 26.414 21.6526C26.5703 21.4964 26.7822 21.4086 27.0033 21.4086C27.2243 21.4086 27.4362 21.4964 27.5925 21.6526C27.7488 21.8089 27.8366 22.0209 27.8366 22.2419V25.5752C27.8366 26.4593 27.4854 27.3071 26.8603 27.9322C26.2352 28.5574 25.3873 28.9086 24.5033 28.9086H14.5033C13.6192 28.9086 12.7714 28.5574 12.1462 27.9322C11.5211 27.3071 11.1699 26.4593 11.1699 25.5752V15.5752C11.1699 14.6912 11.5211 13.8433 12.1462 13.2182C12.7714 12.5931 13.6192 12.2419 14.5033 12.2419H17.8366Z"
              fill="white"
            />
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-base font-semibold mb-1"
          >
            Họ và tên
          </label>
          <input
            name="fullName"
            value={data.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 border text-sm font-medium rounded-lg border-[#808191] focus:border-[#0A0A0A] focus:ring-[#0A0A0A]"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="phoneNumber"
            className="block text-base font-semibold mb-1"
          >
            Số điện thoại
          </label>
          <input
            name="phone"
            value={data.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border text-sm font-medium border-[#808191] rounded-lg focus:border-[#0A0A0A] focus:ring-[#0A0A0A]"
          />
        </div>
        <button
          type="submit"
          disabled={!isChanged}
          className="px-8 py-3 text-sm font-semibold text-white bg-[#a93f15] rounded-lg disabled:bg-[#a93f15]/50 disabled:cursor-not-allowed"
        >
          Cập nhật thay đổi
        </button>
      </form>
    </div>
  );
}
