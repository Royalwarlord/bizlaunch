import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ManageProducts() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });

  // ========================================
  // LOAD CURRENT USER'S PRODUCTS
  // ========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("bizlaunch_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      // IMPORTANT:
      // /mine returns ONLY products belonging
      // to the logged-in user's business.
      const response = await fetch(
        `${API_URL}/api/products/mine`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your products"
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(
        "Load products error:",
        err
      );

      setError(
        err.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ========================================
  // IMAGE SELECT
  // ========================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP and GIF images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 25 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ========================================
  // COMPRESS IMAGE BEFORE UPLOAD
  // ========================================

  const compressImage = (file) => {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        const reader =
          new FileReader();

        reader.onload = (event) => {
          image.src =
            event.target.result;
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read the selected image."
            )
          );
        };

        image.onload = () => {
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;

          let width =
            image.width;

          let height =
            image.height;

          if (
            width > MAX_WIDTH ||
            height > MAX_HEIGHT
          ) {
            const widthRatio =
              MAX_WIDTH /
              width;

            const heightRatio =
              MAX_HEIGHT /
              height;

            const ratio =
              Math.min(
                widthRatio,
                heightRatio
              );

            width =
              Math.round(
                width * ratio
              );

            height =
              Math.round(
                height * ratio
              );
          }

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            width;

          canvas.height =
            height;

          const context =
            canvas.getContext(
              "2d"
            );

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Unable to compress image."
                  )
                );

                return;
              }

              const compressedFile =
                new File(
                  [blob],
                  file.name.replace(
                    /\.[^/.]+$/,
                    ".jpg"
                  ),
                  {
                    type:
                      "image/jpeg",
                    lastModified:
                      Date.now(),
                  }
                );

              resolve(
                compressedFile
              );
            },
            "image/jpeg",
            0.82
          );
        };

        image.onerror = () => {
          reject(
            new Error(
              "Unable to process this image."
            )
          );
        };

        reader.readAsDataURL(
          file
        );
      }
    );
  };

  // ========================================
  // UPLOAD IMAGE TO CLOUDINARY
  // ========================================

  const uploadImage = async () => {
    if (!imageFile) {
      return form.imageUrl || "";
    }

    const token =
      localStorage.getItem(
        "bizlaunch_token"
      );

    if (!token) {
      throw new Error(
        "Authentication token not found. Please log in again."
      );
    }

    try {
      setUploading(true);

      const compressedFile =
        await compressImage(
          imageFile
        );

      console.log(
        "Original image:",
        (
          imageFile.size /
          1024 /
          1024
        ).toFixed(2),
        "MB"
      );

      console.log(
        "Compressed image:",
        (
          compressedFile.size /
          1024 /
          1024
        ).toFixed(2),
        "MB"
      );

      const formData =
        new FormData();

      formData.append(
        "image",
        compressedFile
      );

      const response =
        await fetch(
          `${API_URL}/api/upload/image`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Image upload failed."
        );
      }

      if (!data.imageUrl) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      return data.imageUrl;
    } finally {
      setUploading(false);
    }
  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      isAvailable: true,
    });

    setImageFile(null);
    setImagePreview("");
    setEditingId(null);

    const fileInput =
      document.getElementById(
        "product-image"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ========================================
  // ADD / UPDATE PRODUCT
  // ========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token =
        localStorage.getItem(
          "bizlaunch_token"
        );

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!form.name.trim()) {
        throw new Error(
          "Product name is required."
        );
      }

      // ========================================
      // UPLOAD IMAGE FIRST
      // ========================================

      let imageUrl =
        form.imageUrl;

      if (imageFile) {
        imageUrl =
          await uploadImage();
      }

      // ========================================
      // DETERMINE REQUEST
      // ========================================

      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const method = editingId
        ? "PUT"
        : "POST";

      // ========================================
      // SAVE PRODUCT
      // ========================================

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: form.name,
            description:
              form.description,
            price: form.price,
            category:
              form.category,
            imageUrl,
            isAvailable:
              form.isAvailable,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save product."
        );
      }

      setSuccess(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      resetForm();

      await loadProducts();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT PRODUCT
  // ========================================

  const handleEdit = (
    product
  ) => {
    setEditingId(
      product.id
    );

    setForm({
      name:
        product.name || "",

      description:
        product.description ||
        "",

      price:
        product.price ??
        "",

      category:
        product.category ||
        "",

      imageUrl:
        product.image_url ||
        "",

      isAvailable:
        product.is_available !==
        false,
    });

    setImageFile(null);

    setImagePreview(
      product.image_url ||
        ""
    );

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // DELETE PRODUCT
  // ========================================

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem(
          "bizlaunch_token"
        );

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/products/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete product."
        );
      }

      setSuccess(
        "Product deleted successfully."
      );

      await loadProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete product."
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div
          style={{
            minHeight:
              "100vh",

            display:
              "grid",

            placeItems:
              "center",
          }}
        >
          <p>
            Loading your products...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="dashboard-page products-management-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="dashboard-brand">
          Biz<span>Launch</span>
        </div>

        <Link
          to="/dashboard"
          className="dashboard-logout"
        >
          ← Back to Dashboard
        </Link>

      </header>

      <div className="dashboard-container">

        {/* PAGE HEADER */}

        <section className="products-hero">

          <div className="products-hero-content">

            <span className="products-eyebrow">
              PRODUCT MANAGEMENT
            </span>

            <h1>
              Products{" "}
              <span>& Services</span>
            </h1>

            <p>
              Add, organize and showcase
              everything your business
              offers to customers.
            </p>

          </div>

          <Link
            to="/products"
            className="products-public-button"
          >
            👁 View Public Products
          </Link>

        </section>

        {/* ALERTS */}

        {error && (
          <div className="product-alert product-alert-error">

            <span>⚠️</span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>
            </div>

          </div>
        )}

        {success && (
          <div className="product-alert product-alert-success">

            <span>✓</span>

            <div>
              <strong>
                Success
              </strong>

              <p>{success}</p>
            </div>

          </div>
        )}

        {/* FORM */}

        <section className="product-form-card">

          <div className="product-form-header">

            <div>

              <span className="form-section-label">
                {editingId
                  ? "UPDATE LISTING"
                  : "NEW LISTING"}
              </span>

              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                Add clear information and
                a quality image to attract
                customers.
              </p>

            </div>

            <div className="product-form-icon">
              {editingId
                ? "✎"
                : "+"}
            </div>

          </div>

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* BASIC INFORMATION */}

            <div className="product-form-section">

              <div className="form-section-title">

                <span>01</span>

                <div>

                  <h3>
                    Basic Information
                  </h3>

                  <p>
                    Tell customers
                    about your product.
                  </p>

                </div>

              </div>

              <div className="product-form-grid">

                {/* NAME */}

                <div className="form-field form-field-large">

                  <label htmlFor="product-name">
                    Product Name
                    <span>*</span>
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Premium Mattress"
                    required
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-field">

                  <label htmlFor="product-category">
                    Category
                  </label>

                  <input
                    id="product-category"
                    type="text"
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Mattresses"
                  />

                </div>

                {/* PRICE */}

                <div className="form-field">

                  <label htmlFor="product-price">
                    Price
                  </label>

                  <div className="price-input">

                    <span>KSh</span>

                    <input
                      id="product-price"
                      type="number"
                      name="price"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="15,000"
                      min="0"
                      step="0.01"
                    />

                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="form-field product-description-field">

                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe your product, its features, benefits, size, materials, warranty..."
                  rows="5"
                />

                <small>
                  Give customers enough
                  information to understand
                  what you are offering.
                </small>

              </div>

            </div>

            {/* IMAGE SECTION */}

            <div className="product-form-section">

              <div className="form-section-title">

                <span>02</span>

                <div>

                  <h3>
                    Product Image
                  </h3>

                  <p>
                    A good image makes
                    your product stand out.
                  </p>

                </div>

              </div>

              <div className="product-upload-layout">

                {/* UPLOAD BOX */}

                <label
                  htmlFor="product-image"
                  className="product-upload-box"
                >

                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                      handleImageChange
                    }
                  />

                  <div className="upload-icon">
                    ↑
                  </div>

                  <strong>
                    Click to upload product image
                  </strong>

                  <span>
                    JPG, PNG, WEBP or GIF
                  </span>

                  <small>
                    Images are automatically
                    optimized before upload.
                  </small>

                </label>

                {/* PREVIEW */}

                <div className="product-preview-box">

                  {imagePreview ? (
                    <>
                      <div className="preview-label">
                        IMAGE PREVIEW
                      </div>

                      <div className="product-preview-image">

                        <img
                          src={
                            imagePreview
                          }
                          alt="Product preview"
                        />

                      </div>
                    </>
                  ) : (
                    <div className="preview-empty">

                      <div>
                        🖼️
                      </div>

                      <strong>
                        No image selected
                      </strong>

                      <span>
                        Your product preview
                        will appear here.
                      </span>

                    </div>
                  )}

                </div>

              </div>

              <p className="upload-note">
                Maximum upload size:
                25 MB. Your image will
                be compressed automatically.
              </p>

            </div>

            {/* AVAILABILITY */}

            <div className="product-form-section availability-section">

              <div className="form-section-title">

                <span>03</span>

                <div>

                  <h3>
                    Product Availability
                  </h3>

                  <p>
                    Control whether customers
                    can see this product.
                  </p>

                </div>

              </div>

              <label className="availability-toggle">

                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={
                    form.isAvailable
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="toggle-slider"></span>

                <div>

                  <strong>
                    Product is available
                  </strong>

                  <small>
                    Customers can view this
                    product on your public
                    business page.
                  </small>

                </div>

              </label>

            </div>

            {/* ACTIONS */}

            <div className="product-form-actions">

              <button
                type="submit"
                className="product-primary-button"
                disabled={
                  saving ||
                  uploading
                }
              >

                {uploading
                  ? "↑ Uploading image..."
                  : saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Product"
                  : "+ Add Product"}

              </button>

              {editingId && (
                <button
                  type="button"
                  className="product-secondary-button"
                  onClick={
                    resetForm
                  }
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>

        {/* PRODUCTS */}

        <section className="products-list-section">

          <div className="products-list-header">

            <div>

              <span className="products-eyebrow">
                YOUR INVENTORY
              </span>

              <h2>
                Your Products
              </h2>

              <p>
                Manage the products currently
                listed for your business.
              </p>

            </div>

            <div className="product-count">

              <strong>
                {products.length}
              </strong>

              <span>
                {products.length === 1
                  ? "Product"
                  : "Products"}
              </span>

            </div>

          </div>

          {products.length === 0 ? (

            <div className="products-empty-state">

              <div className="empty-icon">
                +
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Your products will appear
                here once you add your
                first listing.
              </p>

            </div>

          ) : (

            <div className="products-management-grid">

              {products.map(
                (product) => (

                  <article
                    className="management-product-card"
                    key={
                      product.id
                    }
                  >

                    {/* IMAGE */}

                    <div className="management-product-image">

                      {product.image_url ? (

                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                        />

                      ) : (

                        <div className="no-product-image">
                          🖼️
                        </div>

                      )}

                      <span
                        className={
                          product.is_available
                            ? "product-status available"
                            : "product-status unavailable"
                        }
                      >
                        {product.is_available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="management-product-content">

                      <div className="management-product-category">
                        {product.category ||
                          "Product"}
                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      {product.description && (
                        <p>
                          {
                            product.description
                          }
                        </p>
                      )}

                      <div className="management-product-bottom">

                        {product.price !==
                          null &&
                        product.price !==
                          undefined ? (

                          <strong className="management-product-price">

                            KSh{" "}

                            {Number(
                              product.price
                            ).toLocaleString()}

                          </strong>

                        ) : (

                          <span className="no-price">
                            Price not set
                          </span>

                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="management-product-actions">

                        <button
                          type="button"
                          className="product-edit-button"
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                        >
                          ✎ Edit
                        </button>

                        <button
                          type="button"
                          className="product-delete-button"
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default ManageProducts;