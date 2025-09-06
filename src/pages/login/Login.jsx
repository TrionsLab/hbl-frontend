import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ useEffect for redirect after login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/newbill"); // or choose only one route
      // navigate("/newbill");  <-- pick one, don’t call twice
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await login({ email, password }); 

      // Decode token to get role
      const decoded = jwtDecode(res.token);

      if (decoded.role === "admin") {
        navigate("/admin/dashboard");
      } else if (decoded.role === "reception") {
        navigate("/newbill");
      } else {
        navigate("/login"); // fallback if role unknown
      }
    } catch (error) {
      setErrors({ form: "Invalid email or password." });
    }
  };

  return (
    <div className="login-container">
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
  );
};

export default Login;
