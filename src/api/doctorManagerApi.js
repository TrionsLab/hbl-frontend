import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

// ✅ Get all doctors
export const getDoctors = async () => {
  const res = await axios.get(`${API_BASE}/api/doctors`);
  return res.data.data;
};

// ✅ Get a doctor by ID
export const getDoctorById = async (id) => {
  const res = await axios.get(`${API_BASE}/api/doctors/${id}`);
  return res.data.data;
};

// ✅ Add new doctor
export const addDoctor = async (doctor) => {
  const res = await axios.post(`${API_BASE}/api/doctors`, doctor);
  return res.data.data;
};

// ✅ Update doctor by ID
export const updateDoctor = async (id, doctor) => {
  const res = await axios.put(`${API_BASE}/api/doctors/${id}`, doctor);
  return res.data.data;
};

// ✅ Delete doctor by ID
export const deleteDoctor = async (id) => {
  const res = await axios.delete(`${API_BASE}/api/doctors/${id}`);
  return res.data.data;
};
