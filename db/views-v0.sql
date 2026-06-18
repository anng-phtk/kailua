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