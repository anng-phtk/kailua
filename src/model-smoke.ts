import { ModelGateway, ModelGatewayConfig } from "./core/model-gateway.js";

// 1. Local Ollama Config (Default Active Test)
const ollamaConfig: ModelGatewayConfig = {
    provider: "ollama",
    endpoint: "http://localhost:11434",
    modelName: "gemma4:e4b" // Match user's local model tag
};

// 2. Cloud Gemini Config (Commented out for future test)
const geminiConfig: ModelGatewayConfig = {
    provider: "gemini",
    endpoint: "https://generativelanguage.googleapis.com",
    modelName: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY || "YOUR_GEMINI_KEY"
};

async function runSmokeTest() {
    console.log("Starting model gateway smoke test...");
    
    // Choose active config (change to geminiConfig to test cloud)
    const activeConfig = ollamaConfig; 
    console.log(`Using provider: ${activeConfig.provider} (Model: ${activeConfig.modelName})`);

    const gateway = new ModelGateway(activeConfig);

    try {
        console.log("Sending test prompt: 'Hi model, say hello in exactly 5 words.'");
        const reply = await gateway.generate("Hi model, say hello in exactly 5 words.");
        console.log("\n--- Model Response ---");
        console.log(reply.trim());
        console.log("----------------------\n");
        console.log("Success: Model connection verified!");
    } catch (error) {
        console.error("ERROR: Model query failed.");
        console.error(error);
    }
}

runSmokeTest();
