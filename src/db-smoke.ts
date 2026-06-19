import { KailuaStore } from "./db/kailua-store.js";

const store = KailuaStore.openInMemoryWithV0SeedData();

const rows = store.getWorkItemContextPackets();

console.table(rows);

store.close();