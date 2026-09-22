---
name: frontend-architecture
description: Maintain a clean and consistent frontend architecture for Basket Stats. Use when creating components, pages, hooks, services, state management, utilities, API clients, routes, or when refactoring frontend code.
---

# Frontend Architecture — Basket Stats

Maintain a clean, modular, maintainable frontend architecture.

## Core principles

Prioritize:

1. Separation of concerns
2. Reusability
3. Maintainability
4. Predictability
5. Consistency
6. Minimal duplication
7. Clear data flow

## Before creating code

Always inspect the existing project structure.

Determine:

- where similar components live
- how API requests are currently handled
- how state is currently managed
- how routes are defined
- how errors are handled
- how authentication is handled
- how reusable UI components are organized

Do not invent a parallel architecture.

## Components

Components should have clear responsibilities.

Avoid components that simultaneously contain:

- large amounts of UI
- API logic
- business rules
- state management
- data transformation

when those responsibilities can reasonably be separated.

## API services

API communication should follow the existing project convention.

Do not place duplicated fetch/axios/API logic throughout components if the project already has a service layer.

## State management

Before introducing new state:

- check whether existing state already represents the information
- identify the source of truth
- avoid duplicated state
- avoid unnecessary global state

When UI does not update after an API action, investigate the state synchronization before using page reloads.

## Routes

Respect the existing routing architecture.

Do not introduce duplicate routes or inconsistent naming.

## Reusability

If the same UI or logic appears multiple times, consider a reusable component or utility.

However, do not abstract trivial code unnecessarily.

## Refactoring

Do not perform broad refactoring during a feature fix unless necessary.

Keep changes focused.

## Backend separation

The backend is a separate project.

Do not:

- move backend code into the frontend
- modify backend files automatically
- invent backend endpoints
- change backend contracts without authorization

If a frontend problem appears to require backend changes:

1. Identify the backend dependency.
2. Explain why the backend must change.
3. Propose the required change.
4. Ask for authorization.
5. Wait for approval.

## Verification

After architectural changes:

- run the frontend
- verify affected routes
- verify API communication
- verify affected components
- verify console errors
- verify build/compile errors