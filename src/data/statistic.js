import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getStatistics = async (day, month, year) => {
  // const refreshToken = Cookies.get("refreshToken");
  try {
    // const tokenResponse = await instance.post(
    //   "/auth/refreshToken",
    //   {
    //     refreshToken: refreshToken,
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    // const accessToken = tokenResponse.data.data.accessToken;
    // Cookies.remove("refreshToken");
    // Cookies.set("refreshToken", tokenResponse.data.data.refreshToken);

    const params = new URLSearchParams();

    if (day) {
      params.append("day", day);
    }

    if (month) {
      params.append("month", month);
    }

    if (year) {
      params.append("year", year);
    }

    const response = await instance.get(`/statistic?${params.toString()}`, {
      requireAuth: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
