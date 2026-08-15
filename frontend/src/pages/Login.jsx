import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      // Read response as text first so an empty/non-JSON
      // response doesn't cause "Unexpected end of JSON input".
      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Invalid JSON response:", responseText);

          throw new Error(
            `Server returned an invalid response (${response.status})`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Login failed (${response.status})`
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Login response is missing authentication data");
      }

      // Store authentication information
      localStorage.setItem("bizlaunch_token", data.token);

      localStorage.setItem(
        "bizlaunch_user",
        JSON.stringify(data.user)
      );

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Biz<span>Launch</span>
        </Link>

        <div className="auth-heading">
          <h1>Welcome back</h1>

          <p>
            Log in to manage your business.
          </p>
        </div>

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?

          <Link to="/register">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;