import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // ✅ Store as JSON string
    localStorage.setItem("userInfo", JSON.stringify(decoded));

    if (allowedRoles.includes(decoded.role)) {
      return children;
    } else {
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
