const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const modelCandidates = [
    "gemini-3.0-pro",
    "gemini-3.0-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "models/gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "models/gemini-1.5-pro",
    "gemini-pro",
    "models/gemini-pro",
    "gemini-2.0-flash-exp"
];

async function checkModels() {
    console.log("Checking API Key against known models...");
    console.log(`API Key present: ${!!process.env.GOOGLE_API_KEY}`);

    for (const modelName of modelCandidates) {
        try {
            process.stdout.write(`Testing ${modelName}... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("Hello");
            console.log("✅ OK");
        } catch (error) {
            console.log("❌ FAILED");
            // console.log(`   Reason: ${error.message}`);
        }
    }
}

checkModels();
