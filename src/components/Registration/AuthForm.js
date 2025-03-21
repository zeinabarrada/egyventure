import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Registeration.css";
import sideImage from "./sidepicc.jpeg";
import { useAuth } from "./AuthContext";

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
        const response = await axios.post("http://127.0.0.1:8000/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          const userData = {
            token: response.data.token,
            user: response.data.user, // Ensure backend sends user details
          };
          login(userData);
          navigate("/homepage");
        } else {
          alert("Login failed:" + response.data.message);
        }
      } else {
        const response = await axios.post("http://127.0.0.1:8000/signup", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
        });
        if (response.data.success) {
          const userData = {
            token: response.data.token,
            user: response.data.user, // Ensure backend sends user details
          };
          login(userData); // Call login function from AuthContext
          navigate("/chooseinterests");
        } else {
          alert("Sign up failed:" + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error: ", error.response.data);
      alert("An error occurred. Please try again");
    }
    console.log(`${isLogin ? "Login" : "Register"} Attempt:`, formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="image-section">
          <img src={sideImage} alt="Side" />
        </div>
        <div className="form-section">
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="name-fields">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
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
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
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
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            )}
            <button type="submit">{isLogin ? "Login" : "Register"}</button>
          </form>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
