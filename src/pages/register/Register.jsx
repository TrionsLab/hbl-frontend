import { useState } from "react";
import { register } from "../../api/authService";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("reception");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await register({ username, email, password, role });
      // console.log("Register response:", res);

      if (res.data.message === "User registered successfully") {
        setSuccess(true);

        // Reset form after 2 sec
        setTimeout(() => {
          setUsername("");
          setEmail("");
          setPassword("");
          setErrors({});
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: "Registration failed. Please try again." });
    }
  };

  return (
    <div className="register-container">
      {success ? (
        <div className="success-message">
          <span className="green-tick">✔</span>
          <p>User registered successfully!</p>
        </div>
      ) : (
        <form className="register-card" onSubmit={handleSubmit} noValidate>
          <h2 className="register-title">Create Receptionist</h2>

          {errors.form && <p className="form-error">{errors.form}</p>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

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
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
