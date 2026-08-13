import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bizlaunch_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Authentication failed");
        }

        setUser(data.user);

        localStorage.setItem(
          "bizlaunch_user",
          JSON.stringify(data.user)
        );
      } catch (error) {
        console.error("Authentication error:", error);

        localStorage.removeItem("bizlaunch_token");
        localStorage.removeItem("bizlaunch_user");

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("bizlaunch_token");
    localStorage.removeItem("bizlaunch_user");

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <p>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          Biz<span>Launch</span>
        </div>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-label">
              BUSINESS DASHBOARD
            </p>

            <h1>
              Welcome, {user.name} 👋
            </h1>

            <p>
              Manage your business and grow your online presence
              from one place.
            </p>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              B
            </div>

            <h2>Business Profile</h2>

            <p>
              {user.business_name
                ? user.business_name
                : "Set up your business information."}
            </p>

            <button>
              Manage Profile
            </button>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              P
            </div>

            <h2>Products & Services</h2>

            <p>
              Showcase what your business offers to customers.
            </p>

            <button>
              Manage Products
            </button>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              C
            </div>

            <h2>Customers</h2>

            <p>
              View and manage customer enquiries.
            </p>

            <button>
              View Customers
            </button>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              A
            </div>

            <h2>Analytics</h2>

            <p>
              Track visitors and understand your business
              performance.
            </p>

            <button>
              View Analytics
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;