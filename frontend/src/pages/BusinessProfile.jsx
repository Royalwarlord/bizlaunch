import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function BusinessProfile() {
  const navigate = useNavigate();

  const emptyForm = {
    businessName: "",
    businessType: "",
    description: "",
    phone: "",
    email: "",
    county: "",
    town: "",
    address: "",
    whatsapp: "",
    website: "",
    facebook: "",
    instagram: "",
    logoUrl: "",
    coverImageUrl: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exists, setExists] = useState(false);

  // ========================================
  // LOAD PROFILE
  // ========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem("bizlaunch_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load business profile"
        );
      }

      if (data.profile) {
        setExists(true);

        setFormData({
          businessName: data.profile.business_name || "",
          businessType: data.profile.business_type || "",
          description: data.profile.description || "",
          phone: data.profile.phone || "",
          email: data.profile.email || "",
          county: data.profile.county || "",
          town: data.profile.town || "",
          address: data.profile.address || "",
          whatsapp: data.profile.whatsapp || "",
          website: data.profile.website || "",
          facebook: data.profile.facebook || "",
          instagram: data.profile.instagram || "",
          logoUrl: data.profile.logo_url || "",
          coverImageUrl: data.profile.cover_image_url || "",
        });
      }
    } catch (error) {
      console.error("Profile loading error:", error);

      if (
        error.message.toLowerCase().includes("authentication") ||
        error.message.toLowerCase().includes("token") ||
        error.message.toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("bizlaunch_token");
        localStorage.removeItem("bizlaunch_user");

        navigate("/login", { replace: true });
        return;
      }

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLE FORM CHANGES
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ========================================
  // UPLOAD IMAGE
  // ========================================

  const uploadImage = async (file, imageType) => {
    if (!file) {
      return;
    }

    const token = localStorage.getItem("bizlaunch_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // ----------------------------------------
    // FILE SIZE
    // ----------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    // ----------------------------------------
    // FILE TYPE
    // ----------------------------------------

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
      return;
    }

    const uploadData = new FormData();

    uploadData.append("image", file);

    try {
      setError("");
      setSuccess("");

      if (imageType === "logo") {
        setUploadingLogo(true);
      } else {
        setUploadingCover(true);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      // ----------------------------------------
      // SAVE CLOUDINARY URL IN FORM STATE
      // ----------------------------------------

      setFormData((current) => ({
        ...current,
        ...(imageType === "logo"
          ? { logoUrl: data.imageUrl }
          : { coverImageUrl: data.imageUrl }),
      }));

      setSuccess(
        imageType === "logo"
          ? "Logo uploaded successfully. Click Save Changes to save your profile."
          : "Cover image uploaded successfully. Click Save Changes to save your profile."
      );
    } catch (error) {
      console.error("Image upload error:", error);

      setError(
        error.message || "Image upload failed."
      );
    } finally {
      if (imageType === "logo") {
        setUploadingLogo(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  // ========================================
  // SAVE BUSINESS PROFILE
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("bizlaunch_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/profile`,
        {
          method: exists ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save business profile"
        );
      }

      // ----------------------------------------
      // UPDATE STATE FROM DATABASE RESPONSE
      // ----------------------------------------

      setExists(true);

      if (data.profile) {
        setFormData({
          businessName:
            data.profile.business_name || "",

          businessType:
            data.profile.business_type || "",

          description:
            data.profile.description || "",

          phone:
            data.profile.phone || "",

          email:
            data.profile.email || "",

          county:
            data.profile.county || "",

          town:
            data.profile.town || "",

          address:
            data.profile.address || "",

          whatsapp:
            data.profile.whatsapp || "",

          website:
            data.profile.website || "",

          facebook:
            data.profile.facebook || "",

          instagram:
            data.profile.instagram || "",

          logoUrl:
            data.profile.logo_url || "",

          coverImageUrl:
            data.profile.cover_image_url || "",
        });
      }

      setSuccess(
        exists
          ? "Business profile updated successfully."
          : "Business profile created successfully."
      );
    } catch (error) {
      console.error("Save profile error:", error);

      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

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
      <main className="profile-page">
        <div className="profile-loading">
          <p>Loading your business profile...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="profile-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="profile-header">

        <Link
          to="/dashboard"
          className="profile-brand"
        >
          Biz<span>Launch</span>
        </Link>

        <div className="profile-header-actions">

          <Link
            to="/dashboard"
            className="back-dashboard"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="profile-logout"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="profile-container">

        {/* HEADING */}

        <div className="profile-heading">

          <div>

            <p className="profile-label">
              BUSINESS PROFILE
            </p>

            <h1>
              Tell customers about your business
            </h1>

            <p>
              Complete your profile so customers can
              discover and connect with your business.
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="profile-alert profile-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="profile-alert profile-success">
            {success}
          </div>
        )}

        <form
          className="business-profile-form"
          onSubmit={handleSubmit}
        >

          {/* ========================================
              BASIC INFORMATION
          ======================================== */}

          <section className="profile-section">

            <div className="section-heading">

              <h2>
                Basic Information
              </h2>

              <p>
                Give your business a clear identity.
              </p>

            </div>

            <div className="profile-grid">

              <div className="form-group">

                <label htmlFor="businessName">
                  Business Name *
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="e.g. Habert Digital Solutions"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="businessType">
                  Business Category
                </label>

                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                >

                  <option value="">
                    Select a category
                  </option>

                  <option value="Retail">
                    Retail
                  </option>

                  <option value="Technology">
                    Technology
                  </option>

                  <option value="ICT Services">
                    ICT Services
                  </option>

                  <option value="Restaurant">
                    Restaurant & Food
                  </option>

                  <option value="Fashion">
                    Fashion & Clothing
                  </option>

                  <option value="Beauty">
                    Beauty & Wellness
                  </option>

                  <option value="Construction">
                    Construction
                  </option>

                  <option value="Agriculture">
                    Agriculture
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Professional Services">
                    Professional Services
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label htmlFor="description">
                  Business Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your business does and what makes it valuable to customers."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  maxLength="1000"
                />

                <small>
                  {formData.description.length}/1000
                  characters
                </small>

              </div>

            </div>

          </section>

          {/* ========================================
              CONTACT INFORMATION
          ======================================== */}

          <section className="profile-section">

            <div className="section-heading">

              <h2>
                Contact Information
              </h2>

              <p>
                Help customers reach you easily.
              </p>

            </div>

            <div className="profile-grid">

              <div className="form-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0712 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Business Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="whatsapp">
                  WhatsApp Number
                </label>

                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="0712 345 678"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="website">
                  Website
                </label>

                <input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* ========================================
              LOCATION
          ======================================== */}

          <section className="profile-section">

            <div className="section-heading">

              <h2>
                Business Location
              </h2>

              <p>
                Let customers know where to find you.
              </p>

            </div>

            <div className="profile-grid">

              <div className="form-group">

                <label htmlFor="county">
                  County
                </label>

                <input
                  id="county"
                  name="county"
                  type="text"
                  placeholder="e.g. Taita Taveta"
                  value={formData.county}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="town">
                  Town
                </label>

                <input
                  id="town"
                  name="town"
                  type="text"
                  placeholder="e.g. Taveta"
                  value={formData.town}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group full-width">

                <label htmlFor="address">
                  Physical Address
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Street, building or landmark"
                  value={formData.address}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* ========================================
              SOCIAL MEDIA
          ======================================== */}

          <section className="profile-section">

            <div className="section-heading">

              <h2>
                Social Media
              </h2>

              <p>
                Connect customers with your online presence.
              </p>

            </div>

            <div className="profile-grid">

              <div className="form-group">

                <label htmlFor="facebook">
                  Facebook
                </label>

                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourbusiness"
                  value={formData.facebook}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="instagram">
                  Instagram
                </label>

                <input
                  id="instagram"
                  name="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourbusiness"
                  value={formData.instagram}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* ========================================
              BUSINESS IMAGES
          ======================================== */}

          <section className="profile-section">

            <div className="section-heading">

              <h2>
                Business Images
              </h2>

              <p>
                Upload your business logo and cover image.
                Images are securely stored using Cloudinary.
              </p>

            </div>

            <div className="profile-grid">

              {/* ========================================
                  LOGO
              ======================================== */}

              <div className="form-group">

                <label htmlFor="logoUpload">
                  Business Logo
                </label>

                <input
                  id="logoUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {

                    const file =
                      event.target.files?.[0];

                    if (file) {
                      uploadImage(file, "logo");
                    }

                    // Allow selecting same file again
                    event.target.value = "";
                  }}
                  disabled={uploadingLogo}
                />

                {uploadingLogo && (
                  <small>
                    Uploading logo...
                  </small>
                )}

                {formData.logoUrl && (
                  <div className="image-preview">

                    <img
                      src={formData.logoUrl}
                      alt="Business logo"
                    />

                  </div>
                )}

              </div>

              {/* ========================================
                  COVER IMAGE
              ======================================== */}

              <div className="form-group">

                <label htmlFor="coverUpload">
                  Cover Image
                </label>

                <input
                  id="coverUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {

                    const file =
                      event.target.files?.[0];

                    if (file) {
                      uploadImage(file, "cover");
                    }

                    // Allow selecting same file again
                    event.target.value = "";
                  }}
                  disabled={uploadingCover}
                />

                {uploadingCover && (
                  <small>
                    Uploading cover image...
                  </small>
                )}

                {formData.coverImageUrl && (
                  <div className="image-preview cover-preview">

                    <img
                      src={formData.coverImageUrl}
                      alt="Business cover"
                    />

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* ========================================
              SAVE
          ======================================== */}

          <div className="profile-actions">

            <Link
              to="/dashboard"
              className="profile-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="profile-save"
              disabled={
                saving ||
                uploadingLogo ||
                uploadingCover
              }
            >
              {saving
                ? "Saving..."
                : exists
                ? "Save Changes"
                : "Create Business Profile"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default BusinessProfile;