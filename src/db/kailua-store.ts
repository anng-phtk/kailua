import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

export interface WorkItemContextPacketRow {
    work_item_title: string;
    topic_title: string;
    objective_title: string;
    normalized_field: string | null;
    cleaned_answer: string | null;
}

export class KailuaStore {
    private readonly db: Database.Database;

    private constructor(db: Database.Database) {
        this.db = db;
    }

    static openInMemoryWithV0SeedData(): KailuaStore {
        const db = new Database(":memory:");
        const store = new KailuaStore(db);

        store.execFile("db/schema-v0.sql");
        store.execFile("db/views-v0.sql");
        store.execFile("db/seeds/software_project_v0.sql");
        store.execFile("db/seeds/sample_kailua_journey.sql");

        return store;
    }

    getWorkItemContextPackets(): WorkItemContextPacketRow[] {
        return this.db
            .prepare(
                `
        SELECT
          work_item_title,
          topic_title,
          objective_title,
          normalized_field,
          cleaned_answer
        FROM work_item_context_packet_v0
        ORDER BY work_item_id
        `
            )
            .all() as WorkItemContextPacketRow[];
    }

    close(): void {
        this.db.close();
    }

    private execFile(path: string): void {
        this.db.exec(readFileSync(path, "utf8"));
    }
}