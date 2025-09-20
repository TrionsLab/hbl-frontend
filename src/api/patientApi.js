import axios from "axios";
import { getAuthHeaders } from "../helpers/authHelpers";

const API_BASE = import.meta.env.VITE_API_BASE;

export const getPatientByPhone = async (phoneNumber) => {
  const response = await axios.get(
    `${API_BASE}/api/patient/${phoneNumber}`,
    { headers: getAuthHeaders() }
  );
  return response;
};
