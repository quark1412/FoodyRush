import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getRelatedProducts = async () => {
  try {
    const response = await instance.get("/recommendation", {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
