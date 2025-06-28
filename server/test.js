import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import 'dotenv/config';

const GOOGLE_API_KEY = "AIzaSyBNA-R1FMeIZ8YO37lfErFXkLagR83XEAs"
const QDRANT_URL = "http://localhost:6333"

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

const client = new QdrantClient({ url: QDRANT_URL });
const qdrant = new QdrantClient({ url: QDRANT_URL });
const userId = "user_2yxnPJlwxjIo9VnNTSBEF85cCx4";

await client.createPayloadIndex('pdf-docs', {
  field_name: 'userId',
  field_schema: 'keyword', // or 'string' — both are valid for filtering
});

console.log("Payload index on 'userId' created.");

const embeddings = new GoogleEmbeddings(GOOGLE_API_KEY);

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  client,
  collectionName: "pdf-docs",
});

const retriever = vectorStore.asRetriever({
  k: 2,
});

const scroll = await client.scroll("pdf-docs", {
  limit: 5,
});

for (const point of scroll.points) {
  console.log("Payload:", point.payload);
}

const results = await retriever.invoke("test");
//console.log("Filtered results:", results.length);
//console.log("Sample result:", results[0]);
