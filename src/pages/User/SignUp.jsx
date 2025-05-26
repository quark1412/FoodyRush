import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckBox from "../../components/CheckBox";
import AuthContext from "../../context/AuthContext";
import toast from "react-hot-toast";

function SignUp() {
  const { signup, auth } = useContext(AuthContext);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAndConditions, setTermsAndConditions] = useState(false);

  const navigate = useNavigate();
  if (auth.isAuth) {
    navigate("/");
    return null;
  }
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setTermsAndConditions(!termsAndConditions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordPattern =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (
      !data.fullName ||
      !data.email ||
      !data.phone ||
      !data.password ||
      !data.confirmPassword
    ) {
      toast.error("Vui lòng điền vào các trường", { duration: 2000 });
      return;
    }
    if (!passwordPattern.test(data.password)) {
      toast.error(
        "Mật khẩu cần ít nhất 8 kí tự, chứa ít nhất 1 số và 1 kí tự đặc biệt",
        {
          duration: 2000,
        }
      );
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Mật khẩu không trùng khớp", { duration: 2000 });
      return;
    }
    if (!termsAndConditions) {
      toast.error(
        "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư",
        {
          duration: 2000,
        }
      );
      return;
    }
    try {
      const response = await signup(
        data.email,
        data.fullName,
        data.phone,
        data.password
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra", {
        duration: 2000,
      });
    }
  };

  return (
    <div className="items-center h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-28">
        <p className="font-semibold text-3xl">Đăng ký</p>
        <form onSubmit={handleSubmit}>
          <div className="flex-1 mt-4">
            <p className="font-medium text-base">
              Họ và tên <b className="text-red-500">*</b>
            </p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%] "
              placeholder="Nhập họ và tên"
              name="fullName"
              type="text"
              value={data.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="mt-4 flex flex-row gap-x-5">
            <div className="flex-1">
              <p className="font-medium text-base">
                Email <b className="text-red-500">*</b>
              </p>
              <input
                className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                placeholder="Nhập email"
                name="email"
                type="email"
                value={data.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-base">
                Số điện thoại <b className="text-red-500">*</b>
              </p>
              <input
                className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
                placeholder="Nhập số điện thoại"
                name="phone"
                type="text"
                value={data.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-base">
              Mật khẩu <b className="text-red-500">*</b>
            </p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
            />
          </div>
          <div className="mt-4">
            <p className="font-medium text-base">
              Xác nhận mật khẩu <b className="text-red-500">*</b>
            </p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              type="password"
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="mt-4 flex-row gap-x-3 items-center flex">
            <CheckBox
              isChecked={termsAndConditions}
              onChange={handleCheckboxChange}
            />
            <p className="text-base">
              Tôi đồng ý với{" "}
              <u className="cursor-pointer">Điều khoản dịch vụ</u> và{" "}
              <u className="cursor-pointer">Chính sách quyền riêng tư</u>
            </p>
          </div>
          <button
            type="submit"
            className="bg-[#a93f15] w-[100%] py-3 rounded-lg mt-4 text-white font-semibold text-lg"
          >
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-center">
          Đã có tài khoản?{" "}
          <Link to="/login">
            <u className="text-[#a93f15]">Đăng nhập</u>
          </Link>
        </p>
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

export default SignUp;
