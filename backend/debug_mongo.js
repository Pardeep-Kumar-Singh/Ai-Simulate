const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log("Attempting to connect with URI (masked):", uri.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS! Connected to MongoDB.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ CONNECTION FAILED");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.codeName) console.error("Code Name:", err.codeName);
        if (err.code) console.error("Error Code:", err.code);

        console.log("\n--- TROUBLESHOOTING GUIDE ---");
        if (err.message.includes('authentication failed') || err.code === 8000) {
            console.log("1. PASSWORD MISMATCH: The password in .env does not match the one in MongoDB Atlas.");
            console.log("   -> Go to Atlas > Database Access > Edit User > Edit Password.");
            console.log("2. USERNAME INVALID: Double check the username (sspardeep143).");
        } else if (err.message.includes('bad auth')) {
            console.log("1. IP BLOCKED: This error often happens if your IP is not whitelisted.");
            console.log("   -> Go to Atlas > Network Access > Add IP Address > Allow Access From Anywhere.");
        }
        process.exit(1);
    });
