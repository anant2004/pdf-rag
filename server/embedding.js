const { GoogleGenerativeAI } = require("@google/generative-ai")

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

module.exports = GoogleEmbeddings;