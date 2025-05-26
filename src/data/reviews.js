import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getAllReviews = async (
  isActive,
  status,
  rating,
  productId,
  userId,
  orderId
) => {
  try {
    const params = new URLSearchParams();

    if (isActive) {
      params.append("isActive", isActive);
    }

    if (status) {
      params.append("status", status);
    }

    if (rating) {
      params.append("rating", rating);
    }

    if (productId) {
      params.append("productId", productId);
    }

    if (userId) {
      params.append("userId", userId);
    }

    if (orderId) {
      params.append("orderId", orderId);
    }

    const response = await instance.get(`/review?${params.toString()}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getReviewsByProductId = async (productId) => {
  try {
    const response = await instance.get(`/review/productId/${productId}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getReviewById = async (id) => {
  try {
    const response = await instance.get(`/review/${id}`, {
      requiresAuth: false,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getReviewByProductIdAndUserId = async (productId) => {
  try {
    const response = await instance.get(
      `/review/${productId}/productIdAndUserId`,
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createReview = async (productId, rating, content, orderId) => {
  try {
    const response = await instance.post(
      "/review",
      {
        productId,
        rating,
        content,
        orderId,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const hideReview = async (id) => {
  try {
    const response = await instance.put(`/review/hide/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const unhideReview = async (id) => {
  try {
    const response = await instance.put(`/review/unhide/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (id, rating, content) => {
  try {
    const response = await instance.put(
      `/review/${id}`,
      {
        rating: rating,
        content: content,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createReviewResponse = async (reviewId, content) => {
  try {
    const response = await instance.post(
      "/review/response",
      {
        reviewId: reviewId,
        content: content,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
