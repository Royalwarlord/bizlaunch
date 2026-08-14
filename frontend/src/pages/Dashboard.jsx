import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    contactedEnquiries: 0,
    closedEnquiries: 0,
  });

  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  useEffect(() => {
    const token = localStorage.getItem("bizlaunch_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        // ========================================
        // LOAD USER
        // ========================================

        const userResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.message || "Authentication failed"
          );
        }

        setUser(userData.user);

        localStorage.setItem(
          "bizlaunch_user",
          JSON.stringify(userData.user)
        );

        // ========================================
        // LOAD BUSINESS PROFILE
        // ========================================

        const profileResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/business/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profileData = await profileResponse.json();

        console.log("Business profile:", profileData);

        if (
          profileResponse.ok &&
          profileData.success &&
          profileData.profile
        ) {
          setProfile(profileData.profile);
        } else {
          setProfile(null);
        }

        // ========================================
        // LOAD DASHBOARD STATISTICS
        // ========================================

        const statsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const statsData = await statsResponse.json();

        console.log("Dashboard statistics:", statsData);

        if (
          statsResponse.ok &&
          statsData.success &&
          statsData.stats
        ) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        localStorage.removeItem("bizlaunch_token");
        localStorage.removeItem("bizlaunch_user");

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("bizlaunch_token");
    localStorage.removeItem("bizlaunch_user");

    navigate("/login", { replace: true });
  };

  // ========================================
  // LOADING
  // ========================================

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

  // ========================================
  // USER NOT FOUND
  // ========================================

  if (!user) {
    return (
      <main className="dashboard-page">
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2>Unable to load dashboard</h2>

            <Link to="/login">
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ========================================
  // DASHBOARD
  // ========================================

  return (
    <main className="dashboard-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="dashboard-header">

        <div className="dashboard-brand">
          Biz<span>Launch</span>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="dashboard-container">

        {/* ========================================
            WELCOME
        ======================================== */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-label">
              BUSINESS DASHBOARD
            </p>

            <h1>
              Welcome, {user.name || "Business Owner"} 👋
            </h1>

            <p>
              Manage your business and grow your online
              presence from one place.
            </p>

          </div>

        </section>

        {/* ========================================
            DASHBOARD STATISTICS
        ======================================== */}

        <section className="dashboard-stats">

          <article className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              P
            </div>

            <div>
              <span>Total Products</span>

              <strong>
                {stats.totalProducts}
              </strong>
            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              ✓
            </div>

            <div>
              <span>Available Products</span>

              <strong>
                {stats.availableProducts}
              </strong>
            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              E
            </div>

            <div>
              <span>Total Enquiries</span>

              <strong>
                {stats.totalEnquiries}
              </strong>
            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              !
            </div>

            <div>
              <span>New Enquiries</span>

              <strong>
                {stats.newEnquiries}
              </strong>
            </div>

          </article>

        </section>

        {/* ========================================
            BUSINESS PROFILE
        ======================================== */}

        {profile ? (

          <section
            className="dashboard-business-summary"
            style={{
              marginBottom: "30px",
              padding: "24px",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            {/* BUSINESS INFORMATION */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >

              {/* LOGO */}

              {profile.logo_url ? (

                <img
                  src={profile.logo_url}
                  alt={`${profile.business_name} logo`}
                  style={{
                    width: "72px",
                    height: "72px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                />

              ) : (

                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "14px",
                    display: "grid",
                    placeItems: "center",
                    background: "#f1f5f9",
                    fontSize: "28px",
                    fontWeight: "700",
                  }}
                >
                  {profile.business_name
                    ? profile.business_name
                        .charAt(0)
                        .toUpperCase()
                    : "B"}
                </div>

              )}

              {/* TEXT */}

              <div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing:
                      "0.08em",
                    textTransform:
                      "uppercase",
                    opacity: 0.6,
                  }}
                >
                  Your Business
                </p>

                <h2
                  style={{
                    margin: "5px 0",
                  }}
                >
                  {profile.business_name}
                </h2>

                {profile.business_type && (
                  <p
                    style={{
                      margin: 0,
                      opacity: 0.7,
                    }}
                  >
                    {profile.business_type}
                  </p>
                )}

              </div>

            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              <Link
                to="/business-profile"
                className="dashboard-card-button"
              >
                Edit Profile
              </Link>

              {profile.slug && (

                <Link
                  to={`/business/${profile.slug}`}
                  className="dashboard-card-button"
                >
                  View Public Profile
                </Link>

              )}

            </div>

          </section>

        ) : (

          /* ========================================
             NO PROFILE
          ======================================== */

          <section
            style={{
              marginBottom: "30px",
              padding: "24px",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >

            <h2>
              Set up your business profile
            </h2>

            <p>
              Create your business profile so
              customers can discover your business.
            </p>

            <Link
              to="/business-profile"
              className="dashboard-card-button"
            >
              Create Business Profile
            </Link>

          </section>

        )}

        {/* ========================================
            DASHBOARD CARDS
        ======================================== */}

        <section className="dashboard-grid">

          {/* PROFILE */}

          <article className="dashboard-card">

            <div className="dashboard-card-icon">
              B
            </div>

            <h2>
              Business Profile
            </h2>

            <p>
              {profile
                ? profile.business_name
                : "Set up your business information."}
            </p>

            <Link
              to="/business-profile"
              className="dashboard-card-button"
            >
              Manage Profile
            </Link>

          </article>

          {/* PRODUCTS */}

          <article className="dashboard-card">

            <div className="dashboard-card-icon">
              P
            </div>

            <h2>
              Products & Services
            </h2>

            <p>
              Showcase what your business offers
              to customers.
            </p>

            <Link
              to="/manage-products"
              className="dashboard-card-button"
            >
              Manage Products
            </Link>

          </article>

          {/* CUSTOMERS */}

          <article className="dashboard-card">

            <div className="dashboard-card-icon">
              C
            </div>

            <h2>
              Customers
            </h2>

            <p>
              View and manage customer enquiries.
            </p>

            <Link
              to="/enquiries"
              className="dashboard-card-button"
            >
              View Enquiries
            </Link>

          </article>

          {/* ANALYTICS */}

          <article className="dashboard-card">

            <div className="dashboard-card-icon">
              A
            </div>

            <h2>
              Analytics
            </h2>

            <p>
              Track visitors and understand your
              business performance.
            </p>

            <Link
  to="/analytics"
  className="dashboard-card-button"
>
  View Analytics
</Link>

          </article>

        </section>

      </div>

    </main>
  );
}

export default Dashboard;