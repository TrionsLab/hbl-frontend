import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

import { getAuthHeaders } from "../helpers/authHelpers";

// ✅ Get all receptions
export const getReceptions = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/receptions`, {
      headers: getAuthHeaders(),
    });
    return response.data; // { message, data }
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch receptions"
    );
  }
};

// ✅ Create new reception
export const createReception = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/api/receptions`, data, {
      headers: getAuthHeaders(),
    });
    return response.data; // { message, data }
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to create reception"
    );
  }
};

// ✅ Update reception (with optional password reset)
export const updateReception = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE}/api/receptions/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to update reception"
    );
  }
};

// ✅ Delete reception
export const deleteReception = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/api/receptions/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete reception"
    );
  }
};
