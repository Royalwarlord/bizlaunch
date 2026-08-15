import { useState } from "react";
import API_URL from "../api";

function UploadTest() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    setMessage("");
    setUploadedUrl("");

    if (!image) {
      setMessage("Please select an image.");
      return;
    }

    // ========================================
    // GET BIZLAUNCH AUTH TOKEN
    // ========================================

    const token = localStorage.getItem(
      "bizlaunch_token"
    );

    if (!token) {
      setMessage(
        "Authentication token not found. Please log in again."
      );
      return;
    }

    // ========================================
    // CREATE FORM DATA
    // ========================================

    const formData = new FormData();

    formData.append("image", image);

    try {
      setLoading(true);
      setMessage("Uploading...");

      // ========================================
      // SEND TO PRODUCTION BACKEND
      // ========================================

      const response = await fetch(
        `${API_URL}/api/upload/image`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      // ========================================
      // SAFELY READ RESPONSE
      // ========================================

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid upload response:",
            responseText
          );

          throw new Error(
            `Server returned an invalid response (${response.status})`
          );
        }
      }

      // ========================================
      // HANDLE ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Upload failed (${response.status})`
        );
      }

      // ========================================
      // HANDLE SUCCESS
      // ========================================

      if (!data.success) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      setMessage(
        data.message ||
          "Image uploaded successfully."
      );

      setUploadedUrl(data.imageUrl || "");
    } catch (error) {
      console.error("Upload error:", error);

      setMessage(
        error.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
      }}
    >
      <h1>BizLaunch Image Upload Test</h1>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            setImage(e.target.files?.[0] || null);
            setMessage("");
            setUploadedUrl("");
          }}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : "Upload Image"}
        </button>
      </form>

      <p>{message}</p>

      {uploadedUrl && (
        <div>
          <h3>Uploaded Image</h3>

          <img
            src={uploadedUrl}
            alt="Uploaded"
            style={{
              width: "300px",
              maxWidth: "100%",
              maxHeight: "300px",
              objectFit: "cover",
            }}
          />

          <p>
            <strong>Cloudinary URL:</strong>
          </p>

          <p
            style={{
              wordBreak: "break-all",
            }}
          >
            {uploadedUrl}
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadTest;