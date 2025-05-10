import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const baseURL = "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(async (req) => {
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");

  const requiresAuth = req.requiresAuth !== false;

  if (!requiresAuth) {
    return req;
  }

  if (accessToken) {
    const user = jwtDecode(accessToken);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) {
      req.headers.Authorization = `Bearer ${accessToken}`;
      return req;
    }
  }

  try {
    const response = await axios.post(
      `${baseURL}/auth/refreshToken`,
      { refreshToken },
      { withCredentials: true }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data.data;

    Cookies.set("accessToken", newAccessToken);
    Cookies.set("refreshToken", newRefreshToken);

    req.headers.Authorization = `Bearer ${newAccessToken}`;
    return req;
  } catch (err) {
    console.log(err);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    return req;
  }
});

export default instance;
