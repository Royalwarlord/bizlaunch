import { useState } from "react";

function UploadTest() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image.");
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt");

    if (!token) {
      setMessage("Authentication token not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setMessage("Uploading...");
      setUploadedUrl("");

      const response = await fetch(
        "http://localhost:5000/api/upload/image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setMessage(data.message);
      setUploadedUrl(data.imageUrl);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>BizLaunch Image Upload Test</h1>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <br />
        <br />

        <button type="submit">Upload Image</button>
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
              maxHeight: "300px",
              objectFit: "cover",
            }}
          />

          <p>
            <strong>Cloudinary URL:</strong>
          </p>

          <p style={{ wordBreak: "break-all" }}>
            {uploadedUrl}
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadTest;