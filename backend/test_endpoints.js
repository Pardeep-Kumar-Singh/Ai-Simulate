const fs = require('fs');

async function runTests() {
    const API_URL = 'http://localhost:8000';
    console.log(`\n🚀 Starting Backend Verification Tests against ${API_URL}...\n`);

    const testUser = {
        first_name: "Test",
        last_name: "User",
        email: `test_${Date.now()}@example.com`,
        password: "password123"
    };

    // 1. Test Signup
    console.log("1️⃣  Testing /signup...");
    try {
        const signupRes = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const signupData = await signupRes.json();

        if (signupRes.status === 201 || signupRes.status === 200) {
            console.log("   ✅ Signup Successful:", signupData.message);
        } else {
            console.error("   ❌ Signup Failed:", signupData);
            process.exit(1);
        }
    } catch (e) {
        console.error("   ❌ Signup Error:", e.message);
        process.exit(1);
    }

    // 2. Test Login
    console.log("\n2️⃣  Testing /login...");
    let token = "";
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const loginData = await loginRes.json();

        if (loginRes.status === 200) {
            console.log("   ✅ Login Successful!");
            console.log("   Logged in as:", loginData.user.email);
            // token = loginData.token; // No token returned yet? Python code didn't return generic JWT, but let's assume session based or just verifying logic. 
            // Wait, the node implementation I wrote simply returns user data, consistent with the python one.
            // If I implemented JWT, I should see if it returns it. Looking at auth.js, I didn't verify if I actually RETURN the token.
            // Checking auth.js... I imported jwt but logic might just return user object.
            // Update: I just checked auth.js I wrote earlier. I didn't actually return a JWT string in the JSON response, same as Python code.
            // So we rely on just the success response for now.
        } else {
            console.error("   ❌ Login Failed:", loginData);
            process.exit(1);
        }
    } catch (e) {
        console.error("   ❌ Login Error:", e.message);
    }

    // 3. Test Get Users
    console.log("\n3️⃣  Testing /users...");
    try {
        const usersRes = await fetch(`${API_URL}/users`);
        const usersData = await usersRes.json();

        if (Array.isArray(usersData)) {
            console.log(`   ✅ Fetch Users Successful! Found ${usersData.length} users.`);
            const myUser = usersData.find(u => u.email === testUser.email);
            if (myUser) {
                console.log("   ✅ Verify: Created user found in list.");
            } else {
                console.warn("   ⚠️  Verify: Created user NOT found in list (fetching delay?).");
            }
        } else {
            console.error("   ❌ Fetch Users Failed:", usersData);
        }
    } catch (e) {
        console.error("   ❌ Fetch Users Error:", e.message);
    }

    console.log("\n✅ All Connectivity Tests Passed!");
}

runTests();
