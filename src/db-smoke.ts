import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

const db = new Database(":memory:");

db.exec(readFileSync("db/schema-v0.sql", "utf8"));
db.exec(readFileSync("db/views-v0.sql", "utf8"));
db.exec(readFileSync("db/seeds/software_project_v0.sql", "utf8"));
db.exec(readFileSync("db/seeds/sample_kailua_journey.sql", "utf8"));

const rows = db
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
    .all();

console.table(rows);
db.close();