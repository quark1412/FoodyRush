import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getAllProducts = async (
  isActive,
  search,
  minPrice,
  maxPrice,
  sortName
) => {
  try {
    const params = new URLSearchParams();
    if (isActive === 1 || isActive === 0) {
      params.append("isActive", isActive);
    }

    // if (categoryId) {
    //   params.append("categoryId", categoryId);
    // }

    if (search) {
      params.append("search", search);
    }

    // if (page) {
    //   params.append("page", page);
    // }

    // if (limit) {
    //   params.append("limit", limit);
    // }

    if (minPrice) {
      params.append("minPrice", minPrice);
    }

    if (maxPrice) {
      params.append("maxPrice", maxPrice);
    }

    if (sortName) {
      params.append("sortName", sortName);
    }
    const response = await instance.get(`/product?${params.toString()}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getNewArrivalProducts = async () => {
  try {
    const response = await instance.get(
      "/product?sortBy=createdAt&sortOrder=desc",
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getBestSellerProducts = async () => {
  try {
    const response = await instance.get(
      "/product?sortby=soldQuantity&sortOrder=desc",
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await instance.get(`/product/${productId}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createProduct = async (
  name,
  description,
  categoryId,
  price,
  rating = 0
) => {
  try {
    const response = await instance.post(
      "/product",
      {
        name: name,
        description: description,
        categoryId: categoryId,
        price: price,
        rating: rating,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createProductImages = async (productId, images) => {
  try {
    const formData = new FormData();
    formData.append("productId", productId);

    images.forEach((image) => {
      if (image.imageFile) {
        formData.append("images", image.imageFile);
      }
    });

    const response = await instance.post("/product/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requiresAuth: true,
    });

    return response.data.data;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

export const deleteProductImageById = async (productId, publicId) => {
  try {
    const response = await instance.delete(
      `/product/images/${productId}/${publicId}`,
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateProduct = async (
  productId,
  name,
  description,
  categoryId,
  price,
  rating = 0
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
    const response = await instance.put(
      `/product/${productId}`,
      {
        name: name,
        description: description,
        categoryId: categoryId,
        price: price,
        rating: rating,
      },
      { requiresAuth: true }
      // {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const archiveProductById = async (id) => {
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
    const response = await instance.put(`/product/archive/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
