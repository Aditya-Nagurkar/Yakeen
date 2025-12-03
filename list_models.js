import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyAPnl4smczt5ITk-_-AIdjOBkjxd1VqOwE';

async function main() {
    // Direct REST call to list models since SDK might hide some or have version issues
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

main();
