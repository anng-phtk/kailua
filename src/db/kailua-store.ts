import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

export interface WorkItemContextPacketRow {
    work_item_title: string;
    topic_title: string;
    objective_title: string;
    normalized_field: string | null;
    cleaned_answer: string | null;
}

export interface AddElicitationAnswerInput {
    planningItemId: number;
    templateQuestionId?: number | null;
    question: string;
    paraphrasedQuestion?: string;
    rawAnswer?: string;
    normalizedField?: string;
    cleanedAnswer?: string;
    confidence?: number;
}

export type PlanningItemType = "objective" | "topic" | "work_item";

export type PlanningItemStatus =
    | "draft"
    | "ready"
    | "active"
    | "blocked"
    | "completed"
    | "abandoned";

export interface PlanningItemTreeRow {
    id: number;
    parent_planning_item_id: number | null;
    type: "objective" | "topic" | "work_item";
    title: string;
    intent_statement: string;
    description: string;
    area: string;
    status: "draft" | "ready" | "active" | "blocked" | "completed" | "abandoned";
    parent_id: number | null;
    parent_type: "objective" | "topic" | "work_item" | null;
    parent_title: string | null;
}

export interface AddPlanningItemInput {
    type: PlanningItemType;
    parentPlanningItemId?: number | null;
    title: string;
    intentStatement?: string;
    description?: string;
    area?: string;
    status?: PlanningItemStatus;
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

    addPlanningItem(input: AddPlanningItemInput): number {
        this.validatePlanningItemHierarchy(input.type, input.parentPlanningItemId ?? null);

        const result = this.db
            .prepare(
                `
            INSERT INTO planning_items (
                parent_planning_item_id,
                type,
                title,
                intent_statement,
                description,
                area,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `
            )
            .run(
                input.parentPlanningItemId ?? null,
                input.type,
                input.title,
                input.intentStatement ?? "",
                input.description ?? "",
                input.area ?? "",
                input.status ?? "draft"
            );

        return Number(result.lastInsertRowid);
    }
    getPlanningItemTree(): PlanningItemTreeRow[] {
        return this.db
            .prepare(
                `
      SELECT
        id,
        parent_planning_item_id,
        type,
        title,
        intent_statement,
        description,
        area,
        status,
        parent_id,
        parent_type,
        parent_title
      FROM planning_item_tree
      ORDER BY id
      `
            )
            .all() as PlanningItemTreeRow[];
    }
    getWorkItemContextPacket(workItemId: number): WorkItemContextPacketRow[] {
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
        WHERE work_item_id = ?
        ORDER BY elicitation_answer_id
        `
            )
            .all(workItemId) as WorkItemContextPacketRow[];
    }

    addElicitationAnswer(input: AddElicitationAnswerInput): number {
        const result = this.db
            .prepare(
                `
      INSERT INTO elicitation_answers (
        planning_item_id,
        template_question_id,
        question,
        paraphrased_question,
        raw_answer,
        normalized_field,
        cleaned_answer,
        confidence
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
            )
            .run(
                input.planningItemId,
                input.templateQuestionId ?? null,
                input.question,
                input.paraphrasedQuestion ?? "",
                input.rawAnswer ?? "",
                input.normalizedField ?? "",
                input.cleanedAnswer ?? "",
                input.confidence ?? 0.0
            );

        return Number(result.lastInsertRowid);
    }


    close(): void {
        this.db.close();
    }

    private validatePlanningItemHierarchy(
        type: PlanningItemType,
        parentPlanningItemId: number | null
    ): void {
        if (type === "objective") {
            if (parentPlanningItemId !== null) {
                throw new Error("Objective must not have a parent PlanningItem.");
            }

            return;
        }

        if (parentPlanningItemId === null) {
            throw new Error(`${type} must have a parent PlanningItem.`);
        }

        const parent = this.db
            .prepare(
                `
            SELECT type
            FROM planning_items
            WHERE id = ?
            `
            )
            .get(parentPlanningItemId) as { type: PlanningItemType } | undefined;

        if (!parent) {
            throw new Error(`Parent PlanningItem ${parentPlanningItemId} does not exist.`);
        }

        if (type === "topic" && parent.type !== "objective") {
            throw new Error("Topic parent must be Objective.");
        }

        if (type === "work_item" && parent.type !== "topic") {
            throw new Error("WorkItem parent must be Topic.");
        }
    }
    private execFile(path: string): void {
        this.db.exec(readFileSync(path, "utf8"));
    }
}