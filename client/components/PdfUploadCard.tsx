"use client"

import { useRef } from "react";
import { UploadIcon } from "lucide-react";

const FileUploadComponent: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formdata = new FormData();
    formdata.append("pdf", file);

    console.log("Starting upload...");

    try {
      const response = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formdata,
      });

      console.log("Response received");

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      console.log("File uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="bg-slate-900 h-4rem flex items-center justify-center p-4 rounded-lg max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center cursor-pointer" onClick={handleFileUploadButtonClick}>
        <h3>Upload Pdf File</h3>
        <UploadIcon />
      </div>

      {/* ✅ Hidden input element */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploadComponent;
