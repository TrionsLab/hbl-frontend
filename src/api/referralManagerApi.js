import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;

export const getReferences = async () => {
  const res = await axios.get(`${API_BASE}/api/pc-doc-ref`);
  return res.data;
};

export const addReference = async (data) => {
  return await axios.post(`${API_BASE}/api/pc-doc-ref/add-ref`, data);
};

export const deleteReference = async (id) => {
  return await axios.delete(`${API_BASE}/api/pc-doc-ref/delete-ref${id}`);
};

export const updateReference = async (id, data) => {
  return await axios.put(`${API_BASE}/api/pc-doc-ref/update-ref${id}`, data);
};
