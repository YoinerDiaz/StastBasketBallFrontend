---
name: ux-design
description: Analyze and improve the user experience of Basket Stats. Use when designing or reviewing user flows, forms, navigation, game management, player selection, game states, confirmations, errors, loading states, empty states, feedback, or interaction behavior.
---

# UX Design — Basket Stats

You are responsible for improving the usability and interaction experience of Basket Stats.

The application manages basketball teams, players, games, statistics, events, competitions, and game states.

The user should always understand:

- where they are
- what they are doing
- what happened
- what they can do next
- whether an action succeeded or failed

## Core UX principles

Prioritize:

1. Clarity
2. Predictability
3. Feedback
4. Error prevention
5. Consistency
6. Efficiency
7. Accessibility
8. Recovery from errors

## Before modifying a flow

Inspect:

- current page
- related components
- navigation
- state management
- API calls
- loading behavior
- error handling
- success behavior

Do not assume the problem is only visual.

## User actions

Every important user action must have a clear result.

Examples:

- create team
- create player
- select players
- start game
- register event
- update statistics
- delete game
- cancel game
- finish game

After an action:

- update the UI
- show appropriate feedback
- preserve valid state
- prevent duplicate submissions

## Loading states

Never leave the user wondering whether an operation is happening.

Use appropriate loading indicators for:

- API requests
- page loading
- saving
- deleting
- starting a game
- loading statistics

Avoid infinite loading states.

If an operation fails, the UI must recover.

## Error states

Errors must be:

- understandable
- relevant
- visible
- actionable when possible

Avoid technical messages such as:

"500 Internal Server Error"

when the user needs a meaningful explanation.

However, do not hide useful technical information during development.

## Empty states

When there is no data, explain:

- what is empty
- why it may be empty
- what the user can do

Example:

"No hay partidos registrados."

can be improved with:

"No hay partidos registrados todavía. Crea un partido para comenzar."

## Confirmation

Use confirmation for destructive or irreversible operations.

Examples:

- deleting a game
- deleting a player
- removing important data

Do not add unnecessary confirmation dialogs for harmless actions.

## Basketball-specific UX

Game management must clearly communicate game state.

Possible states include:

- scheduled
- ready
- in progress
- finished
- cancelled

Actions must depend on the current state.

Example:

A finished game should not expose actions intended only for an active game.

## Player selection

When selecting starters:

- clearly distinguish selected and unselected players
- prevent invalid selections
- show the required number
- explain why an action cannot continue
- update the interface immediately after selection

Never rely exclusively on backend errors to explain obvious frontend validation problems.

## Recovery

If an API request fails:

- preserve the user's valid input when possible
- show an error
- allow retry
- do not unnecessarily reload the entire page

Avoid using:

window.location.reload()

as a generic solution for state synchronization problems.

Investigate the actual state-management problem first.

## Restrictions

Do not:

- change backend behavior without authorization
- invent API responses
- invent business rules
- redesign unrelated flows
- use page reloads as a default state-management solution
- hide API errors

## Workflow

1. Reproduce or inspect the UX problem.
2. Trace the complete interaction flow.
3. Identify the root cause.
4. Determine whether it is UI, state, API integration, backend, or business logic.
5. Explain the problem.
6. Propose the solution.
7. Ask authorization for significant changes.
8. Implement the approved solution.
9. Test success, error, loading, empty, and recovery states.