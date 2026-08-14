import { useEffect, useState } from "react";

function Products() {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/public`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load products."
          );
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error("Products error:", error);

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [API_URL]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="public-products-page">
        <div className="public-products-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <main className="public-products-page">
        <div className="public-products-error">
          <h2>Unable to Load Products</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="public-products-page">

      {/* HERO */}

      <section className="products-hero">
        <div className="products-hero-content">
          <span className="products-eyebrow">
            OUR COLLECTION
          </span>

          <h1>
            Products & <span>Services</span>
          </h1>

          <p>
            Discover quality products and services
            offered by our business.
          </p>
        </div>
      </section>

      {/* PRODUCTS */}

      <section className="public-products-section">

        <div className="public-products-container">

          <div className="products-section-heading">
            <div>
              <span className="products-small-label">
                WHAT WE OFFER
              </span>

              <h2>
                Our Products
              </h2>
            </div>

            <p>
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              available
            </p>
          </div>

          {products.length === 0 ? (
            <div className="public-empty-products">
              <div className="empty-products-icon">
                🛍️
              </div>

              <h3>
                No products available
              </h3>

              <p>
                This business has not added any
                products yet.
              </p>
            </div>
          ) : (
            <div className="public-products-grid">

              {products.map((product) => (
                <article
                  className="public-product-card"
                  key={product.id}
                >

                  {/* IMAGE */}

                  <div className="public-product-image-wrapper">

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="public-product-image"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          event.currentTarget.parentElement.classList.add(
                            "image-error"
                          );
                        }}
                      />
                    ) : (
                      <div className="public-product-placeholder">
                        <span>🛍️</span>
                        <p>No image</p>
                      </div>
                    )}

                    {product.category && (
                      <span className="product-category">
                        {product.category}
                      </span>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="public-product-content">

                    <h3>
                      {product.name}
                    </h3>

                    <p className="public-product-description">
                      {product.description ||
                        "Quality product from our business."}
                    </p>

                    <div className="public-product-footer">

                      <div className="public-product-price">
                        KSh{" "}
                        {Number(
                          product.price || 0
                        ).toLocaleString()}
                      </div>

                      <Link
  to={`/business/${businessSlug}/product/${product.slug}`}
  className="public-product-button"
>
  View Product
</Link>

                    </div>

                  </div>

                </article>
              ))}

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Products;