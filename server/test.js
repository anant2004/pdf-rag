import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/pinecone";
import { requireAuth } from "@clerk/express";
import 'dotenv/config'; // Ensure this is at the very top to load env vars

// Imports specifically for the worker functionality
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import fs from 'fs'; // For file system operations (e.g., deleting uploaded files)

class GoogleEmbeddings {
  constructor(apiKey) {
    this.model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "embedding-001" });
  }

  async embedQuery(text) {
    const result = await this.model.embedContent({
      content: { parts: [{ text }] },
    });
    return result.embedding.values;
  }

  async embedDocuments(texts) {
    const results = await Promise.all(
      texts.map(async (text) => {
        const result = await this.model.embedContent({
          content: { parts: [{ text }] },
        });
        return result.embedding.values;
      })
    );
    return results;
  }
}

const connection = new IORedis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  retryStrategy: times => {
    const delay = Math.min(times * 50, 2000);
    console.warn(`Redis reconnecting (attempt ${times}). Retrying in ${delay}ms...`);
    return delay;
  },
  pingInterval: 5000
});

connection.on("error", (err) => {
  console.error("Redis connection error (main process/worker):", err);
});
connection.on("connect", () => {
  console.log("Redis connected (main process/worker)");
});


const queue = new Queue("file-upload-queue", { connection });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync('./uploads', { recursive: true });
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ message: "Everything is working fine!" });
});

app.post('/upload/pdf', upload.single('pdf'), requireAuth(), async (req, res) => {
  console.log("/upload/pdf endpoint hit");
  console.log("file: ", req.file);
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    console.log('File received:', req.file);
    await queue.add('pdf-upload', {
      filename: req.file.filename,
      path: req.file.path,
      userId
    });

    console.log('Job added to queue');

    return res.status(200).json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error('Error handling upload:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/chat', requireAuth(), async (req, res) => {
  console.log("/chat endpoint hit");

  const { userId } = req.auth;
  console.log("user id", userId);
  console.log("Type of userId:", typeof userId);

  if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_INDEX || !process.env.PINECONE_ENVIRONMENT) {
    console.error("Missing GOOGLE_API_KEY, PINECONE_INDEX, or PINECONE_ENVIRONMENT environment variables.");
    return res.status(500).json({ message: "Server configuration error: API keys missing." });
  }

  const userQuery = req.query.message;

  console.log('User query:', userQuery);

  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
    return res.status(400).json({ message: "Missing or empty 'message' query parameter." });
  }

  try {
    const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);

    const pinecone = new Pinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: userId
    });

    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    const retrievedDocs = await retriever.invoke(userQuery);
    if (retrievedDocs.length === 0) {
      console.warn("No documents retrieved for user:", userId, "in namespace:", userId);
    }

    const contextString = retrievedDocs.map(doc => doc.pageContent).join("\n\n---\n\n");
    console.log("Context string being passed to LLM (truncated for brevity):", contextString.substring(0, 500) + '...');

    const SYSTEM_PROMPT = `Context:${contextString}`;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatResult = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: `Based on the context, answer the following question: "${userQuery}"` }] }
      ]
    });

    const llmResponse = chatResult.response.text();

    return res.json({
      llmChatResult: llmResponse
    });

  } catch (error) {
    console.error('Error during chat query:', error);
    return res.status(500).json({ message: 'Error processing chat query', error: error.message });
  }
});

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("[Worker] Job received:", job.data);
    const { userId, filename, path } = job.data;

    if (!fs.existsSync(path)) {
      console.error(`[Worker] File does not exist at path: ${path}. This is expected if using ephemeral storage without cloud integration.`);
      throw new Error(`File not found for processing: ${path}. Ensure persistent storage.`);
    }

    try {
      const loader = new PDFLoader(path);
      const docs = await loader.load();

      const textSplitter = new CharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 50,
      });

      const splitDocs = await textSplitter.splitDocuments(docs);

      const cleanedDocs = splitDocs.filter(
        (doc) => doc.pageContent && doc.pageContent.trim().length > 0
      );

      const truncatedDocs = cleanedDocs.map((doc) => {
        return new Document({
          pageContent: doc.pageContent.trim().slice(0, 8000),
          metadata: {
            userId,
            filename,
            pdf: doc.metadata?.pdf,
            loc: doc.metadata?.loc,
            source: doc.metadata?.source
          }
        });
      });

      console.log("Sample metadata of a document before adding to Pinecone:");
      if (truncatedDocs.length > 0) {
        console.log(truncatedDocs[0].metadata);
        console.log("Expected Pinecone Namespace:", userId);
      } else {
        console.warn("[Worker] No documents to add after splitting and cleaning.");
        return; // Exit if no documents to process
      }

      const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);

      const pinecone = new Pinecone();
      const index = pinecone.Index(process.env.PINECONE_INDEX);

      await PineconeStore.fromDocuments(truncatedDocs, embeddings, {
        pineconeIndex: index,
        namespace: userId
      });

      console.log("[Worker] Docs added to Pinecone under namespace:", userId);

      fs.unlink(path, (err) => {
        if (err) console.error(`[Worker] Error deleting file ${path}:`, err);
        else console.log(`[Worker] Deleted local file: ${path}`);
      });

    } catch (workerErr) {
      console.error(`[Worker] Error processing job ${job.id} for user ${userId}, file ${filename}:`, workerErr);
      throw workerErr; 
    }

  },
  {
    connection, 
    concurrency: 1
  }
);

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

console.log("BullMQ Worker integrated and started within the main application process.");

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT} (for local testing)`);
});