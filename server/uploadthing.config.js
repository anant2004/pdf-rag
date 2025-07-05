import { createUploadthing } from "uploadthing/server"

const f = createUploadthing();

export const uploadRouter = {
  pdfUploader: f({ 
    pdf: { maxFileSize: "8MB" } 
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete: ", file.serverData?.fileUrl);
  }),
};
