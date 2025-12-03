import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyAPnl4smczt5ITk-_-AIdjOBkjxd1VqOwE';

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    try {
        // For listing models, we might need to use the model manager if available, 
        // but the SDK usually exposes it via getGenerativeModel for generation.
        // Actually, the SDK doesn't have a direct 'listModels' method on the client instance in all versions.
        // Let's try a simple generation with a known older model to see if it works, 
        // or use the REST API directly to list models if the SDK fails.

        // Attempt 1: Try gemini-pro (often standard)
        console.log("Testing gemini-pro...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("gemini-pro works!");
        } catch (e) {
            console.log("gemini-pro failed:", e.message);
        }

        // Attempt 2: Try gemini-1.5-flash
        console.log("Testing gemini-1.5-flash...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello");
            console.log("gemini-1.5-flash works!");
        } catch (e) {
            console.log("gemini-1.5-flash failed:", e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
