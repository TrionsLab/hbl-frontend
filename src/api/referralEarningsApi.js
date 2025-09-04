import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

import { getAuthHeaders } from "../helpers/authHeaders";

export const getReferralEarnings = async (month) => {
  try {
    const response = await axios.get(`${API_BASE}/api/bills/referral-earnings`, {
      params: { month },
      headers: getAuthHeaders()
    },);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || 'Failed to fetch referral earnings'
    );
  }
};
