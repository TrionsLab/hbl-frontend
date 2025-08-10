import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export const getDeletedBills = async () => {
  const response = await axios.get(`${API_BASE}/api/deleted-bills`);
  return response.data;
};

export const deleteFromArchive = async (id) => {
  const response = await axios.delete(`${API_BASE}/api/deleted-bills/${id}`);
  return response.data;
};
