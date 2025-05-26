import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getOrderTrackingByOrderId = async (orderId) => {
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
    const response = await instance.get(`/orderTracking/${orderId}`, {
      // headers: {
      //   Authorization: `Bearer ${accessToken}`,
      // },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createOrderTracking = async (
  orderId,
  status,
  currentAddress,
  expectedDeliveryDate
) => {
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
    const response = await instance.post(
      `/orderTracking`,
      {
        orderId: orderId,
        status: status,
        currentAddress: currentAddress,
        expectedDeliveryDate: expectedDeliveryDate,
      }
      // {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
