import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const createUserAddress = async (
  userId,
  city,
  district,
  commune,
  street,
  phone
) => {
  try {
    const response = await instance.post(
      `/userAddress`,
      {
        userId,
        city,
        district,
        commune,
        street,
        phone,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getUserAddressById = async (id) => {
  try {
    const response = await instance.get(`/userAddress/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getUserAddressByUserId = async () => {
  try {
    const response = await instance.get("/userAddress", { requiresAuth: true });
    return response.data.meta;
  } catch (error) {
    throw error;
  }
};

export const updateUserAddressById = async (
  id,
  city,
  district,
  commune,
  street,
  phone
) => {
  try {
    const response = await instance.put(
      `/userAddress/${id}`,
      { city, district, commune, street, phone },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
