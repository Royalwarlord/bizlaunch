import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            businessName: formData.businessName.trim(),
            businessType: formData.businessType.trim(),
          }),
        }
      );

      // Read the response safely.
      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid JSON response from registration API:",
            responseText
          );

          throw new Error(
            `Server returned an invalid response (${response.status})`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to create account (${response.status})`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Unable to create account"
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

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
          <h1>Create your account</h1>

          <p>
            Start building your business presence online.
          </p>
        </div>

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Your name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessName">
              Business name
            </label>

            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="My Business"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessType">
              Business type
            </label>

            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
            >
              <option value="">
                Select business type
              </option>

              <option value="Retail">
                Retail
              </option>

              <option value="Restaurant">
                Restaurant
              </option>

              <option value="Technology">
                Technology
              </option>

              <option value="Professional Services">
                Professional Services
              </option>

              <option value="Agriculture">
                Agriculture
              </option>

              <option value="Beauty & Fashion">
                Beauty & Fashion
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?

          <Link to="/login">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Register;