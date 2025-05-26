import instance from "../services/axiosConfig";
import Cookies from "js-cookie";

export const getAllUsers = async () => {
  try {
    const response = await instance.get("/user", { requiresAuth: true });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await instance.get(`/user/${id}`, { requiresAuth: false });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (
  email,
  fullName,
  phone,
  password,
  roleName
) => {
  try {
    const response = await instance.post(
      "/user",
      {
        email: email,
        fullName: fullName,
        phone: phone,
        password: password,
        roleName: roleName,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserById = async (id, fullName, phone, roleId) => {
  try {
    const response = await instance.put(
      `/user/${id}`,
      {
        fullName: fullName,
        phone: phone,
        roleId: roleId,
      },
      { requiresAuth: true }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const archiveUserById = async (id) => {
  try {
    const response = await instance.put(`/user/archive/${id}`, {
      requiresAuth: true,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
