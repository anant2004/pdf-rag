import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { QdrantClient } from "@qdrant/js-client-rest";
import { requireAuth } from "@clerk/express";
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
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

async function setupQdrantIndex() {

    try {
        await qdrant.createPayloadIndex('pdf-docs', {
            field_name: 'userId',
            field_schema: 'keyword', // or 'string'
        });
        console.log("Payload index on 'userId' created.");
    } catch (err) {
        if (err.message.includes("already exists")) {
            console.log("ℹPayload index on 'userId' already exists.");
        } else {
            console.error("Failed to create payload index:", err);
        }
    }
}

const connection = new IORedis({
    host: "localhost",
    port: 6379,
});

connection.on("error", (err) => {
    console.error("Redis connection error in BullMQ:", err);
});
connection.on("connect", () => {
    console.log("BullMQ connected to Redis");
});

const queue = new Queue("file-upload-queue", { connection });



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

await setupQdrantIndex();

app.get('/', (req, res) => {
    return res.json({ message: "Everything is working fine!" });
})

app.post('/upload/pdf', upload.single('pdf'), requireAuth(), async (req, res) => {
    console.log("/upload/pdf endpoint hit");
    console.log("file: ", req.file)
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
    console.log("/chat endpoint hit")

    const { userId } = await req.auth;
    console.log("user id", userId)
    console.log("Type of userId:", typeof userId);

    if (!process.env.GOOGLE_API_KEY || !process.env.QDRANT_URL) {
        console.error("Missing GOOGLE_API_KEY or QDRANT_URL environment variables.");
        return res.status(500).json({ message: "Server configuration error: API keys missing." });
    }

    // Make the user query dynamic, e.g., from req.query.q or req.body.query
    const userQuery = req.query.message;

    console.log('User query:', userQuery);

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
        return res.status(400).json({ message: "Missing or empty 'message' query parameter." });
    }

    try {
        const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL,
            collectionName: "pdf-docs",
        });

        const retriever = vectorStore.asRetriever({
            k: 2,
            filter: {
                userId: userId
            }
        });

        //console.log("Retreiver: ", retriever)

        const retrievedDocs = await retriever.invoke(userQuery);
        if (retrievedDocs.length === 0) {
            console.warn("No documents retrieved for user:", userId);
        }

        const contextString = retrievedDocs.map(doc => doc.pageContent).join("\n\n---\n\n");
        console.log("Context string being passed to LLM:", contextString);

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

