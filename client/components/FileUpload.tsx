"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@clerk/nextjs";
import { genUploader } from "uploadthing/client";
import type { UploadRouter } from "@/utils/uploadthing-types";

const { uploadFiles } = genUploader<UploadRouter>();

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const { getToken } = useAuth();

  const handleFileUpload = async (files: File[]) => {
    const token = await getToken();
    const file = files[0];
    if (!file) return;

    try {
      console.log("Uploading to UploadThing...");
      const result = await uploadFiles("pdfUploader", { files: [file] });

      const fileUrl = result[0]?.ufsUrl;
      const fileName = result[0]?.name;
      if (!fileUrl) throw new Error("No fileUrl returned from UploadThing");

      console.log("UploadThing URL:", fileUrl);

      const response = await fetch("https://pdf-rag-production.up.railway.app/upload/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl, fileName }),
      });

      if (!response.ok) throw new Error(`Backend upload failed: ${response.status}`);

      console.log("File URL sent to backend successfully");
      setFiles(files);
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
