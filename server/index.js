import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantVectorStore } from '@langchain/qdrant';
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

app.get('/', (req, res) => {
    return res.json({ message: "Everything is working fine!" });
})
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    try {
        console.log('File received:', req.file);

        await queue.add('pdf-upload', {
            filename: req.file.filename,
            path: req.file.path,
        });

        console.log('Job added to queue');

        return res.status(200).json({ message: 'File uploaded successfully' });
    } catch (err) {
        console.error('Error handling upload:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/chat', async (req, res) => {
    if (!process.env.GOOGLE_API_KEY || !process.env.QDRANT_URL) {
        console.error("Missing GOOGLE_API_KEY or QDRANT_URL environment variables.");
        return res.status(500).json({ message: "Server configuration error: API keys missing." });
    }

    // Make the user query dynamic, e.g., from req.query.q or req.body.query
    const userQuery = "What is the main topic of this document?";

    try {
        const embeddings = new GoogleEmbeddings(process.env.GOOGLE_API_KEY);
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL,
            collectionName: "pdf-docs",
        });

        const retriever = vectorStore.asRetriever({
            k: 2 // Retrieve 2 relevant chunks
        });

        // Step 1: Retrieve relevant documents based on user query
        const retrievedDocs = await retriever.invoke(userQuery);

        // Step 2: Format the retrieved documents into a context string for the LLM
        // We extract only the pageContent from each document
        const contextString = retrievedDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

        // Step 3: Define the system prompt with the context
        const SYSTEM_PROMPT = `Can you list the core pillars of sustainable urbanization?

        Context:${contextString}`;

        // Step 4: Initialize Gemini 1.5 Pro
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Step 5: Generate content using the LLM
        const chatResult = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "user", parts: [{ text: `Based on the context, answer the following question: "${userQuery}"` }] } 
            ]
        });

        const llmResponse = chatResult.response.text();

        // Step 6: Send the LLM's response back
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

