import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getReviewResponseByReviewId = async (reviewId) => {
  try {
    const response = await instance.get(
      `/reviewResponse/reviewId/${reviewId}`,
      { requiresAuth: false }
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createReviewResponse = async (reviewId, content) => {
  try {
    const response = await instance.post("/reviewResponse", {
      reviewId: reviewId,
      content: content,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
