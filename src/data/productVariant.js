import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getProductVariantsByProductId = async (productId) => {
  try {
    const response = await instance.get(
      `/productVariant/productId/${productId}`,
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getProductVariantById = async (id) => {
  try {
    const response = await instance.get(`/productVariant/${id}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getProductVariantByProductInfo = async (
  productId,
  color,
  size
) => {
  try {
    const response = await instance.get(
      `/productVariant/get/productInfo?productId=${productId}&&color=${color}&&size=${size}`,
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createProductVariant = async (productId, size, quantity) => {
  try {
    const response = await instance.post(
      "/productVariant",
      {
        productId: productId,
        size: size,
        stock: quantity,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateProductVariant = async (id, productId, size, quantity) => {
  try {
    const response = await instance.put(
      `/productVariant/${id}`,
      {
        productId: productId,
        size: size,
        stock: quantity,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteProductVariant = async (id) => {
  try {
    const response = await instance.delete(`/productVariant/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteProductVariantsByProductId = async (id) => {
  try {
    const response = await instance.delete(
      `/productVariant/productId/${id}`,
      {}
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
