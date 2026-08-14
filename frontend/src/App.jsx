import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BusinessProfile from "./pages/BusinessProfile";
import UploadTest from "./UploadTest";
import PublicBusiness from "./pages/PublicBusiness";
import Products from "./pages/Products";
import ManageProducts from "./pages/ManageProducts";
import ProductDetails from "./pages/ProductDetails";
import Enquiries from "./pages/Enquiries";
import Analytics from "./pages/Analytics";

// ========================================
// HOME PAGE
// ========================================

function Home() {
  // ========================================
  // HOMEPAGE SEO
  // ========================================

  const siteUrl =
    import.meta.env.VITE_SITE_URL ||
    window.location.origin;

  const homeUrl = siteUrl.replace(/\/$/, "");

  const homeTitle =
    "BizLaunch | Build Your Business Online in Kenya";

  const homeDescription =
    "BizLaunch helps Kenyan businesses build a professional online presence, showcase products and services, connect with customers, and grow online.";

  const homeImage =
    `${homeUrl}/bizlaunch-og-image.png`;

  // ========================================
  // WEBSITE STRUCTURED DATA
  // ========================================

  const websiteSchema = {
    "@context": "https://schema.org",

    "@type": "WebSite",

    name: "BizLaunch",

    url: homeUrl,

    description: homeDescription,

    inLanguage: "en-KE",

    publisher: {
      "@type": "Organization",

      name: "BizLaunch",

      url: homeUrl,

      logo: {
        "@type": "ImageObject",

        url: homeImage,
      },
    },
  };

  // ========================================
  // ORGANIZATION STRUCTURED DATA
  // ========================================

  const organizationSchema = {
    "@context": "https://schema.org",

    "@type": "Organization",

    name: "BizLaunch",

    url: homeUrl,

    logo: homeImage,

    description: homeDescription,

    areaServed: {
      "@type": "Country",

      name: "Kenya",
    },

    knowsAbout: [
      "Business websites",
      "Online business presence",
      "Products and services",
      "Customer enquiries",
      "Business analytics",
      "Digital marketing",
    ],
  };

  return (
    <div className="app">

      {/* ========================================
          HOMEPAGE SEO
      ======================================== */}

      <Helmet>

        {/* PAGE TITLE */}

        <title>
          {homeTitle}
        </title>

        {/* META DESCRIPTION */}

        <meta
          name="description"
          content={homeDescription}
        />

        {/* CANONICAL URL */}

        <link
          rel="canonical"
          href={homeUrl}
        />

        {/* LANGUAGE */}

        <meta
          httpEquiv="content-language"
          content="en-KE"
        />

        {/* ROBOTS */}

        <meta
          name="robots"
          content="index, follow"
        />

        {/* ========================================
            OPEN GRAPH
        ======================================== */}

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:title"
          content={homeTitle}
        />

        <meta
          property="og:description"
          content={homeDescription}
        />

        <meta
          property="og:url"
          content={homeUrl}
        />

        <meta
          property="og:image"
          content={homeImage}
        />

        <meta
          property="og:image:width"
          content="1200"
        />

        <meta
          property="og:image:height"
          content="630"
        />

        <meta
          property="og:image:alt"
          content="BizLaunch - Discover Local Businesses and Products in Kenya"
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
          content={homeTitle}
        />

        <meta
          name="twitter:description"
          content={homeDescription}
        />

        <meta
          name="twitter:image"
          content={homeImage}
        />

        <meta
          name="twitter:image:alt"
          content="BizLaunch - Discover Local Businesses and Products in Kenya"
        />

        {/* ========================================
            STRUCTURED DATA
        ======================================== */}

        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>

      </Helmet>

      {/* ========================================
          NAVBAR
      ======================================== */}

      <header className="navbar">

        <div className="container nav-content">

          <Link
            to="/"
            className="logo"
          >
            Biz<span>Launch</span>
          </Link>

          <nav className="nav-links">

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#features">
              Features
            </a>

            <a href="#pricing">
              Pricing
            </a>

          </nav>

          <div className="nav-actions">

            <Link
              to="/login"
              className="login-link"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary"
            >
              Get Started
            </Link>

          </div>

        </div>

      </header>

      {/* ========================================
          HERO
      ======================================== */}

      <main>

        <section className="hero">

          <div className="container hero-grid">

            <div className="hero-content">

              <div className="eyebrow">
                BUILT FOR SMALL BUSINESSES
              </div>

              <h1>
                Take your business
                <span> online.</span>
              </h1>

              <p>
                Create a professional online presence,
                showcase your products and services,
                and reach more customers without
                needing to build a website from scratch.
              </p>

              <div className="hero-actions">

                <Link
                  to="/register"
                  className="btn btn-primary btn-large"
                >
                  Start Your Business
                </Link>

                <a
                  href="#how-it-works"
                  className="btn btn-secondary btn-large"
                >
                  See How It Works
                </a>

              </div>

              <div className="hero-note">
                No complicated setup. Build, publish and grow.
              </div>

            </div>

            {/* DASHBOARD PREVIEW */}

            <div className="hero-card">

              <div className="dashboard-preview">

                <div className="preview-header">

                  <div className="preview-logo">
                    BizLaunch
                  </div>

                  <div className="preview-avatar">
                    B
                  </div>

                </div>

                <div className="preview-body">

                  <div className="preview-welcome">

                    <small>
                      BUSINESS DASHBOARD
                    </small>

                    <h3>
                      Welcome back 👋
                    </h3>

                  </div>

                  <div className="stats-grid">

                    <div className="stat-card">

                      <span>
                        Visitors
                      </span>

                      <strong>
                        1,248
                      </strong>

                    </div>

                    <div className="stat-card">

                      <span>
                        Enquiries
                      </span>

                      <strong>
                        86
                      </strong>

                    </div>

                    <div className="stat-card">

                      <span>
                        Products
                      </span>

                      <strong>
                        24
                      </strong>

                    </div>

                  </div>

                  <div className="preview-chart">

                    <div className="chart-title">
                      Website activity
                    </div>

                    <div className="chart-bars">

                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ========================================
            FEATURES
        ======================================== */}

        <section
          className="section"
          id="features"
        >

          <div className="container">

            <div className="section-heading">

              <div className="eyebrow">
                EVERYTHING YOU NEED
              </div>

              <h2>
                Your business deserves
                <span> a digital home.</span>
              </h2>

              <p>
                BizLaunch gives you the tools to
                present your business professionally
                and connect with customers online.
              </p>

            </div>

            <div className="features-grid">

              <article className="feature-card">

                <div className="feature-icon">
                  01
                </div>

                <h3>
                  Professional Website
                </h3>

                <p>
                  Give your business a modern website
                  that customers can access from any device.
                </p>

              </article>

              <article className="feature-card">

                <div className="feature-icon">
                  02
                </div>

                <h3>
                  Products & Services
                </h3>

                <p>
                  Showcase what you offer with organized
                  products, services, prices and descriptions.
                </p>

              </article>

              <article className="feature-card">

                <div className="feature-icon">
                  03
                </div>

                <h3>
                  Customer Enquiries
                </h3>

                <p>
                  Make it easy for potential customers
                  to contact your business and request information.
                </p>

              </article>

              <article className="feature-card">

                <div className="feature-icon">
                  04
                </div>

                <h3>
                  Business Analytics
                </h3>

                <p>
                  Understand how people interact with
                  your website and discover opportunities to grow.
                </p>

              </article>

            </div>

          </div>

        </section>

        {/* ========================================
            HOW IT WORKS
        ======================================== */}

        <section
          className="section section-dark"
          id="how-it-works"
        >

          <div className="container">

            <div className="section-heading light">

              <div className="eyebrow">
                SIMPLE PROCESS
              </div>

              <h2>
                From idea to
                <span> online business.</span>
              </h2>

            </div>

            <div className="steps-grid">

              <article className="step">

                <div className="step-number">
                  01
                </div>

                <h3>
                  Create your account
                </h3>

                <p>
                  Register your business and tell us
                  about what you do.
                </p>

              </article>

              <article className="step">

                <div className="step-number">
                  02
                </div>

                <h3>
                  Build your presence
                </h3>

                <p>
                  Add your business information, products,
                  services and images.
                </p>

              </article>

              <article className="step">

                <div className="step-number">
                  03
                </div>

                <h3>
                  Publish & grow
                </h3>

                <p>
                  Publish your website and start
                  connecting with customers.
                </p>

              </article>

            </div>

          </div>

        </section>

        {/* ========================================
            PRICING
        ======================================== */}

        <section
          className="section"
          id="pricing"
        >

          <div className="container">

            <div className="section-heading">

              <div className="eyebrow">
                SIMPLE PRICING
              </div>

              <h2>
                Start small.
                <span> Grow when you're ready.</span>
              </h2>

              <p>
                Plans designed for businesses at
                different stages of growth.
              </p>

            </div>

            <div className="pricing-grid">

              <article className="pricing-card">

                <div className="pricing-name">
                  Starter
                </div>

                <div className="price">

                  <strong>
                    Free
                  </strong>

                </div>

                <p>
                  Get your business online with the essentials.
                </p>

                <ul>

                  <li>
                    Business profile
                  </li>

                  <li>
                    Basic website
                  </li>

                  <li>
                    Products & services
                  </li>

                  <li>
                    Customer contact
                  </li>

                </ul>

                <Link
                  to="/register"
                  className="btn btn-secondary"
                >
                  Get Started
                </Link>

              </article>

              <article className="pricing-card featured">

                <div className="popular">
                  MOST POPULAR
                </div>

                <div className="pricing-name">
                  Business
                </div>

                <div className="price">

                  <strong>
                    KSh 999
                  </strong>

                  <span>
                    /month
                  </span>

                </div>

                <p>
                  Powerful tools for businesses ready to grow.
                </p>

                <ul>

                  <li>
                    Everything in Starter
                  </li>

                  <li>
                    Premium templates
                  </li>

                  <li>
                    Business analytics
                  </li>

                  <li>
                    Customer enquiries
                  </li>

                  <li>
                    More images & content
                  </li>

                </ul>

                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Choose Business
                </Link>

              </article>

              <article className="pricing-card">

                <div className="pricing-name">
                  Professional
                </div>

                <div className="price">

                  <strong>
                    KSh 2,499
                  </strong>

                  <span>
                    /month
                  </span>

                </div>

                <p>
                  Advanced tools for established businesses.
                </p>

                <ul>

                  <li>
                    Everything in Business
                  </li>

                  <li>
                    Custom domain
                  </li>

                  <li>
                    Advanced analytics
                  </li>

                  <li>
                    Priority support
                  </li>

                </ul>

                <Link
                  to="/register"
                  className="btn btn-secondary"
                >
                  Go Professional
                </Link>

              </article>

            </div>

          </div>

        </section>

        {/* ========================================
            CTA
        ======================================== */}

        <section
          className="cta"
          id="get-started"
        >

          <div className="container cta-content">

            <div>

              <div className="eyebrow">
                READY TO START?
              </div>

              <h2>
                Put your business
                <span> on the map.</span>
              </h2>

              <p>
                Build your online presence today
                and start reaching more customers.
              </p>

            </div>

            <Link
              to="/register"
              className="btn btn-light btn-large"
            >
              Create Your Business
            </Link>

          </div>

        </section>

      </main>

      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="footer">

        <div className="container footer-content">

          <div>

            <Link
              to="/"
              className="logo"
            >
              Biz<span>Launch</span>
            </Link>

            <p>
              Helping businesses build a stronger digital presence.
            </p>

          </div>

          <div className="footer-links">

            <a href="#features">
              Features
            </a>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#pricing">
              Pricing
            </a>

            <a href="#get-started">
              Get Started
            </a>

          </div>

          <div className="copyright">
            © 2026 BizLaunch. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}

// ========================================
// APPLICATION ROUTES
// ========================================

function App() {
  return (
    <HelmetProvider>

      <BrowserRouter>

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* AUTH */}

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* PUBLIC BUSINESS */}

          <Route
            path="/business/:slug"
            element={<PublicBusiness />}
          />

          {/* ENQUIRIES */}

          <Route
            path="/enquiries"
            element={<Enquiries />}
          />

          {/* ANALYTICS */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* BUSINESS PROFILE */}

          <Route
            path="/business-profile"
            element={<BusinessProfile />}
          />

          {/* PRODUCTS */}

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/manage-products"
            element={<ManageProducts />}
          />

          {/* PRODUCT DETAILS */}

          <Route
            path="/business/:businessSlug/product/:productSlug"
            element={<ProductDetails />}
          />

          {/* UPLOAD TEST */}

          <Route
            path="/upload-test"
            element={<UploadTest />}
          />

        </Routes>

      </BrowserRouter>

    </HelmetProvider>
  );
}

export default App;