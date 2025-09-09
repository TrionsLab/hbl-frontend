import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./middlewares/ProtectedRoute";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Newbill from "./pages/newbill/Newbill";

import ReceptionDashboard from "./components/receptionDashboard/ReceptionDashboard";
import Dashboard from "./components/dashboard/Dashboard";
import Stats from "./components/stats/Stats";
import Archive from "./components/archive/Archive";
import ReferralEarnings from "./components/referralEarnings/ReferralEarnings";
import ReferralManager from "./components/referralManager/ReferralManager";
import Reception from "./pages/reception/Reception";
import Test from "./components/test/Test";

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
          <Route
            path="/admin/referrals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ReferralManager />
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
