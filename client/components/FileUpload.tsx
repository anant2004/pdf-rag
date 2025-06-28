"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@clerk/nextjs";

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const { getToken } = useAuth();

  const handleFileUpload = async (files: File[]) => {
    const token = await getToken();
    const file = files[0];
    if (!file) return;

    const formdata = new FormData();
    formdata.append("pdf", file);

    console.log("Starting upload...");

    try {
      const response = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formdata,
      });

      console.log("Response received");

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      console.log("File uploaded successfully");
      setFiles(files); // Optionally store the uploaded file in state
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}
