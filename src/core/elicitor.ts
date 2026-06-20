import { KailuaStore, PlanningItemTreeRow } from "../db/kailua-store.js";
import { ModelGateway } from "./model-gateway.js";

export type ElicitationEscalationAction =
    | "propose_child_topics"
    | "split_topic"
    | "promote_work_item_to_topic"
    | "split_work_item"
    | "replan_parent_topic";

export type ElicitationTurnResult =
    | {
        status: "question";
        question: string;
    }
    | {
        status: "complete";
        refinedData: {
            title: string;
            intentStatement: string;
            description: string;
        };
    }
    | {
        status: "escalate";
        action: ElicitationEscalationAction;
        reason: string;
    };

export class Elicitor {
    constructor(
        private readonly store: KailuaStore,
        private readonly gateway: ModelGateway
    ) { }

    async processElicitationTurn(planningItemId: number): Promise<ElicitationTurnResult> {
        const item = this.getPlanningItem(planningItemId);
        const history = this.store.getElicitationHistory(planningItemId);

        const hardLimit = this.getHardLimit(item.type);

        if (history.length >= hardLimit) {
            return this.buildEscalation(item, history.length, hardLimit);
        }

        const prompt = this.compilePrompt(item, history, hardLimit);
        const response = await this.gateway.generate(prompt);

        return this.parseResponse(response, item);
    }

    private getPlanningItem(planningItemId: number): PlanningItemTreeRow {
        const item = this.store
            .getPlanningItemTree()
            .find((candidate) => candidate.id === planningItemId);

        if (!item) {
            throw new Error(`PlanningItem ${planningItemId} does not exist.`);
        }

        return item;
    }

    private getHardLimit(type: PlanningItemTreeRow["type"]): number {
        if (type === "objective") {
            return 20;
        }

        if (type === "topic") {
            return 10;
        }

        return 5;
    }

    private buildEscalation(
        item: PlanningItemTreeRow,
        historyCount: number,
        hardLimit: number
    ): ElicitationTurnResult {
        if (item.type === "objective") {
            return {
                status: "escalate",
                action: "propose_child_topics",
                reason: `Objective elicitation reached ${historyCount}/${hardLimit} questions. Propose child Topics instead of asking more questions.`,
            };
        }

        if (item.type === "topic") {
            return {
                status: "escalate",
                action: "split_topic",
                reason: `Topic elicitation reached ${historyCount}/${hardLimit} questions. Split this Topic into smaller sibling Topics.`,
            };
        }

        return {
            status: "escalate",
            action: "promote_work_item_to_topic",
            reason: `WorkItem elicitation reached ${historyCount}/${hardLimit} questions. This WorkItem is probably too large or vague and should be promoted or split.`,
        };
    }

    private compilePrompt(
        item: PlanningItemTreeRow,
        history: Array<{ question: string; answer: string }>,
        hardLimit: number
    ): string {
        const historyText =
            history.length === 0
                ? "No previous elicitation history."
                : history
                    .map((entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`)
                    .join("\n\n");

        return `
You are the Kailua Elicitation Engine.

Kailua is the clarity layer before agentic execution.
Your job is to help clarify one PlanningItem.

Current PlanningItem:
- Type: ${item.type}
- Title: ${item.title}
- Intent: ${item.intent_statement || "(empty)"}
- Description: ${item.description || "(empty)"}

Elicitation history:
${historyText}

Question limit for this item: ${hardLimit}

Decide whether the item needs one more question, is complete enough, or should be escalated for restructure.

Return exactly one JSON object.
Do not include markdown.
Do not include text outside the JSON.

Allowed responses:

{
  "status": "question",
  "question": "One concise clarifying question"
}

{
  "status": "complete",
  "refinedData": {
    "title": "Clear title",
    "intentStatement": "Clear intent statement",
    "description": "Clear description"
  }
}

{
  "status": "escalate",
  "action": "propose_child_topics",
  "reason": "Why this item should be restructured"
}
`.trim();
    }

    private parseResponse(rawResponse: string, item: PlanningItemTreeRow): ElicitationTurnResult {
        let parsed: any;

        try {
            parsed = this.parseJsonObject(rawResponse);
        } catch {
            return {
                status: "question",
                question: "What is the most important outcome this item must achieve?",
            };
        }

        if (parsed.status === "question" && typeof parsed.question === "string") {
            return {
                status: "question",
                question: parsed.question,
            };
        }

        if (
            parsed.status === "complete" &&
            parsed.refinedData &&
            typeof parsed.refinedData.title === "string" &&
            typeof parsed.refinedData.intentStatement === "string" &&
            typeof parsed.refinedData.description === "string"
        ) {
            return {
                status: "complete",
                refinedData: {
                    title: parsed.refinedData.title,
                    intentStatement: parsed.refinedData.intentStatement,
                    description: parsed.refinedData.description,
                },
            };
        }

        if (parsed.status === "escalate" && typeof parsed.reason === "string") {
            return this.normalizeEscalation(item, parsed.reason);
        }

        return {
            status: "question",
            question: "What is the most important outcome this item must achieve?",
        };
    }

    private parseJsonObject(rawResponse: string): any {
        let cleaned = rawResponse.trim();

        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        }

        return JSON.parse(cleaned);
    }

    private normalizeEscalation(
        item: PlanningItemTreeRow,
        reason: string
    ): ElicitationTurnResult {
        if (item.type === "objective") {
            return {
                status: "escalate",
                action: "propose_child_topics",
                reason,
            };
        }

        if (item.type === "topic") {
            return {
                status: "escalate",
                action: "split_topic",
                reason,
            };
        }

        return {
            status: "escalate",
            action: "promote_work_item_to_topic",
            reason,
        };
    }
}