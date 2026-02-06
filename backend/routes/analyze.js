const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SKILL_KEYWORDS = new Set([
    "python", "java", "c++", "c#", "javascript", "typescript",
    "react", "node", "express", "angular", "vue",
    "html", "css", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "oracle",
    "aws", "azure", "gcp", "docker", "kubernetes",
    "tensorflow", "pytorch", "scikit-learn", "keras",
    "hadoop", "spark", "tableau", "powerbi",
    "git", "linux", "bash"
]);

const RESUME_KEYWORDS = ["experience", "education", "skills", "projects", "summary", "work", "internship"];

function looksLikeResume(text) {
    const lowerText = text.toLowerCase();
    return RESUME_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function tokenize(text) {
    return (text.toLowerCase().match(/\b[a-zA-Z][a-zA-Z0-9.+#-]*\b/g) || []);
}

// Fixed model loader - Ported from Python logic
async function getGeminiModel() {
    const modelNames = [
        "gemini-3-pro",           // Using standard stable flash first
        "gemini-3-flash-preview",           // Attempt user's requested version
        "gemini-1.5-pro",             // Fallback to Pro
        "gemini-pro"                  // Legacy
    ];

    // NOTE: In the Node SDK, we can't easily "check" availability without making a call.
    // The Python code tries to generate "Hello". We will do the same.

    for (const name of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            // Test generation
            await model.generateContent("Hello");
            console.log(`Selected Gemini Model: ${name}`);
            return model;
        } catch (e) {
            console.warn(`Model ${name} not available: ${e.message}`);
            continue;
        }
    }
    throw new Error("No valid Gemini Flash model available.");
}

async function extractTextFromPDF(buffer) {
    // Handle pdf-parse whether it's the function (v1.1.1) or object (v2.x) style
    // to fix the user's "pdf is not a function" bug dynamically if they haven't downgraded yet.
    try {
        if (typeof pdf === 'function') {
            const data = await pdf(buffer);
            return data.text;
        } else if (typeof pdf === 'object' && pdf !== null) {
            // Attempt to find a default export or compatible method if using the other library version
            // The v2.x library often requires new PDFParse(buffer) or similar.
            // But since we can't easily predict the erratic API of the wrong library,
            // we will try the most common access patterns or throw a clear error.
            if (pdf.default && typeof pdf.default === 'function') {
                const data = await pdf.default(buffer);
                return data.text;
            }
            // If we are here, it's the wrong library version (v2.4.5) which doesn't behave like v1.1.1
            throw new Error("Incorrect pdf-parse version detected. Please run 'npm install pdf-parse@1.1.1' in backend/");
        }
        throw new Error("Unknown pdf-parse export type");
    } catch (e) {
        throw new Error(`PDF Extraction Failed: ${e.message}`);
    }
}

// @route   POST /analyze
// @desc    Analyze resume against JD
// @access  Public
router.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.json({ error: "Invalid file type. Only PDF resumes are allowed." });
        }

        const buffer = req.file.buffer;
        const resumeText = await extractTextFromPDF(buffer);

        if (!resumeText.trim()) {
            return res.json({ error: "The uploaded PDF is empty or unreadable." });
        }

        if (!looksLikeResume(resumeText)) {
            return res.json({ error: "The uploaded PDF does not appear to be a resume." });
        }

        const jdText = (req.body.jd || '').toLowerCase();
        const model = await getGeminiModel();

        // Check if it's a resume
        const checkPrompt = `
        Does the following text appear to be a resume (CV)?
        Answer only with "yes" or "no".

        Text:
        ${resumeText.substring(0, 2000)}
        `;

        const checkResult = await model.generateContent(checkPrompt);
        const checkResponse = checkResult.response.text();

        if (checkResponse.toLowerCase().includes("no")) {
            return res.json({ error: "The uploaded file does not look like a resume." });
        }

        // Analyze
        const prompt = `
        Compare this resume against the job description.

        Resume:
        ${resumeText}

        Job Description:
        ${jdText}

        Respond ONLY in JSON with:
        {
          "match": <percentage number between 0 and 100>,
          "missing_keywords": [ "keyword1", "keyword2", ... ],
          "summary": "short summary"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let jsonResponse;
        try {
            const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleaned);
        } catch (e) {
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                try {
                    jsonResponse = JSON.parse(responseText.substring(start, end + 1));
                } catch (err) {
                    // Fail silently, use fallback below
                }
            }
        }

        if (!jsonResponse) {
            return res.json({
                match: 0,
                missing_keywords: [],
                match_keywords: [],
                summary: "Analysis failed, empty response."
            });
        }

        // Local keyword matching
        const jdTokens = new Set(tokenize(jdText));
        const resumeTokens = new Set(tokenize(resumeText));

        const jdSkills = [...jdTokens].filter(word => SKILL_KEYWORDS.has(word));
        const resumeSkills = [...resumeTokens].filter(word => SKILL_KEYWORDS.has(word));
        const matchKeywords = jdSkills.filter(x => resumeSkills.includes(x));

        res.json({
            match: jsonResponse.match || 0,
            missing_keywords: jsonResponse.missing_keywords || [],
            match_keywords: matchKeywords,
            summary: jsonResponse.summary || ""
        });

    } catch (error) {
        console.error(error);
        res.json({ error: error.message });
    }
});


// @route   POST /analyze-auto
// @desc    Analyze resume (ATS mode)
// @access  Public
router.post('/analyze-auto', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.json({ error: "Invalid file type. Only PDF resumes are allowed." });
        }

        const buffer = req.file.buffer;
        const resumeText = await extractTextFromPDF(buffer);

        if (!resumeText.trim()) {
            return res.json({ error: "The uploaded PDF is empty or unreadable." });
        }

        if (!looksLikeResume(resumeText)) {
            return res.json({ error: "The uploaded PDF does not appear to be a resume." });
        }

        const topSection = resumeText.substring(0, 500);
        const model = await getGeminiModel();

        const prompt = `
        You are an ATS system. Analyze the following resume.
        Use the top section (profile/objective/summary) as the job focus.

        Resume Top Section:
        {top_section}

        Full Resume:
        {resume_text}

        Respond ONLY in JSON with:
        {
          "match": <percentage number between 0 and 100>,
          "strengths": ["skill1", "skill2", ...],
          "weaknesses": ["area1", "area2", ...],
          "summary": "short professional summary"
        }
        `;

        // Note: The python code used f-strings. I must format the string in JS.
        const formattedPrompt = prompt
            .replace('{top_section}', topSection)
            .replace('{resume_text}', resumeText);

        const result = await model.generateContent(formattedPrompt);
        const responseText = result.response.text();

        let jsonResponse;
        try {
            const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleaned);
        } catch (e) {
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                try {
                    jsonResponse = JSON.parse(responseText.substring(start, end + 1));
                } catch (err) {
                    // fail silently
                }
            }
        }

        if (!jsonResponse) {
            return res.json({
                match: 0,
                strengths: [],
                weaknesses: [],
                summary: "Analysis failed, empty response."
            });
        }

        res.json(jsonResponse);

    } catch (error) {
        console.error(error);
        res.json({ error: error.message });
    }
});

// @route   POST /suggest-skills
// @desc    Suggest skills based on job role
// @access  Public (or Protected)
router.post('/suggest-skills', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ error: "Job role is required" });
        }

        const model = await getGeminiModel();
        const prompt = `The job role is: "${role}". Suggest 5–7 technical skills, tools, or frameworks. Respond ONLY as a JSON array of strings.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let skills = [];
        try {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            skills = JSON.parse(cleaned);
        } catch (e) {
            skills = text.match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || [];
        }

        res.json(skills);

    } catch (error) {
        console.error("Gemini AI error:", error);
        res.status(500).json({ error: "Failed to fetch skills" });
    }
});

module.exports = router;
