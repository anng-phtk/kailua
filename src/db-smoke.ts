import { KailuaStore } from "./db/kailua-store.js";

const store = KailuaStore.openInMemoryWithV0SeedData();

const rows = store.getWorkItemContextPacket(3);

console.table(rows);

store.close();