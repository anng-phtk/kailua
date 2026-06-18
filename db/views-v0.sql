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