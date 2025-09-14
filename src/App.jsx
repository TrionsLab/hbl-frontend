import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./middlewares/ProtectedRoute";

import Login from "./components/auth/login/Login";
import Register from "./components/auth/register/Register";
import Newbill from "./pages/newbill/Newbill";

import ReceptionDashboard from "./pages/receptionDashboard/ReceptionDashboard";
import Dashboard from "./pages/dashboard/Dashboard";
import Stats from "./pages/stats/Stats";
import Archive from "./pages/archiveBills/Archive";
import ReferralEarnings from "./pages/referralEarnings/ReferralEarnings";
import Reception from "./pages/reception/Reception";
import Test from "./pages/medicalTests/MedicalTests";

// New pages
import DoctorManager from "./pages/doctor/DoctorManager";
import PCManager from "./pages/primaryCare/PCManager";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default */}
          <Route path="/login" element={<Login />} />

          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Register />
              </ProtectedRoute>
            }
          />

          <Route
            path="/newbill"
            element={
              <ProtectedRoute allowedRoles={["reception", "admin"]}>
                <Newbill />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard and subpages */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/archive"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Archive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ReferralEarnings />
              </ProtectedRoute>
            }
          />

          {/* New routes */}
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DoctorManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pcs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PCManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/receptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reception />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/test"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Test />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
