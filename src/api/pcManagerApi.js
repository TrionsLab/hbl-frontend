import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE;

// ✅ Get all PCs
export const getPCs = async () => {
  const res = await axios.get(`${API_BASE}/api/primary-care`);
  return res;
};

// ✅ Get a PC by ID
export const getPCById = async (id) => {
  const res = await axios.get(`${API_BASE}/api/primary-care/${id}`);
  return res;
};

// ✅ Add new PC
export const addPC = async (pc) => {
  const res = await axios.post(`${API_BASE}/api/primary-care`, pc);
  return res;
};

// ✅ Update PC by ID
export const updatePC = async (id, pc) => {
  const res = await axios.put(`${API_BASE}/api/primary-care/${id}`, pc);
  return res;
};

// ✅ Delete PC by ID
export const deletePC = async (id) => {
  const res = await axios.delete(`${API_BASE}/api/primary-care/${id}`);
  return res;
};
