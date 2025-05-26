import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getOrderAddressById = async (id) => {
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
    const response = await instance.get(`/orderAddress/${id}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderAddress = async (
  id,
  city,
  district,
  commune,
  phone,
  street
) => {
  try {
    // const refreshToken = Cookies.get("refreshToken");
    // const tokenResponse = await instance.post(
    //   "/auth/refreshToken",
    //   {
    //     refreshToken: refreshToken,
    //   },
    //   { headers: { "Content-Type": "application/json" } }
    // );
    // const accessToken = tokenResponse.data.data.accessToken;
    // Cookies.set("refreshToken", tokenResponse.data.data.refreshToken);
    const response = await instance.put(
      `/orderAddress/${id}`,
      {
        city: city,
        district: district,
        commune: commune,
        phone: phone,
        street: street,
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
