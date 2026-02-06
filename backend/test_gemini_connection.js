const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log("Testing Gemini Connection with gemini-2.0-flash...");

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        console.log("GenAI Client initialized.");

        const modelName = "gemini-2.0-flash";
        console.log(`Getting model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        console.log(`✅ Success! Response: ${result.response.text()}`);

    } catch (error) {
        console.error("Error during test:", error);
    }
}

testConnection();
