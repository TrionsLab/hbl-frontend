import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import ReceptionDashboard from "./components/receptionDashboard/ReceptionDashboard";
import SideNavbar from "./components/sidebar/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./middlewares/ProtectedRoute";
import Login from "./pages/login/Login";
import Newbill from "./pages/newbill/Newbill";
import Register from "./pages/register/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route: always go to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />

          {/* Only users with role 'reception' or 'admin' can access newbill */}
          <Route
            path="/newbill"
            element={
              <ProtectedRoute allowedRoles={["reception", "admin"]}>
                <Newbill />
              </ProtectedRoute>
            }
          />

          {/* Only admins can access admin dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SideNavbar />
              </ProtectedRoute>
            }
          />

          {/* Reception dashboard */}
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "reception"]}>
                <ReceptionDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route: if no match, go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
