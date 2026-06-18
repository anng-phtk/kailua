INSERT INTO templates (name, description, version, status)
VALUES (
    'Software Project V0',
    'A minimal elicitation template for turning a vague software project idea into an Objective, Topic, and WorkItem.',
    '0.1.0',
    'draft'
);

INSERT INTO template_questions (
    template_id,
    planning_item_type,
    question_order,
    question,
    paraphrased_question,
    normalized_field,
    help_text
)
VALUES
(
    1,
    'objective',
    1,
    'What are you trying to build, and why does it matter?',
    'State the project objective and its purpose.',
    'intent_statement',
    'A good answer should help form a sentence like: As a user or builder, I can do something, so that a useful outcome is achieved.'
),
(
    1,
    'topic',
    2,
    'What is one major area or topic of work needed to make this objective real?',
    'Identify one meaningful topic under the objective.',
    'title',
    'Examples: data model, UI, deployment, validation, planning workflow, execution boundary.'
),
(
    1,
    'work_item',
    3,
    'What is one bounded work item inside that topic?',
    'Identify one concrete work item that contributes to the selected topic.',
    'title',
    'A good work item should be small enough to inspect, refine, and eventually generate one or more executables.'
);