import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 🔓 Bypass check with dummy user (temporary)
  const dummyUser = {
    id: 1,
    username: "Test Admin",
    email: "admintest@clinic.com",
    role: "admin", // change to "reception" if needed
  };

  localStorage.setItem("userInfo", JSON.stringify(dummyUser));

  // Always allow navigation for now
  return children;

  // --------
  // 👇 Restore this later when you hook up real auth
  /*
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
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
  */
};

export default ProtectedRoute;
