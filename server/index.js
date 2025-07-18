import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/pinecone";
import { requireAuth } from "@clerk/express";
import { uploadRouter } from "./uploadthing.config.js"
import { bullBoardRouter } from './bullboard.js';
import { connection } from './redis.js';
import 'dotenv/config';
import { log } from 'console';


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

connection.on("error", (err) => {
    console.error("Redis connection error in BullMQ:", err);
});
connection.on("connect", () => {
    console.log("BullMQ connected to Redis");
});

const queue = new Queue("file-upload-queue", { connection });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin/queues', bullBoardRouter)

app.get('/', (req, res) => {
    return res.json({ message: "Everything is working fine!" });
})

app.post('/upload/pdf', requireAuth(), async (req, res) => {
    console.log("/upload/pdf endpoint hit");

    const { userId } = await req.auth();
    const { fileUrl, fileName } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!fileUrl) {
        return res.status(400).json({ message: "Missing fileUrl" });
    }

    try {
        console.log('File URL received:', fileUrl);

        await queue.add('pdf-upload', {
            fileUrl,
            fileName,
            userId
        });

        console.log('Job added to queue');

        return res.status(200).json({ message: 'File uploaded and queued successfully' });
    } catch (err) {
        console.error('Error handling upload:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/chat', requireAuth(), async (req, res) => {
    console.log("/chat endpoint hit")

    const { userId } = req.auth;
    console.log("user id", userId)
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
            // When using Pinecone namespaces for userId isolation, you typically
            // *do not* need an additional filter on `userId` in the `asRetriever` options,
            // because the `namespace` parameter already restricts the search scope.
            // If you had other metadata fields you wanted to filter on (e.g., file type),
            // you would add them here.
            // filter: { /* other_metadata_field: "value" */ }
        });

        //console.log("Retreiver: ", retriever)

        const retrievedDocs = await retriever.invoke(userQuery);
        if (retrievedDocs.length === 0) {
            console.warn("No documents retrieved for user:", userId, "in namespace:", userId);
        }

        const contextString = retrievedDocs.map(doc => doc.pageContent).join("\n\n---\n\n");
        console.log("Context string being passed to LLM (truncated for brevity):", contextString.substring(0, 500) + '...'); // Truncate for log readability

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
            //query: userQuery,
            //retrievedContext: retrievedDocs.map(doc => doc.pageContent), // Optionally return raw retrieved content
            llmChatResult: llmResponse
        });

    } catch (error) {
        console.error('Error during chat query:', error);
        return res.status(500).json({ message: 'Error processing chat query', error: error.message });
    }
});

app.listen(8000, () => {
    console.log('Server is running at http://localhost:8000');
});