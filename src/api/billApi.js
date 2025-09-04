import axios from "axios";
import { getAuthHeaders } from "../helpers/authHeaders";

const API_BASE = import.meta.env.VITE_API_BASE;

export const createBill = async (billData) => {
  const response = await axios.post(
    `${API_BASE}/api/bills`,
    billData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const clearBillDue = async (id, billData) => {
  const response = await axios.put(
    `${API_BASE}/api/bills/${id}/clear-due`,
    billData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await axios.delete(
    `${API_BASE}/api/bills/deleteBill/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
}


export const archiveBill = async (id) => {
  const response = await axios.put(
    `${API_BASE}/api/bills/${id}/archive`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const restoreBill = async (id) => {
  const response = await axios.put(
    `${API_BASE}/api/bills/${id}/restore`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}


export const fetchBillsByDate = async (date) => {
  const response = await axios.get(
    `${API_BASE}/api/bills?date=${date}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchArchivedBills = async () => {
  const response = await axios.get(
    `${API_BASE}/api/bills/archived`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchMonthlyStats = async (month) => {
  const response = await axios.get(
    `${API_BASE}/api/bills/stats?month=${month}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
