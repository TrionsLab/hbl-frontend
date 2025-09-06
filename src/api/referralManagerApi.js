import axios from 'axios';
import { getAuthHeaders } from "../helpers/authHelpers";
const API_BASE = import.meta.env.VITE_API_BASE;

export const getReferences = async () => {
  const res = await axios.get(`${API_BASE}/api/pc-doc-ref`, { headers: getAuthHeaders() });
  return res.data;
};

export const addReference = async (data) => {
  return await axios.post(`${API_BASE}/api/pc-doc-ref/add-ref`, data, { headers: getAuthHeaders() });
};

export const deleteReference = async (id) => {
  return await axios.delete(`${API_BASE}/api/pc-doc-ref/delete-ref${id}`, { headers: getAuthHeaders() });
};

export const updateReference = async (id, data) => {
  return await axios.put(`${API_BASE}/api/pc-doc-ref/update-ref${id}`, data, { headers: getAuthHeaders() });
};
