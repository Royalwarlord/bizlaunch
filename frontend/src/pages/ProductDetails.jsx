import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";

function ProductDetails() {
  const {
    businessSlug,
    productSlug,
  } = useParams();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // ENQUIRY FORM
  // ========================================

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [enquiryError, setEnquiryError] = useState("");

  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/public/business/${businessSlug}/products/${productSlug}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load product."
          );
        }

        setProduct(data.product);
      } catch (error) {
        console.error(
          "Product details error:",
          error
        );

        setError(
          error.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [
    API_URL,
    businessSlug,
    productSlug,
  ]);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ========================================
  // SUBMIT ENQUIRY
  // ========================================

  const handleSubmitEnquiry = async (
    event
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setEnquirySuccess("");
    setEnquiryError("");

    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/public`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            businessId:
              product.business_id,

            productId:
              product.id,

            customerName:
              form.customerName,

            customerPhone:
              form.customerPhone,

            customerEmail:
              form.customerEmail,

            message:
              form.message,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit enquiry."
        );
      }

      setEnquirySuccess(
        "Your enquiry has been sent successfully. The business will contact you soon."
      );

      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Enquiry submission error:",
        error
      );

      setEnquiryError(
        error.message ||
          "Unable to submit your enquiry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="product-details-page">

        <div className="product-details-loading">

          <div className="product-loading-spinner"></div>

          <p>
            Loading product...
          </p>

        </div>

      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !product) {
    return (
      <main className="product-details-page">

        <div className="product-details-error">

          <div className="product-error-icon">
            !
          </div>

          <h1>
            Product Not Found
          </h1>

          <p>
            {error ||
              "This product could not be found."}
          </p>

          <Link
            to={`/business/${businessSlug}`}
            className="product-back-button"
          >
            ← Back to Business
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

  const productUrl =
    `${siteUrl}/business/${businessSlug}/product/${productSlug}`;

  const businessUrl =
    `${siteUrl}/business/${businessSlug}`;

  const productName =
    product.name ||
    "Product";

  const businessName =
    product.business_name ||
    "Business";

  const productDescription =
    product.description
      ? product.description
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 160)
      : `Buy or enquire about ${productName} from ${businessName} through BizLaunch.`;

  const productImage =
    product.image_url ||
    `${siteUrl}/bizlaunch-og-image.png`;

  const productTitle =
    `${productName} | ${businessName} | BizLaunch`;

  // ========================================
  // WHATSAPP
  // ========================================

  const whatsappNumber =
    product.whatsapp ||
    product.phone;

  const whatsappMessage =
    encodeURIComponent(
      `Hello ${businessName}, I am interested in your product "${productName}".`
    );

  const whatsappUrl =
    whatsappNumber
      ? `https://wa.me/${String(
          whatsappNumber
        ).replace(
          /\D/g,
          ""
        )}?text=${whatsappMessage}`
      : null;

  // ========================================
  // PRODUCT STRUCTURED DATA
  // ========================================

  const productSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    "@id":
      productUrl,

    name:
      productName,

    description:
      product.description ||
      `Product offered by ${businessName}`,

    image:
      product.image_url
        ? [product.image_url]
        : [productImage],

    sku:
      String(product.id),

    category:
      product.category ||
      undefined,

    brand: {
      "@type":
        "Brand",

      name:
        businessName,
    },

    url:
      productUrl,

    offers: {
      "@type":
        "Offer",

      url:
        productUrl,

      priceCurrency:
        "KES",

      ...(product.price !== null &&
      product.price !== undefined
        ? {
            price:
              String(product.price),
          }
        : {}),

      availability:
        product.is_available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      seller: {
        "@type":
          "Organization",

        name:
          businessName,

        url:
          businessUrl,
      },
    },
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="product-details-page">

      {/* ========================================
          SEO
      ======================================== */}

      <Helmet>

        <title>
          {productTitle}
        </title>

        <meta
          name="description"
          content={productDescription}
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href={productUrl}
        />

        {/* ========================================
            OPEN GRAPH
        ======================================== */}

        <meta
          property="og:type"
          content="product"
        />

        <meta
          property="og:title"
          content={productTitle}
        />

        <meta
          property="og:description"
          content={productDescription}
        />

        <meta
          property="og:url"
          content={productUrl}
        />

        <meta
          property="og:image"
          content={productImage}
        />

        <meta
          property="og:image:alt"
          content={`${productName} - ${businessName}`}
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
          content={productTitle}
        />

        <meta
          name="twitter:description"
          content={productDescription}
        />

        <meta
          name="twitter:image"
          content={productImage}
        />

        <meta
          name="twitter:image:alt"
          content={`${productName} - ${businessName}`}
        />

        {/* ========================================
            PRODUCT STRUCTURED DATA
        ======================================== */}

        <script type="application/ld+json">
          {JSON.stringify(
            productSchema
          )}
        </script>

      </Helmet>

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="product-details-header">

        <div className="product-details-header-inner">

          <Link
            to={`/business/${businessSlug}`}
            className="product-details-brand"
          >
            Biz<span>Launch</span>
          </Link>

          <Link
            to={`/business/${businessSlug}`}
            className="product-business-link"
          >
            ← Back to Business
          </Link>

        </div>

      </header>

      {/* ========================================
          PRODUCT
      ======================================== */}

      <section className="product-details-section">

        <div className="product-details-container">

          {/* BREADCRUMB */}

          <div className="product-breadcrumb">

            <Link
              to={`/business/${businessSlug}`}
            >
              {businessName}
            </Link>

            <span>/</span>

            <span>
              {productName}
            </span>

          </div>

          {/* PRODUCT CARD */}

          <div className="product-details-card">

            {/* IMAGE */}

            <div className="product-details-image-section">

              {product.image_url ? (

                <img
                  src={product.image_url}
                  alt={`${productName} - ${businessName}`}
                  className="product-details-image"
                />

              ) : (

                <div className="product-details-image-placeholder">

                  <span>
                    🛍️
                  </span>

                  <p>
                    No product image
                  </p>

                </div>

              )}

            </div>

            {/* INFORMATION */}

            <div className="product-details-info">

              {product.category && (

                <span className="product-details-category">
                  {product.category}
                </span>

              )}

              <h1>
                {productName}
              </h1>

              {/* PRICE */}

              <div className="product-details-price">

                {product.price !== null &&
                product.price !== undefined
                  ? (
                    <>
                      KSh{" "}
                      {Number(
                        product.price
                      ).toLocaleString()}
                    </>
                  )
                  : (
                    "Price on request"
                  )}

              </div>

              {/* AVAILABILITY */}

              <div
                className={
                  product.is_available
                    ? "product-availability available"
                    : "product-availability unavailable"
                }
              >

                <span className="availability-dot"></span>

                {product.is_available
                  ? "Available"
                  : "Currently unavailable"}

              </div>

              {/* DESCRIPTION */}

              <div className="product-description-section">

                <h2>
                  Product Description
                </h2>

                <p>
                  {product.description ||
                    `Contact ${businessName} for more information about this product.`}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="product-details-actions">

                {whatsappUrl && (

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-whatsapp-button"
                  >

                    <span>
                      💬
                    </span>

                    Enquire on WhatsApp

                  </a>

                )}

                {product.phone && (

                  <a
                    href={`tel:${product.phone}`}
                    className="product-call-button"
                  >

                    <span>
                      📞
                    </span>

                    Call Business

                  </a>

                )}

              </div>

              {/* BUSINESS */}

              <div className="product-business-card">

                {product.logo_url ? (

                  <img
                    src={product.logo_url}
                    alt={`${businessName} logo`}
                    className="product-business-logo"
                  />

                ) : (

                  <div className="product-business-logo-placeholder">

                    {businessName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "B"}

                  </div>

                )}

                <div>

                  <span>
                    Sold by
                  </span>

                  <h3>
                    {businessName}
                  </h3>

                  {(product.town ||
                    product.county) && (

                    <p>
                      📍{" "}
                      {[
                        product.town,
                        product.county,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ========================================
              ENQUIRY
          ======================================== */}

          <section className="product-enquiry-section">

            <div className="product-enquiry-header">

              <span className="product-enquiry-label">
                INTERESTED IN THIS PRODUCT?
              </span>

              <h2>
                Send an enquiry
              </h2>

              <p>
                Fill in your details and the
                business will get back to you.
              </p>

            </div>

            <form
              className="product-enquiry-form"
              onSubmit={
                handleSubmitEnquiry
              }
            >

              <div className="enquiry-form-grid">

                {/* NAME */}

                <div className="enquiry-field">

                  <label htmlFor="customerName">
                    Your Name *
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={
                      form.customerName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    required
                  />

                </div>

                {/* PHONE */}

                <div className="enquiry-field">

                  <label htmlFor="customerPhone">
                    Phone Number *
                  </label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={
                      form.customerPhone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 0712 345 678"
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="enquiry-field enquiry-field-full">

                  <label htmlFor="customerEmail">
                    Email Address
                  </label>

                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={
                      form.customerEmail
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                  />

                </div>

                {/* MESSAGE */}

                <div className="enquiry-field enquiry-field-full">

                  <label htmlFor="message">
                    Message *
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`I'm interested in ${productName}. Please provide more information...`}
                    rows="6"
                    required
                  />

                </div>

              </div>

              {/* SUCCESS */}

              {enquirySuccess && (

                <div className="enquiry-success">
                  ✓ {enquirySuccess}
                </div>

              )}

              {/* ERROR */}

              {enquiryError && (

                <div className="enquiry-error">
                  {enquiryError}
                </div>

              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="product-enquiry-submit"
                disabled={
                  submitting
                }
              >

                {submitting
                  ? "Sending..."
                  : "Send Enquiry →"}

              </button>

            </form>

          </section>

          {/* BACK */}

          <div className="product-details-bottom">

            <Link
              to={`/business/${businessSlug}`}
              className="product-bottom-back"
            >
              ← View More Products
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetails;