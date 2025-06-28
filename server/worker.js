import { Worker } from "bullmq";
import IORedis from "ioredis";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import 'dotenv/config';

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

// Redis connection for BullMQ
const connection = new IORedis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
});

connection.on("connect", () => {
    console.log("Worker connected to Redis");
});

connection.on("error", (err) => {
    console.error("Redis connection error in Worker:", err);
});

const worker = new Worker(
    "file-upload-queue",
    async (job) => {
        console.log("Job received : ", job.data)
        const { userId, filename, path } = job.data;

        if (!fs.existsSync(path)) {
            throw new Error(`File does not exist at path: ${path}`);
        }

        const loader = new PDFLoader(path);
        const docs = await loader.load();

        const textSplitter = new CharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 50,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        // Clean + filter empty/invalid content
        const cleanedDocs = splitDocs.filter(
            (doc) => doc.pageContent && doc.pageContent.trim().length > 0
        );

        // Optional: truncate overly long chunks to 8000 characters
        const truncatedDocs = cleanedDocs.map((doc) => {
            return {
                pageContent: doc.pageContent.trim().slice(0, 8000),
                metadata: {
                    userId,
                    filename,
                    pdf: doc.metadata?.pdf,
                    loc: doc.metadata?.loc,
                    source: doc.metadata?.source
                }
            };
        });

        console.log("Sample metadata of a document before adding to Qdrant:");
        console.log(truncatedDocs[0].metadata);

        const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL,
            collectionName: "pdf-docs",
        });

        await vectorStore.addDocuments(truncatedDocs);

        console.log("Docs added to Qdrant collection");
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});
