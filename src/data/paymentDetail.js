import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const createPaymentDetail = async (paymentMethod, status) => {
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
      "/paymentDetail",
      {
        paymentMethod: paymentMethod,
        status: status,
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

export const getPaymentDetailById = async (id) => {
  try {
    const response = await instance.get(`/paymentDetail/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updatePaymentDetailById = async (id, status) => {
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
    const response = await instance.put(
      `/paymentDetail/${id}`,
      {
        status: status,
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
