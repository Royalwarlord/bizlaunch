import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Enquiries() {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ========================================
  // LOAD ENQUIRIES
  // ========================================

  const loadEnquiries = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem("bizlaunch_token");

      if (!token) {
        setError("Authentication required.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/enquiries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load enquiries."
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error(
        "Load enquiries error:",
        error
      );

      setError(
        error.message ||
          "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // ========================================
  // UPDATE STATUS
  // ========================================

  const updateStatus = async (
    enquiryId,
    status
  ) => {
    try {
      const token =
        localStorage.getItem("bizlaunch_token");

      if (!token) {
        alert("Authentication required.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/enquiries/${enquiryId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update enquiry."
        );
      }

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.id === enquiryId
            ? {
                ...enquiry,
                status,
              }
            : enquiry
        )
      );
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      alert(
        error.message ||
          "Unable to update enquiry."
      );
    }
  };

  // ========================================
  // DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-KE",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "contacted":
        return "enquiry-status contacted";

      case "closed":
        return "enquiry-status closed";

      default:
        return "enquiry-status new";
    }
  };

  // ========================================
  // STATUS COUNTS
  // ========================================

  const totalEnquiries =
    enquiries.length;

  const newEnquiries =
    enquiries.filter(
      (item) =>
        (item.status || "new") === "new"
    ).length;

  const contactedEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "contacted"
    ).length;

  const closedEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "closed"
    ).length;

  // ========================================
  // FILTER + SEARCH
  // ========================================

  const filteredEnquiries = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const status =
        enquiry.status || "new";

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const matchesSearch =
        !query ||
        enquiry.customer_name
          ?.toLowerCase()
          .includes(query) ||
        enquiry.customer_phone
          ?.toLowerCase()
          .includes(query) ||
        enquiry.customer_email
          ?.toLowerCase()
          .includes(query) ||
        enquiry.product_name
          ?.toLowerCase()
          .includes(query) ||
        enquiry.message
          ?.toLowerCase()
          .includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    enquiries,
    search,
    statusFilter,
  ]);

  // ========================================
  // WHATSAPP URL
  // ========================================

  const getWhatsAppUrl = (phone, name) => {
    if (!phone) return null;

    const cleanPhone =
      phone.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hello ${name || "there"}, thank you for contacting our business. How can we help you?`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="enquiries-page">
        <div className="enquiries-loading">
          <div className="enquiries-spinner"></div>

          <p>
            Loading enquiries...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="enquiries-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="enquiries-header">

        <div>
          <Link
            to="/dashboard"
            className="enquiries-back"
          >
            ← Dashboard
          </Link>

          <p className="enquiries-label">
            CUSTOMER MANAGEMENT
          </p>

          <h1>
            Customer Enquiries
          </h1>

          <p>
            Manage customer questions,
            product enquiries and follow-ups
            from one place.
          </p>
        </div>

        <button
          type="button"
          className="enquiries-refresh"
          onClick={() =>
            loadEnquiries(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </header>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="enquiries-error">
          <strong>
            Something went wrong
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadEnquiries()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* ========================================
          STATISTICS
      ======================================== */}

      {!error && (
        <section className="enquiries-stats">

          <button
            type="button"
            className={`enquiry-stat-card ${
              statusFilter === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter("all")
            }
          >
            <div className="enquiry-stat-icon">
              ✉
            </div>

            <div>
              <span>Total Enquiries</span>
              <strong>
                {totalEnquiries}
              </strong>
            </div>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${
              statusFilter === "new"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter("new")
            }
          >
            <div className="enquiry-stat-icon">
              !
            </div>

            <div>
              <span>New</span>
              <strong>
                {newEnquiries}
              </strong>
            </div>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${
              statusFilter === "contacted"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter("contacted")
            }
          >
            <div className="enquiry-stat-icon">
              ✓
            </div>

            <div>
              <span>Contacted</span>
              <strong>
                {contactedEnquiries}
              </strong>
            </div>
          </button>

          <button
            type="button"
            className={`enquiry-stat-card ${
              statusFilter === "closed"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter("closed")
            }
          >
            <div className="enquiry-stat-icon">
              ✓
            </div>

            <div>
              <span>Closed</span>
              <strong>
                {closedEnquiries}
              </strong>
            </div>
          </button>

        </section>
      )}

      {/* ========================================
          SEARCH + FILTER
      ======================================== */}

      {!error &&
        enquiries.length > 0 && (
          <section className="enquiries-toolbar">

            <div className="enquiries-search">

              <span>
                🔎
              </span>

              <input
                type="text"
                placeholder="Search customer, phone, product or message..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="enquiries-filter"
            >
              <option value="all">
                All enquiries
              </option>

              <option value="new">
                New
              </option>

              <option value="contacted">
                Contacted
              </option>

              <option value="closed">
                Closed
              </option>
            </select>

          </section>
        )}

      {/* ========================================
          EMPTY
      ======================================== */}

      {!error &&
        enquiries.length === 0 && (
          <section className="enquiries-empty">

            <div className="enquiries-empty-icon">
              ✉
            </div>

            <h2>
              No enquiries yet
            </h2>

            <p>
              When customers contact you
              about your products, their
              enquiries will appear here.
            </p>

            <Link
              to="/dashboard"
              className="enquiries-primary-button"
            >
              Back to Dashboard
            </Link>

          </section>
        )}

      {/* ========================================
          NO SEARCH RESULTS
      ======================================== */}

      {!error &&
        enquiries.length > 0 &&
        filteredEnquiries.length === 0 && (
          <section className="enquiries-empty">

            <div className="enquiries-empty-icon">
              🔎
            </div>

            <h2>
              No matching enquiries
            </h2>

            <p>
              Try changing your search or
              status filter.
            </p>

            <button
              type="button"
              className="enquiries-primary-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>

          </section>
        )}

      {/* ========================================
          ENQUIRIES
      ======================================== */}

      {filteredEnquiries.length > 0 && (
        <section className="enquiries-list">

          <div className="enquiries-list-header">

            <div>
              <strong>
                {filteredEnquiries.length}
              </strong>

              <span>
                {filteredEnquiries.length === 1
                  ? " enquiry shown"
                  : " enquiries shown"}
              </span>
            </div>

          </div>

          {filteredEnquiries.map(
            (enquiry) => {

              const status =
                enquiry.status || "new";

              const whatsappUrl =
                getWhatsAppUrl(
                  enquiry.customer_phone,
                  enquiry.customer_name
                );

              return (
                <article
                  className="enquiry-card"
                  key={enquiry.id}
                >

                  {/* ========================================
                      TOP
                  ======================================== */}

                  <div className="enquiry-card-top">

                    <div className="enquiry-customer">

                      <div className="enquiry-avatar">
                        {enquiry.customer_name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}
                      </div>

                      <div>

                        <h2>
                          {enquiry.customer_name}
                        </h2>

                        <p>
                          {formatDate(
                            enquiry.created_at
                          )}
                        </p>

                      </div>

                    </div>

                    <span
                      className={getStatusClass(
                        status
                      )}
                    >
                      {status}
                    </span>

                  </div>

                  {/* ========================================
                      PRODUCT
                  ======================================== */}

                  <div className="enquiry-product">

                    {enquiry.product_image ? (
                      <img
                        src={
                          enquiry.product_image
                        }
                        alt={
                          enquiry.product_name ||
                          "Product"
                        }
                      />
                    ) : (
                      <div className="enquiry-product-placeholder">
                        🛍️
                      </div>
                    )}

                    <div>

                      <span>
                        PRODUCT ENQUIRY
                      </span>

                      <h3>
                        {enquiry.product_name ||
                          "General enquiry"}
                      </h3>

                    </div>

                  </div>

                  {/* ========================================
                      CONTACT
                  ======================================== */}

                  <div className="enquiry-contact">

                    {enquiry.customer_phone && (
                      <a
                        href={`tel:${enquiry.customer_phone}`}
                      >
                        📞{" "}
                        {enquiry.customer_phone}
                      </a>
                    )}

                    {enquiry.customer_email && (
                      <a
                        href={`mailto:${enquiry.customer_email}`}
                      >
                        ✉️{" "}
                        {enquiry.customer_email}
                      </a>
                    )}

                  </div>

                  {/* ========================================
                      MESSAGE
                  ======================================== */}

                  <div className="enquiry-message">

                    <span>
                      CUSTOMER MESSAGE
                    </span>

                    <p>
                      {enquiry.message}
                    </p>

                  </div>

                  {/* ========================================
                      ACTIONS
                  ======================================== */}

                  <div className="enquiry-actions">

                    <div className="enquiry-status-actions">

                      {status !== "new" && (
                        <button
                          type="button"
                          className="enquiry-action"
                          onClick={() =>
                            updateStatus(
                              enquiry.id,
                              "new"
                            )
                          }
                        >
                          Mark New
                        </button>
                      )}

                      {status !==
                        "contacted" && (
                        <button
                          type="button"
                          className="enquiry-action"
                          onClick={() =>
                            updateStatus(
                              enquiry.id,
                              "contacted"
                            )
                          }
                        >
                          Mark Contacted
                        </button>
                      )}

                      {status !== "closed" && (
                        <button
                          type="button"
                          className="enquiry-action enquiry-action-dark"
                          onClick={() =>
                            updateStatus(
                              enquiry.id,
                              "closed"
                            )
                          }
                        >
                          Close
                        </button>
                      )}

                    </div>

                    <div className="enquiry-contact-actions">

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="enquiry-whatsapp"
                        >
                          💬 WhatsApp
                        </a>
                      )}

                      {enquiry.customer_email && (
                        <a
                          href={`mailto:${enquiry.customer_email}`}
                          className="enquiry-email"
                        >
                          ✉ Email
                        </a>
                      )}

                      {enquiry.customer_phone && (
                        <a
                          href={`tel:${enquiry.customer_phone}`}
                          className="enquiry-call"
                        >
                          📞 Call
                        </a>
                      )}

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </section>
      )}

    </main>
  );
}

export default Enquiries;