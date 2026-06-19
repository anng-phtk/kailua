# Root Entity Question
Option A
Objective
Topic
WorkItem
Executable

(all separate entities)

Option B
Node
(type = objective | topic | work_item )
(parent-child tree)

Decision:

Use a generic `PlanningItem` table for Objective, Topic, and WorkItem.

Use a separate `Executable` table for executable candidate actions.

Reason:

Objective, Topic, and WorkItem share the same core shape: type, title, intent statement, description, status, and parent-child relationship. A generic PlanningItem table keeps the tree simple while still using a human-readable domain name instead of an abstract Node table.

Executables are separate because they represent candidate actions generated from planning items and may have execution-specific status, validation, and approval later.


# V0 Entity List

## PlanningItem

### Planning Item Types 
#### Objective

Top-level desired outcome. It captures what the user is trying to accomplish and why.

#### Topic

A human-facing cluster of related thought or work under an Objective. A Topic may start vague and become more bounded through elicitation. It may also carry a normalized area field.

#### WorkItem

A bounded unit of work under a Topic. A WorkItem should eventually become concrete enough to generate one or more Executables.


## Executable Item

A concrete candidate action generated from a WorkItem. An Executable is not automatically run; it waits for human approval.


## ElicitationAnswer

Purpose:

ElicitationAnswer is not part of the planning tree.

It is a first-class child record of a PlanningItem. It stores the question-and-answer trail used to clarify a fuzzy Objective, Topic, or WorkItem into a clean PlanningItem.

A PlanningItem stores the current cleaned understanding.

ElicitationAnswer stores the evidence trail that led to that understanding.

# V0 Entity Attributes

## PlanningItem

type = Objective | Topic | WorkItem  
parent_planning_item_id  
title  
intent_statement  
description  
area  
status  

## Executable

planning_item_id  
title  
execution_statement  
description  
status  
status_description  

## ElicitationAnswer

target_type = PlanningItem | Executable  
target_id  
question  
paraphrased_question  
raw_answer  
normalized_field  
cleaned_answer  
confidence  

# V0 Status Lifecycle

draft
ready
active
blocked
completed
abandoned

# Dependency and Priority Decision

`parent_planning_item_id` represents tree structure. It means a PlanningItem belongs under another PlanningItem.

Dependencies are separate from tree structure. A dependency means one PlanningItem should not proceed until another PlanningItem is completed or resolved. Dependencies should be modeled later as a separate relationship table.

Priority is also separate from dependency. Priority means which item should be considered or executed next given the current context. Stable display order may be stored on PlanningItem later as `sort_order`, but execution priority should eventually belong to an execution queue concept.

V0 will not implement dependency or priority yet. V0 will only preserve the distinction so the schema does not confuse parent-child structure, dependency, and priority.

## Template

A reusable elicitation script for a domain or workflow. A Template defines what kind of planning journey Kailua is guiding, such as software project planning, investment thesis building, deployment planning, or home improvement planning.

## TemplateQuestion

A question belonging to a Template. It defines the prompt, intended normalized field, ordering, and the PlanningItem type it helps clarify.

# V0 SQL Artifacts

## db/schema-v0.sql

Creates the core tables and hierarchy validation triggers.

## db/views-v0.sql

Creates read views for tree display, selected WorkItem context, elicitation history, and the first WorkItem context packet.

## db/seeds/software_project_v0.sql

Seeds the minimal software project elicitation template.

## db/seeds/sample_kailua_journey.sql

Seeds a small Kailua planning journey used to validate the PlanningItem tree and ElicitationAnswer discovery history.