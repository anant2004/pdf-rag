const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "localhost",
  port: 6379,
});

connection.on("error", (err) => {
  console.error("❌ Redis connection error in BullMQ:", err);
});
connection.on("connect", () => {
  console.log("✅ BullMQ connected to Redis");
});

const queue = new Queue("file-upload-queue", { connection });

