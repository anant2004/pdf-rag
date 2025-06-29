import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PineconeStore } from "@langchain/pinecone"; 
import { Pinecone } from "@pinecone-database/pinecone"; 
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Google Embeddings remains the same
import fs from 'fs';
import 'dotenv/config';

// Your custom GoogleEmbeddings class (remains unchanged)
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

// Redis connection for BullMQ (remains unchanged)
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

        // Clean + filter empty/invalid content (remains unchanged)
        const cleanedDocs = splitDocs.filter(
            (doc) => doc.pageContent && doc.pageContent.trim().length > 0
        );

        // Optional: truncate overly long chunks to 8000 characters
        // IMPORTANT: Ensure this is a Langchain Document object for PineconeVectorStore
        const truncatedDocs = cleanedDocs.map((doc) => {
            return new Document({ // <--- Changed this back to 'new Document()'
                pageContent: doc.pageContent.trim().slice(0, 8000),
                metadata: {
                    userId,
                    filename,
                    // Preserve original metadata from PDFLoader if desired
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
            console.warn("No documents to add after splitting and cleaning.");
            // Consider if you want to throw an error or just complete the job if no valid docs
            return; // Exit if no documents to process
        }

        const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);

        // --- Pinecone Specific Code ---
        const pinecone = new Pinecone(); // Initialize the Pinecone client
        // Ensure process.env.PINECONE_INDEX is set in your .env file
        const index = pinecone.Index(process.env.PINECONE_INDEX); // Get the specific index instance

        await PineconeStore.fromDocuments(truncatedDocs, embeddings, {
            pineconeIndex: index,
            namespace: userId // Use userId as the namespace for isolation
        });
        // -----------------------------

        console.log("Docs added to Pinecone under namespace:", userId);
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});