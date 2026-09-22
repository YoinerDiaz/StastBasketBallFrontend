---
name: accessibility
description: Review and improve accessibility in Basket Stats frontend interfaces. Use when creating or modifying forms, buttons, navigation, dialogs, tables, game controls, interactive components, colors, keyboard interactions, focus states, or user feedback.
---

# Accessibility — Basket Stats

Basket Stats must be usable by as many users as reasonably possible.

Prioritize practical accessibility improvements without unnecessarily changing the architecture.

## Semantic HTML

Prefer semantic elements:

- button
- nav
- main
- section
- header
- footer
- form
- label
- table

Do not use div elements as interactive controls when a semantic element exists.

## Buttons

Interactive actions must use buttons or appropriate links.

Buttons must communicate their purpose.

Avoid ambiguous labels such as:

- Click
- Here
- More

Prefer meaningful labels:

- Crear partido
- Eliminar jugador
- Iniciar partido
- Guardar estadísticas

## Forms

Every input should have an accessible label.

Do not rely only on placeholders.

Validation errors must be associated with the relevant field.

## Keyboard navigation

Interactive elements should be reachable using the keyboard.

Avoid removing visible focus indicators without providing an alternative.

## Focus

Important interactive elements must have visible focus states.

## Color

Do not communicate information only through color.

For example:

Bad:

"Orange means selected."

Better:

- visual color change
- selected indicator
- text/state
- accessible semantics

## Contrast

Verify sufficient contrast between:

- text and background
- buttons and background
- disabled states
- navigation
- statistics

The existing Basket Stats palette must be used carefully to maintain readability.

## Tables

Tables should have:

- meaningful headers
- logical structure
- readable labels

## Modals

Dialogs must:

- have a clear title
- provide accessible controls
- allow closing appropriately
- maintain logical focus behavior

## Feedback

Success and error feedback should not depend exclusively on color.

Use text or other visual indicators.

## Restrictions

Do not:

- remove accessibility attributes without justification
- remove focus indicators
- replace semantic elements with divs unnecessarily
- sacrifice readability for visual aesthetics

## Workflow

1. Inspect the component.
2. Identify accessibility issues.
3. Explain their impact.
4. Propose improvements.
5. Ask authorization for significant structural changes.
6. Implement approved changes.
7. Verify keyboard, focus, labels, contrast, and feedback.