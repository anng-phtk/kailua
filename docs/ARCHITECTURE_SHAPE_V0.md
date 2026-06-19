# Kailua Architecture Shape V0

## Product Shape
Kailua is a local-first planning and execution workbench.

It helps a human turn vague goals into a durable planning tree, stores the discovery trail that shaped each planning item, uses AI to assist elicitation and executable generation, and requires human approval before any execution occurs.

Kailua is not only an Electron app. The UI may be Electron, browser-based, or both. The durable center of Kailua is the API server, core engine, database, model gateway, and execution boundary.

## Monorepo Shape

## UI Layer

## API Server Layer

## Core Engine Layer

## Persistence Layer
V0 does not use an ORM.

Kailua uses explicit SQL files, SQLite views, and a thin TypeScript store layer. The store exposes named methods such as `getWorkItemContextPacket(workItemId)` and hides the SQLite library from the rest of the application.

This keeps the data model inspectable and supports the Island Test. An ORM should only be considered later if repeated SQL or migration pain appears at least three times.

## Model Gateway Layer

## Integration Layer

## Execution Boundary Layer

## V0 Boundary

## Deferred Until Later