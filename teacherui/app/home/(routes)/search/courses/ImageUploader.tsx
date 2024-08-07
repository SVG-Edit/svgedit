"use client";

import React, { useState, useRef } from "react";

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        localStorage.setItem("recent-image", result);
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = () => {
    if (image) {
      const link = document.createElement("a");
      link.href = image;
      link.download = "uploaded-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        ref={fileInputRef}
        id="image-upload"
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </button>
      {image && (
        <>
          <img src={image} alt="Uploaded" className="uploaded-image" />
          <button onClick={handleDownloadImage}>Download Image</button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
