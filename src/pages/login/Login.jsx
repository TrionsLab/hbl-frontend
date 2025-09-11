import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { login } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";
// import { jwtDecode } from "jwt-decode";
// import SideNavbar from "../../components/common/SideNavbar";
import "./Login.css";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/newbill");
    }
  }, [isAuthenticated]);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   try {
  //     const res = await login({ email, password });
  //     const decoded = jwtDecode(res.token);

  //     if (decoded.role === "admin") {
  //       navigate("/admin/dashboard");
  //     } else if (decoded.role === "reception") {
  //       navigate("/newbill");
  //     } else {
  //       navigate("/login");
  //     }
  //   } catch (error) {
  //     setErrors({ form: "Invalid email or password." });
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 🔓 TEMP BYPASS (no API call)
      const dummyUser = {
        id: 1,
        username: "Test Admin",
        email: "admin@example.com",
        role: email.includes("reception") ? "reception" : "admin",
      };

      // Save dummy data in localStorage
      localStorage.setItem("token", "dummy-token");
      localStorage.setItem("userInfo", JSON.stringify(dummyUser));

      // Navigate based on role
      if (dummyUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (dummyUser.role === "reception") {
        navigate("/newbill");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setErrors({ form: "Something went wrong (dummy login failed)." });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Login form content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h2 className="login-title">Login</h2>

          {errors.form && <p className="form-error">{errors.form}</p>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
