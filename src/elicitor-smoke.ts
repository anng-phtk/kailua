import { KailuaStore } from "./db/kailua-store.js";
import { ModelGateway, ModelGatewayConfig } from "./core/model-gateway.js";
import { Elicitor } from "./core/elicitor.js";

// 1. Open seeded in-memory store
const store = KailuaStore.openInMemoryWithV0SeedData();

// 2. Create ModelGateway using Ollama config
const config: ModelGatewayConfig = {
    provider: "ollama",
    endpoint: "http://localhost:11434",
    modelName: "gemma4:e4b",
};
const gateway = new ModelGateway(config);

// 3. Create Elicitor
const elicitor = new Elicitor(store, gateway);

async function runElicitorSmoke() {
    console.log("Starting elicitor smoke test for Objective ID 1 ('Build Kailua')...");
    try {
        // 4. Call processElicitationTurn(1) for Objective 'Build Kailua'
        const result = await elicitor.processElicitationTurn(1);
        
        // 5. Print the returned result
        console.log("\n--- Elicitation Turn Result ---");
        console.log(JSON.stringify(result, null, 2));
        console.log("-------------------------------\n");
    } catch (error) {
        console.error("Elicitor test failed:", error);
    } finally {
        // 6. Close the store
        store.close();
    }
}

runElicitorSmoke();
