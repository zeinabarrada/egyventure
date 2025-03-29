import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Registeration.css";
import sideImage from "./sidepicc.jpeg";
import { useAuth } from "./AuthContext";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaVenusMars,
} from "react-icons/fa";

function AuthForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending data:", formData);
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      if (isLogin) {
        const response = await axios.post("http://127.0.0.1:8000/login/", {
          email: formData.email,
          password: formData.password,
        });
        console.log("Backend Response:", response.data);
        if (response.data.success) {
          const userData = {
            id: response.data.user_id,
            name: response.data.name,
          };
          login(userData);
          navigate("/homepage");
        } else {
          alert("Login failed:" + response.data.message);
        }
      } else {
        const response = await axios.post("http://127.0.0.1:8000/signup/", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
        });
        console.log("Backend Response:", response.data);
        if (response.data.success) {
          const userData = {
            id: response.data.id,
            name: response.data.name,
          };
          login(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          navigate("/chooseinterests");
        } else {
          alert("Sign up failed:" + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error: ", error.response.data);
      alert("An error occurred. Please try again");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="image-section">
          <img src={sideImage} alt="Side" />
        </div>
        <div className="form-section">
          <h2 className="form-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="form-subtitle">
            {isLogin
              ? "Login to continue your journey"
              : "Join us to start exploring"}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="name-fields">
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <FaVenusMars className="input-icon" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!isLogin && (
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <div className="form-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <a href="#" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
