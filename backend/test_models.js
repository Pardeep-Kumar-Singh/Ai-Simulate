const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
    try {
        // For older SDK versions, usage might differ. 
        // But for @google/generative-ai, we typically just try models.
        // There isn't a direct listModels() on the client instance in some versions.
        // But we can try the model references.
        // Actually, checking documentation (knowledge), default is gemini-pro.
        // Let's try to just generate with gemini-pro in this script.

        console.log("Atempting with gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-pro:", e.message);

        try {
            console.log("Atempting with gemini-1.5-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-1.5-pro:", result2.response.text());
        } catch (e2) {
            console.error("Failed with gemini-1.5-pro:", e2.message);
        }
    }
}

listModels();
