import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export const createBill = async (billData) => {
  const response = await axios.post(`${API_BASE}/api/bills`, billData);
  return response.data;
};

export const clearBillDue = async (id, billData) => {
  const response = await axios.put(`${API_BASE}/api/bills/${id}/clear-due`, billData);
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await axios.delete(`${API_BASE}/api/bills/${id}`);
  return response.data;
};

export const fetchBillsByDate = async (date) => {
  const response = await axios.get(`${API_BASE}/api/bills?date=${date}`);
  return response.data;
};

export const fetchMonthlyStats = async (month) => {
  const response = await axios.get(`${API_BASE}/api/bills/stats?month=${month}`);
  return response.data;
};
