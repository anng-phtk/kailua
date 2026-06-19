import { KailuaStore } from "./db/kailua-store.js";
// open seeded DB
const store = KailuaStore.openInMemoryWithV0SeedData();

// 1. Test valid creation
console.log("\nTesting valid tree addition...");
// add a few new planning item → add a valid Objective → Topic → WorkItem chain
const objId = store.addPlanningItem({
    type: "objective",
    title: "New Marketing Campaign",
    description: "Launch next gen marketing campaign",
});
const topicId = store.addPlanningItem({
    type: "topic",
    parentPlanningItemId: objId,
    title: "Email Outreach",
    description: "Cold and warm email campaigns",
});
const workItemId = store.addPlanningItem({
    type: "work_item",
    parentPlanningItemId: topicId,
    title: "Draft Email Templates",
    description: "Write initial templates",
});

console.log(`Successfully added items: Objective (${objId}), Topic (${topicId}), WorkItem (${workItemId})`);

store.updatePlanningItemStatus(workItemId, "active");
store.updatePlanningItemStatus(workItemId, "completed");

// 2. Test validation failure (Hierarchy Law violation)
console.log("\nTesting hierarchy violation validation...");
try {
    store.addPlanningItem({
        type: "topic",
        parentPlanningItemId: workItemId, // Invalid: parent of Topic must be Objective, but workItemId is a WorkItem.
        title: "Subtopic of Email Templates",
    });
    console.error("ERROR: Allowed invalid hierarchy insertion!");
} catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Success: Correctly blocked invalid hierarchy insertion with error: "${message}"`);
}


// Print planning tree to verify the new item is added correctly with hierarchy info
console.log("Planning item tree");
console.table(store.getPlanningItemTree());

// add elicitation answer for a work item 3
store.addElicitationAnswer({
    planningItemId: 3,
    question: "What proves this work item is done?",
    rawAnswer: "The smoke test loads schema, views, seeds, and selected context packet.",
    normalizedField: "completion_signal",
    cleanedAnswer: "The smoke test loads schema, views, seeds, and the selected WorkItem context packet.",
    confidence: 0.9,
});

console.log("\nSelected WorkItem context packet (WorkItem 3)");

// print context packet for work item 3 to verify the elicitation answer is stored and retrieved correctly
const rows = store.getWorkItemContextPacket(3);
console.table(rows);

store.close();