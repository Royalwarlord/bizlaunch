import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function PublicBusiness() {
  const { slug } = useParams();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD BUSINESS
  // ========================================

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/public/business/${slug}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load business"
          );
        }

        setBusiness(data.business);

        setProducts(
          data.business?.products ||
            data.products ||
            []
        );
      } catch (error) {
        console.error(
          "Public business error:",
          error
        );

        setError(
          error.message ||
            "Unable to load business"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [slug, API_URL]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="public-business-page">
        <div className="public-loading">
          <div className="loading-spinner"></div>

          <p>Loading business...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !business) {
    return (
      <main className="public-business-page">
        <div className="public-error">

          <div className="error-icon">
            !
          </div>

          <h1>
            Business Not Found
          </h1>

          <p>
            {error ||
              "This business could not be found."}
          </p>

          <Link
            to="/"
            className="public-back-button"
          >
            Back to BizLaunch
          </Link>

        </div>
      </main>
    );
  }

  // ========================================
  // SEO
  // ========================================

  const siteUrl =
    import.meta.env.VITE_SITE_URL ||
    window.location.origin;

  const businessUrl =
    `${siteUrl}/business/${business.slug}`;

  const businessName =
    business.business_name ||
    "Local Business";

  const businessType =
    business.business_type ||
    "Local Business";

  const locationText = [
    business.town,
    business.county,
  ]
    .filter(Boolean)
    .join(", ");

  const seoTitle =
    `${businessName} | ${businessType} | BizLaunch`;

  const defaultDescription =
    `Discover ${businessName}, a ${businessType.toLowerCase()}${locationText ? ` in ${locationText}` : ""}. View products, services, contact information and connect with the business through BizLaunch.`;

  const seoDescription =
    business.description
      ? business.description
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 160)
      : defaultDescription.substring(0, 160);

  const seoImage =
    business.cover_image_url ||
    business.logo_url ||
    `${siteUrl}/bizlaunch-og-image.png`;

  // ========================================
  // WHATSAPP
  // ========================================

  const whatsappNumber =
    business.whatsapp ||
    business.phone;

  const whatsappLink =
    whatsappNumber
      ? `https://wa.me/${String(
          whatsappNumber
        ).replace(/\D/g, "")}`
      : null;

  // ========================================
  // BUSINESS STRUCTURED DATA
  // ========================================

  const businessSchema = {
    "@context": "https://schema.org",

    "@type": "LocalBusiness",

    "@id": businessUrl,

    name: businessName,

    description:
      business.description ||
      defaultDescription,

    url: businessUrl,

    image: seoImage,

    telephone:
      business.phone || undefined,

    email:
      business.email || undefined,

    address: {
      "@type": "PostalAddress",

      addressLocality:
        business.town || undefined,

      addressRegion:
        business.county || undefined,

      addressCountry: "KE",
    },

    sameAs: [
      business.website,
      business.facebook,
      business.instagram,
      business.twitter,
      business.linkedin,
    ].filter(Boolean),
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="public-business-page">

      {/* ========================================
          SEO
      ======================================== */}

      <Helmet>

        <title>
          {seoTitle}
        </title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href={businessUrl}
        />

        {/* ========================================
            OPEN GRAPH
        ======================================== */}

        <meta
          property="og:type"
          content="business.business"
        />

        <meta
          property="og:title"
          content={seoTitle}
        />

        <meta
          property="og:description"
          content={seoDescription}
        />

        <meta
          property="og:url"
          content={businessUrl}
        />

        <meta
          property="og:image"
          content={seoImage}
        />

        <meta
          property="og:image:alt"
          content={`${businessName} - BizLaunch`}
        />

        <meta
          property="og:site_name"
          content="BizLaunch"
        />

        <meta
          property="og:locale"
          content="en_KE"
        />

        {/* ========================================
            TWITTER / X
        ======================================== */}

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={seoTitle}
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        <meta
          name="twitter:image"
          content={seoImage}
        />

        <meta
          name="twitter:image:alt"
          content={`${businessName} - BizLaunch`}
        />

        {/* ========================================
            STRUCTURED DATA
        ======================================== */}

        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>

      </Helmet>

      {/* ========================================
          NAVBAR
      ======================================== */}

      <header className="public-navbar">

        <div className="public-container public-nav-inner">

          <Link
            to="/"
            className="public-brand"
          >
            Biz<span>Launch</span>
          </Link>

          <div className="public-nav-business">
            {businessName}
          </div>

        </div>

      </header>

      {/* ========================================
          HERO
      ======================================== */}

      <section className="public-hero">

        {business.cover_image_url ? (

          <img
            src={business.cover_image_url}
            alt={`${businessName} cover image`}
            className="public-cover-image"
          />

        ) : (

          <div className="public-cover-placeholder"></div>

        )}

        <div className="public-hero-overlay"></div>

        <div className="public-container public-hero-content">

          <div className="public-business-logo">

            {business.logo_url ? (

              <img
                src={business.logo_url}
                alt={`${businessName} logo`}
                onError={(event) => {

                  event.currentTarget.style.display =
                    "none";

                  event.currentTarget.parentElement.classList.add(
                    "logo-fallback"
                  );

                }}
              />

            ) : (

              <span>
                {businessName
                  ?.charAt(0)
                  .toUpperCase()}
              </span>

            )}

          </div>

          <div className="public-business-heading">

            <div className="public-business-type">
              {businessType}
            </div>

            <h1>
              {businessName}
            </h1>

            {locationText && (

              <p className="public-location">
                📍 {locationText}
              </p>

            )}

          </div>

        </div>

      </section>

      {/* ========================================
          BUSINESS CONTENT
      ======================================== */}

      <div className="public-container public-content">

        {/* ========================================
            ABOUT
        ======================================== */}

        <section className="public-about">

          <div className="public-section-heading">

            <span>
              ABOUT US
            </span>

            <h2>
              Welcome to {businessName}
            </h2>

          </div>

          <p className="public-description">

            {business.description ||
              defaultDescription}

          </p>

        </section>

        {/* ========================================
            CONTACT
        ======================================== */}

        <section className="public-contact-section">

          <div className="public-contact-card">

            <div className="contact-icon">
              📞
            </div>

            <div>

              <span>
                Phone
              </span>

              <strong>
                {business.phone ||
                  "Not provided"}
              </strong>

            </div>

          </div>

          <div className="public-contact-card">

            <div className="contact-icon">
              📍
            </div>

            <div>

              <span>
                Location
              </span>

              <strong>
                {locationText ||
                  "Location not provided"}
              </strong>

            </div>

          </div>

          <div className="public-contact-card">

            <div className="contact-icon">
              ✉️
            </div>

            <div>

              <span>
                Email
              </span>

              <strong>
                {business.email ||
                  "Not provided"}
              </strong>

            </div>

          </div>

        </section>

        {/* ========================================
            PRODUCTS
        ======================================== */}

        <section className="public-products-section">

          <div className="public-section-heading">

            <span>
              OUR PRODUCTS
            </span>

            <h2>
              What We Offer
            </h2>

            <p>
              Explore our products and discover
              what we have available for you.
            </p>

          </div>

          {products.length === 0 ? (

            <div className="no-products">

              <div className="no-products-icon">
                🛍️
              </div>

              <h3>
                Products coming soon
              </h3>

              <p>
                This business has not added
                any products yet.
              </p>

            </div>

          ) : (

            <div className="public-products-grid">

              {products.map((product) => (

                <article
                  className="public-product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <Link
                    to={`/business/${business.slug}/product/${product.slug}`}
                    className="public-product-link"
                  >

                    <div className="public-product-image-wrapper">

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={`${product.name} - ${businessName}`}
                          className="public-product-image"
                          loading="lazy"
                          onError={(event) => {

                            event.currentTarget.style.display =
                              "none";

                            event.currentTarget.parentElement.classList.add(
                              "image-error"
                            );

                          }}
                        />

                      ) : (

                        <div className="product-image-placeholder">
                          🛍️
                        </div>

                      )}

                      {product.category && (

                        <span className="product-category">
                          {product.category}
                        </span>

                      )}

                    </div>

                  </Link>

                  {/* PRODUCT DETAILS */}

                  <div className="public-product-details">

                    <Link
                      to={`/business/${business.slug}/product/${product.slug}`}
                      className="public-product-title-link"
                    >

                      <h3>
                        {product.name}
                      </h3>

                    </Link>

                    {product.description && (

                      <p>
                        {product.description}
                      </p>

                    )}

                    <div className="public-product-bottom">

                      {product.price !== null &&
                      product.price !== undefined ? (

                        <strong className="product-price">

                          KSh{" "}
                          {Number(
                            product.price
                          ).toLocaleString()}

                        </strong>

                      ) : (

                        <span className="price-on-request">
                          Price on request
                        </span>

                      )}

                      <Link
                        to={`/business/${business.slug}/product/${product.slug}`}
                        className="product-enquire-button"
                      >
                        View Product
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* ========================================
            CONTACT CTA
        ======================================== */}

        <section className="public-cta">

          <div>

            <span>
              READY TO GET STARTED?
            </span>

            <h2>
              Get in touch with{" "}
              {businessName}
            </h2>

            <p>
              Have a question or want to learn
              more? Contact the business today.
            </p>

          </div>

          <div className="public-cta-actions">

            {whatsappLink && (

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="public-whatsapp-button"
              >
                💬 WhatsApp Us
              </a>

            )}

            {business.phone && (

              <a
                href={`tel:${business.phone}`}
                className="public-call-button"
              >
                📞 Call Us
              </a>

            )}

          </div>

        </section>

      </div>

      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="public-footer">

        <div className="public-container">

          <div className="public-footer-brand">
            Biz<span>Launch</span>
          </div>

          <p>
            Powered by BizLaunch
          </p>

          <small>
            © 2026 BizLaunch. All rights reserved.
          </small>

        </div>

      </footer>

    </main>
  );
}

export default PublicBusiness;