import axios from "axios";
import { getAuthHeaders } from "../helpers/authHeaders";

const API_BASE = import.meta.env.VITE_API_BASE;

export const createTest = async (testData) => {
  const response = await axios.post(
    `${API_BASE}/api/tests`,
    testData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateTest = async (id, testData) => {
  const response = await axios.put(
    `${API_BASE}/api/tests/${id}`,
    testData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteTest = async (id) => {
  const response = await axios.delete(
    `${API_BASE}/api/tests/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchTests = async () => {
  const response = await axios.get(
    `${API_BASE}/api/tests`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
