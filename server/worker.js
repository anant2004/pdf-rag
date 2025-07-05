import axios from "axios";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Worker } from "bullmq";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { connection } from "./redis.js";
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

console.log(process.env.REDIS_URL)

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log("Job received : ", job.data)
        const { userId, fileUrl, fileName } = job.data;

        const tempPath = path.join(os.tmpdir(), `${uuidv4()}.pdf`);
        const writer = fs.createWriteStream(tempPath);
        const response = await axios.get(fileUrl, { responseType: "stream" });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        if (!fs.existsSync(tempPath)) {
            throw new Error(`File does not exist at path: ${tempPath}`);
        }

        const loader = new PDFLoader(tempPath);
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
            return new Document({ // <--- Changed this back to 'new Document()'
                pageContent: doc.pageContent.trim().slice(0, 8000),
                metadata: {
                    userId,
                    fileName,
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
            return;
        }

        const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);


        const pinecone = new Pinecone(); 
        const index = pinecone.Index(process.env.PINECONE_INDEX); 

        await PineconeStore.fromDocuments(truncatedDocs, embeddings, {
            pineconeIndex: index,
            namespace: userId 
        });

        console.log("Docs added to Pinecone under namespace:", userId);

        fs.unlink(tempPath, (err) => {
            if (err) console.warn("Failed to delete temp file:", err.message);
        });
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});