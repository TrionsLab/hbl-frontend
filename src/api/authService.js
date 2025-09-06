import axios from "axios";
import { getAuthHeaders } from "../helpers/authHelpers";

const API_URL = "http://localhost:3000/api/auth";

export const register = async (userData) => {
  return await axios.post(`${API_URL}/register`, userData, { headers: getAuthHeaders() });
};

export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData, {
    withCredentials: true, // Required to send cookies  
  });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const logout = async () => {
  await axios.post(`${API_URL}/logout`, { withCredentials: true });
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  window.location.href = "/login"; 
};
