import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getOrderDetailsByOrderId = async (orderId) => {
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
    // Cookies.set("refreshToken", tokenResponse.data.data.refreshToken);
    const response = await instance.get(`/orderDetail/orderId/${orderId}`, {
      // headers: {
      //   Authorization: `Bearer ${accessToken}`,
      // },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
