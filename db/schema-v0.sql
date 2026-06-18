PRAGMA foreign_keys = ON;

CREATE TABLE templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    version TEXT NOT NULL DEFAULT '0.1.0',
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'ready', 'active', 'blocked', 'completed', 'abandoned'))
);

CREATE TABLE template_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    planning_item_type TEXT NOT NULL
        CHECK (planning_item_type IN ('objective', 'topic', 'work_item')),
    question_order INTEGER NOT NULL,
    question TEXT NOT NULL,
    paraphrased_question TEXT NOT NULL DEFAULT '',
    normalized_field TEXT NOT NULL,
    help_text TEXT NOT NULL DEFAULT '',

    FOREIGN KEY (template_id)
        REFERENCES templates(id)
        ON DELETE CASCADE
);

CREATE TABLE planning_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_planning_item_id INTEGER,
    template_id INTEGER,
    type TEXT NOT NULL
        CHECK (type IN ('objective', 'topic', 'work_item')),
    title TEXT NOT NULL,
    intent_statement TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    area TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'ready', 'active', 'blocked', 'completed', 'abandoned')),

    FOREIGN KEY (parent_planning_item_id)
        REFERENCES planning_items(id)
        ON DELETE CASCADE,

    FOREIGN KEY (template_id)
        REFERENCES templates(id)
        ON DELETE SET NULL
);

CREATE TABLE elicitation_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planning_item_id INTEGER NOT NULL,
    template_question_id INTEGER,
    question TEXT NOT NULL,
    paraphrased_question TEXT NOT NULL DEFAULT '',
    raw_answer TEXT NOT NULL DEFAULT '',
    normalized_field TEXT NOT NULL DEFAULT '',
    cleaned_answer TEXT NOT NULL DEFAULT '',
    confidence REAL NOT NULL DEFAULT 0.0
        CHECK (confidence >= 0.0 AND confidence <= 1.0),

    FOREIGN KEY (planning_item_id)
        REFERENCES planning_items(id)
        ON DELETE CASCADE,

    FOREIGN KEY (template_question_id)
        REFERENCES template_questions(id)
        ON DELETE SET NULL
);

CREATE TABLE executables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planning_item_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    execution_statement TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    payload_type TEXT NOT NULL DEFAULT 'shell',
    raw_payload TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'ready', 'active', 'blocked', 'completed', 'abandoned')),
    status_description TEXT NOT NULL DEFAULT '',

    FOREIGN KEY (planning_item_id)
        REFERENCES planning_items(id)
        ON DELETE CASCADE
);


CREATE TRIGGER validate_planning_item_hierarchy_insert
BEFORE INSERT ON planning_items
FOR EACH ROW
BEGIN
    SELECT
        CASE
            WHEN NEW.type = 'objective'
                 AND NEW.parent_planning_item_id IS NOT NULL
            THEN RAISE(ABORT, 'Objective cannot have a parent.')

            WHEN NEW.type = 'topic'
                 AND (
                    NEW.parent_planning_item_id IS NULL
                    OR (
                        SELECT type
                        FROM planning_items
                        WHERE id = NEW.parent_planning_item_id
                    ) != 'objective'
                 )
            THEN RAISE(ABORT, 'Topic parent must be Objective.')

            WHEN NEW.type = 'work_item'
                 AND (
                    NEW.parent_planning_item_id IS NULL
                    OR (
                        SELECT type
                        FROM planning_items
                        WHERE id = NEW.parent_planning_item_id
                    ) != 'topic'
                 )
            THEN RAISE(ABORT, 'WorkItem parent must be Topic.')
        END;
END;

CREATE TRIGGER validate_planning_item_hierarchy_update
BEFORE UPDATE OF type, parent_planning_item_id ON planning_items
FOR EACH ROW
BEGIN
    SELECT
        CASE
            WHEN NEW.type = 'objective'
                 AND NEW.parent_planning_item_id IS NOT NULL
            THEN RAISE(ABORT, 'Objective cannot have a parent.')

            WHEN NEW.type = 'topic'
                 AND (
                    NEW.parent_planning_item_id IS NULL
                    OR (
                        SELECT type
                        FROM planning_items
                        WHERE id = NEW.parent_planning_item_id
                    ) != 'objective'
                 )
            THEN RAISE(ABORT, 'Topic parent must be Objective.')

            WHEN NEW.type = 'work_item'
                 AND (
                    NEW.parent_planning_item_id IS NULL
                    OR (
                        SELECT type
                        FROM planning_items
                        WHERE id = NEW.parent_planning_item_id
                    ) != 'topic'
                 )
            THEN RAISE(ABORT, 'WorkItem parent must be Topic.')
        END;
END;


