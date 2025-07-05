import { Worker } from "bullmq";
import { connection } from "./redis.js";

const worker = new Worker('file-upload-queue', async(job) => {
  console.log(job.data)
}, {connection})

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});