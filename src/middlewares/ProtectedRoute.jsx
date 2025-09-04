import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token); // decode token
    // console.log("xxx", decoded);

    // ✅ Store as JSON string
    localStorage.setItem("userInfo", JSON.stringify(decoded));

    if (allowedRoles.includes(decoded.role)) {
      return children; // User has permission
    } else {
      return <Navigate to="/login" replace />; // No permission
    }
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
