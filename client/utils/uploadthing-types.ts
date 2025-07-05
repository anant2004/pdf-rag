import type { FileRouter } from "uploadthing/server";

export type UploadRouter = {
  pdfUploader: FileRouter["pdfUploader"];
};
