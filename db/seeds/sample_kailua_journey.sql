INSERT INTO planning_items (
    id,
    parent_planning_item_id,
    template_id,
    type,
    title,
    intent_statement,
    description,
    area,
    status
)
VALUES
(
    1,
    NULL,
    1,
    'objective',
    'Build Kailua',
    'As a builder, I can turn vague goals into a durable planning tree, so that I can plan and execute work under uncertainty.',
    'Kailua is a local-first planning and execution workbench that helps a human clarify goals, build a work tree, generate candidate executables, and keep execution under human approval.',
    'planning-system',
    'ready'
),
(
    2,
    1,
    1,
    'topic',
    'Planning data model',
    'As a builder, I can define the core planning data model, so that Kailua has a durable structure for objectives, topics, work items, and executables.',
    'This topic covers the SQLite-backed structure that stores PlanningItems, Executables, Templates, TemplateQuestions, and ElicitationAnswers.',
    'data-model',
    'ready'
),
(
    3,
    2,
    1,
    'work_item',
    'Validate the V0 SQLite schema',
    'As a builder, I can validate the V0 SQLite schema, so that Kailua can safely store a valid planning tree.',
    'This work item proves that the schema loads, creates expected tables, and enforces the hierarchy law for Objective, Topic, and WorkItem.',
    'data-model',
    'completed'
);

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
VALUES
(
    1,
    1,
    'What are you trying to build, and why does it matter?',
    'State the project objective and its purpose.',
    'I want Kailua to help me turn messy goals into a planning tree and later execute approved work safely.',
    'intent_statement',
    'As a builder, I can turn vague goals into a durable planning tree, so that I can plan and execute work under uncertainty.',
    0.95
),
(
    2,
    2,
    'What is one major area or topic of work needed to make this objective real?',
    'Identify one meaningful topic under the objective.',
    'We need the database model first: planning items, executable items, and the questions that helped clarify them.',
    'title',
    'Planning data model',
    0.9
),
(
    3,
    3,
    'What is one bounded work item inside that topic?',
    'Identify one concrete work item that contributes to the selected topic.',
    'Create and validate the first SQLite schema with hierarchy rules.',
    'title',
    'Validate the V0 SQLite schema',
    0.9
);