import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Analytics() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      const token = localStorage.getItem("bizlaunch_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/dashboard/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load analytics."
          );
        }

        setAnalytics(data.analytics);
      } catch (error) {
        console.error("Analytics error:", error);

        setError(
          error.message || "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [API_URL, navigate]);

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="analytics-header">

        <div>
          <Link
            to="/dashboard"
            className="analytics-back"
          >
            ← Dashboard
          </Link>

          <p className="analytics-label">
            BUSINESS INSIGHTS
          </p>

          <h1>Analytics</h1>

          <p>
            Understand how your business is
            performing.
          </p>
        </div>

        <Link
          to="/enquiries"
          className="analytics-header-button"
        >
          View Enquiries
        </Link>

      </header>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      {!error && analytics && (
        <div className="analytics-container">

          {/* ========================================
              OVERVIEW STATISTICS
          ======================================== */}

          <section className="analytics-stats">

            <article className="analytics-stat-card">
              <div className="analytics-stat-icon">
                🛏️
              </div>

              <div>
                <span>Total Products</span>

                <strong>
                  {analytics.totalProducts}
                </strong>

                <small>
                  Products in your catalogue
                </small>
              </div>
            </article>

            <article className="analytics-stat-card">
              <div className="analytics-stat-icon available">
                ✓
              </div>

              <div>
                <span>Available Products</span>

                <strong>
                  {analytics.availableProducts}
                </strong>

                <small>
                  Currently available
                </small>
              </div>
            </article>

            <article className="analytics-stat-card">
              <div className="analytics-stat-icon enquiries">
                ?
              </div>

              <div>
                <span>Total Enquiries</span>

                <strong>
                  {analytics.totalEnquiries}
                </strong>

                <small>
                  Customer enquiries received
                </small>
              </div>
            </article>

            <article className="analytics-stat-card">
              <div className="analytics-stat-icon new">
                !
              </div>

              <div>
                <span>New Enquiries</span>

                <strong>
                  {analytics.newEnquiries}
                </strong>

                <small>
                  Awaiting your response
                </small>
              </div>
            </article>

          </section>

          {/* ========================================
              ENQUIRY BREAKDOWN + PRODUCT AVAILABILITY
          ======================================== */}

          <section className="analytics-grid">

            {/* ENQUIRY BREAKDOWN */}

            <article className="analytics-card">

              <div className="analytics-card-header">
                <div>
                  <p className="analytics-card-label">
                    ENQUIRY BREAKDOWN
                  </p>

                  <h2>
                    Customer enquiries
                  </h2>
                </div>
              </div>

              <div className="analytics-breakdown">

                <div className="analytics-breakdown-item">
                  <span className="analytics-dot new"></span>

                  <div>
                    <span>New</span>

                    <strong>
                      {analytics.newEnquiries}
                    </strong>
                  </div>
                </div>

                <div className="analytics-breakdown-item">
                  <span className="analytics-dot contacted"></span>

                  <div>
                    <span>Contacted</span>

                    <strong>
                      {analytics.contactedEnquiries}
                    </strong>
                  </div>
                </div>

                <div className="analytics-breakdown-item">
                  <span className="analytics-dot closed"></span>

                  <div>
                    <span>Closed</span>

                    <strong>
                      {analytics.closedEnquiries}
                    </strong>
                  </div>
                </div>

              </div>

            </article>

            {/* PRODUCT AVAILABILITY */}

            <article className="analytics-card">

              <div>
                <p className="analytics-card-label">
                  PRODUCT INVENTORY
                </p>

                <h2>
                  Product availability
                </h2>
              </div>

              <div className="analytics-availability">

                <div className="analytics-availability-number">
                  {analytics.totalProducts > 0
                    ? Math.round(
                        (analytics.availableProducts /
                          analytics.totalProducts) *
                          100
                      )
                    : 0}

                  <span>%</span>
                </div>

                <p>
                  of your products are currently
                  available.
                </p>

              </div>

              <div className="analytics-progress">
                <div
                  style={{
                    width: `${
                      analytics.totalProducts > 0
                        ? Math.round(
                            (analytics.availableProducts /
                              analytics.totalProducts) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

            </article>

          </section>

          {/* ========================================
              MONTHLY ENQUIRY ACTIVITY
          ======================================== */}

          <section className="analytics-card">

            <div className="analytics-card-header">
              <div>
                <p className="analytics-card-label">
                  CUSTOMER ACTIVITY
                </p>

                <h2>
                  Enquiry activity
                </h2>

                <p className="analytics-card-description">
                  Monthly enquiries received by your
                  business.
                </p>
              </div>
            </div>

            {analytics.monthlyEnquiries &&
            analytics.monthlyEnquiries.length > 0 ? (
              <div className="analytics-monthly-list">

                {analytics.monthlyEnquiries.map(
                  (item, index) => (
                    <div
                      className="analytics-month-row"
                      key={`${item.month}-${index}`}
                    >
                      <span>
                        {item.month}
                      </span>

                      <div className="analytics-month-bar">
                        <div
                          style={{
                            width: `${
                              analytics.totalEnquiries > 0
                                ? Math.max(
                                    8,
                                    (item.enquiries /
                                      analytics.totalEnquiries) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>

                      <strong>
                        {item.enquiries}
                      </strong>
                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="analytics-empty">
                <div className="analytics-empty-icon">
                  📊
                </div>

                <h3>
                  No enquiry activity yet
                </h3>

                <p>
                  Monthly enquiry statistics will
                  appear here once customers start
                  contacting your business.
                </p>

                <Link
                  to="/enquiries"
                  className="analytics-empty-button"
                >
                  View Enquiries
                </Link>
              </div>
            )}

          </section>

          {/* ========================================
              RECENT ENQUIRIES
          ======================================== */}

          <section className="analytics-card">

            <div className="analytics-card-header">
              <div>
                <p className="analytics-card-label">
                  RECENT ACTIVITY
                </p>

                <h2>
                  Recent enquiries
                </h2>

                <p className="analytics-card-description">
                  The latest customers who contacted
                  your business.
                </p>
              </div>

              <Link
                to="/enquiries"
                className="analytics-view-all"
              >
                View all
              </Link>
            </div>

            {analytics.recentEnquiries &&
            analytics.recentEnquiries.length > 0 ? (
              <div className="analytics-enquiries-list">

                {analytics.recentEnquiries.map(
                  (enquiry) => (
                    <article
                      className="analytics-enquiry-row"
                      key={enquiry.id}
                    >

                      <div className="analytics-enquiry-avatar">
                        {enquiry.customer_name
                          ? enquiry.customer_name
                              .charAt(0)
                              .toUpperCase()
                          : "?"}
                      </div>

                      <div className="analytics-enquiry-info">

                        <h3>
                          {enquiry.customer_name ||
                            "Unknown customer"}
                        </h3>

                        <p>
                          {enquiry.customer_phone ||
                            enquiry.customer_email ||
                            "No contact details"}
                        </p>

                        <small>
                          {enquiry.message
                            ? enquiry.message.length > 80
                              ? `${enquiry.message.substring(
                                  0,
                                  80
                                )}...`
                              : enquiry.message
                            : "No message"}
                        </small>

                      </div>

                      <div className="analytics-enquiry-meta">

                        <span
                          className={`analytics-status ${
                            enquiry.status || "new"
                          }`}
                        >
                          {enquiry.status || "new"}
                        </span>

                        <small>
                          {enquiry.created_at
                            ? new Date(
                                enquiry.created_at
                              ).toLocaleDateString()
                            : ""}
                        </small>

                      </div>

                    </article>
                  )
                )}

              </div>
            ) : (
              <div className="analytics-empty">
                <div className="analytics-empty-icon">
                  💬
                </div>

                <h3>
                  No enquiries yet
                </h3>

                <p>
                  Customer enquiries will appear
                  here when customers contact your
                  business.
                </p>

                <Link
                  to="/enquiries"
                  className="analytics-empty-button"
                >
                  Manage Enquiries
                </Link>
              </div>
            )}

          </section>

          {/* ========================================
              PRODUCT CATALOGUE
          ======================================== */}

          <section className="analytics-card">

            <div className="analytics-card-header">
              <div>
                <p className="analytics-card-label">
                  PRODUCT CATALOGUE
                </p>

                <h2>
                  Your products
                </h2>

                <p className="analytics-card-description">
                  Current products and their
                  availability.
                </p>
              </div>

              <Link
                to="/manage-products"
                className="analytics-view-all"
              >
                Manage
              </Link>
            </div>

            {analytics.productsList &&
            analytics.productsList.length > 0 ? (
              <div className="analytics-products">

                {analytics.productsList.map(
                  (product) => (
                    <div
                      className="analytics-product-row"
                      key={product.id}
                    >

                      <div className="analytics-product-icon">
                        🛏️
                      </div>

                      <div className="analytics-product-info">
                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          KSh{" "}
                          {Number(
                            product.price || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`analytics-product-status ${
                          product.is_available
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        {product.is_available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="analytics-empty">
                <div className="analytics-empty-icon">
                  🛏️
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  Add products to your catalogue to
                  see them here.
                </p>

                <Link
                  to="/manage-products"
                  className="analytics-empty-button"
                >
                  Add Products
                </Link>
              </div>
            )}

          </section>

          {/* ========================================
              QUICK ACTIONS
          ======================================== */}

          <section className="analytics-card analytics-actions-card">

            <div>
              <p className="analytics-card-label">
                QUICK ACTIONS
              </p>

              <h2>
                Manage your business
              </h2>

              <p>
                Use these tools to keep your
                business information up to date.
              </p>
            </div>

            <div className="analytics-actions">

              <Link
                to="/manage-products"
                className="analytics-action-button"
              >
                Manage Products
              </Link>

              <Link
                to="/enquiries"
                className="analytics-action-button"
              >
                Manage Enquiries
              </Link>

              <Link
                to="/business-profile"
                className="analytics-action-button"
              >
                Edit Business Profile
              </Link>

              <Link
                to="/dashboard"
                className="analytics-action-button secondary"
              >
                Back to Dashboard
              </Link>

            </div>

          </section>

        </div>
      )}

    </main>
  );
}

export default Analytics;