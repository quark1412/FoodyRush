import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getShoppingCartByUserId = async () => {
  try {
    const response = await instance.get("/shoppingCart", {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getShoppingCartById = async (id) => {
  try {
    const response = await instance.get(`/shoppingCart/${id}`, {
      requiresAuth: true,
    });
  } catch (error) {
    throw error;
  }
};

export const createShoppingCart = async (productVariantId, quantity) => {
  try {
    const response = await instance.post(
      "/shoppingCart",
      {
        productVariantId: productVariantId,
        quantity: quantity,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateShoppingCartQuantityById = async (id, quantity) => {
  try {
    const response = await instance.put(
      `/shoppingCart/${id}`,
      {
        quantity: quantity,
      },
      {
        requiresAuth: true,
      }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteShoppingCartById = async (id) => {
  try {
    const response = await instance.delete(`/shoppingCart/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
