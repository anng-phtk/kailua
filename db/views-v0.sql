CREATE VIEW planning_item_tree AS
SELECT
    child.id,
    child.parent_planning_item_id,
    child.type,
    child.title,
    child.intent_statement,
    child.description,
    child.area,
    child.status,
    parent.id AS parent_id,
    parent.type AS parent_type,
    parent.title AS parent_title
FROM planning_items child
LEFT JOIN planning_items parent
    ON parent.id = child.parent_planning_item_id;

    CREATE VIEW work_item_context AS
SELECT
    work_item.id AS work_item_id,
    work_item.title AS work_item_title,
    work_item.intent_statement AS work_item_intent_statement,
    work_item.description AS work_item_description,
    work_item.status AS work_item_status,

    topic.id AS topic_id,
    topic.title AS topic_title,
    topic.intent_statement AS topic_intent_statement,
    topic.description AS topic_description,
    topic.area AS topic_area,
    topic.status AS topic_status,

    objective.id AS objective_id,
    objective.title AS objective_title,
    objective.intent_statement AS objective_intent_statement,
    objective.description AS objective_description,
    objective.status AS objective_status
FROM planning_items work_item
JOIN planning_items topic
    ON topic.id = work_item.parent_planning_item_id
JOIN planning_items objective
    ON objective.id = topic.parent_planning_item_id
WHERE work_item.type = 'work_item'
  AND topic.type = 'topic'
  AND objective.type = 'objective';


CREATE VIEW planning_item_elicitation_history AS
SELECT
    planning_items.id AS planning_item_id,
    planning_items.type AS planning_item_type,
    planning_items.title AS planning_item_title,
    elicitation_answers.id AS elicitation_answer_id,
    elicitation_answers.question,
    elicitation_answers.paraphrased_question,
    elicitation_answers.raw_answer,
    elicitation_answers.normalized_field,
    elicitation_answers.cleaned_answer,
    elicitation_answers.confidence
FROM planning_items
JOIN elicitation_answers
    ON elicitation_answers.planning_item_id = planning_items.id;

    CREATE VIEW work_item_context_packet_v0 AS
SELECT
    context.work_item_id,
    context.work_item_title,
    context.work_item_intent_statement,
    context.work_item_description,
    context.work_item_status,

    context.topic_id,
    context.topic_title,
    context.topic_intent_statement,
    context.topic_description,
    context.topic_area,
    context.topic_status,

    context.objective_id,
    context.objective_title,
    context.objective_intent_statement,
    context.objective_description,
    context.objective_status,

    history.elicitation_answer_id,
    history.question,
    history.paraphrased_question,
    history.raw_answer,
    history.normalized_field,
    history.cleaned_answer,
    history.confidence
FROM work_item_context context
LEFT JOIN planning_item_elicitation_history history
    ON history.planning_item_id = context.work_item_id;