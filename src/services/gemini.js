import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are the AI support assistant for YakeeN.
YakeeN is a platform for finding and posting trust-based opportunities (jobs, volunteering, etc.) nearby.

Key Features:
- Opportunities: View list, filter by distance/category/trust score.
- Trust Score: A unique metric to verify the legitimacy of opportunities.
- Post: Users can post new opportunities.
- Verification: Opportunities can be verified to increase trust.

Constraint: You must ONLY answer questions related to YakeeN, its features, or general navigation within the app. If a user asks about unrelated topics (e.g., general knowledge, math, other apps), politely decline and steer them back to YakeeN.
`;

let genAI = null;
let model = null;

// Initialize if API key is present and not the placeholder
if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        // Use gemini-flash-latest to ensure we get a valid model
        model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: SYSTEM_PROMPT
        });
    } catch (error) {
        console.error("Error initializing Gemini AI:", error);
    }
}

export const getChatResponse = async (message, history = []) => {
    if (!model) {
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            return "I'm sorry, but I haven't been configured with an API key yet. Please add a valid VITE_GEMINI_API_KEY to the .env file.";
        }

        // Retry initialization
        try {
            genAI = new GoogleGenerativeAI(API_KEY);
            model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: SYSTEM_PROMPT
            });
        } catch (e) {
            console.error("Error re-initializing AI:", e);
            return "Error initializing AI service. Please check your API key.";
        }
    }

    try {
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error getting Gemini response:", error);
        return "I'm having trouble connecting to the AI right now. Please try again later.";
    }
};
