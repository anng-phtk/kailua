import { KailuaStore } from "./db/kailua-store.js";

const store = KailuaStore.openInMemoryWithV0SeedData();

console.log("Planning item tree");
console.table(store.getPlanningItemTree());


store.addElicitationAnswer({
    planningItemId: 3,
    question: "What proves this work item is done?",
    rawAnswer: "The smoke test loads schema, views, seeds, and selected context packet.",
    normalizedField: "completion_signal",
    cleanedAnswer: "The smoke test loads schema, views, seeds, and the selected WorkItem context packet.",
    confidence: 0.9,
});


console.log("Selected WorkItem context packet");
const rows = store.getWorkItemContextPacket(3);
console.table(rows);

store.close();