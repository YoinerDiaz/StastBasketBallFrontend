---
name: ui-design
description: Design and improve the Basket Stats user interface with a professional sports-statistics visual style. Use when creating, modifying, reviewing, or redesigning pages, components, cards, buttons, tables, dashboards, forms, navigation, modals, or other visual frontend elements.
---

# UI Design — Basket Stats

You are responsible for maintaining a professional, modern, coherent visual interface for the Basket Stats application.

Basket Stats is a university basketball statistics management system. The interface should communicate sports, statistics, competition, performance, reliability, and professionalism.

## Core principles

Always prioritize:

1. Visual hierarchy
2. Clarity
3. Consistency
4. Readability
5. Professional appearance
6. Ease of use
7. Responsive behavior
8. Accessibility
9. Reusable components
10. Consistency with the existing application

Do not redesign an entire application when the task only requires a local change.

Before creating a new visual component:

- Inspect existing components.
- Reuse existing styles when possible.
- Reuse existing components when possible.
- Check whether the same UI pattern already exists elsewhere.
- Avoid creating duplicate components with slightly different styles.

## Basket Stats visual identity

Use the project's existing color palette:

- Primary dark: #01050D
- Primary orange: #F26513
- Secondary orange/red: #D93D04
- Dark red: #731702
- Light: #F2F2F2

Do not introduce random colors without a clear reason.

Colors should have semantic purposes.

Examples:

- Primary dark → backgrounds, navigation, strong contrast areas
- Primary orange → primary actions, highlights, active states
- Secondary orange/red → warnings or secondary emphasis when appropriate
- Dark red → destructive or critical states
- Light → text, surfaces, backgrounds, depending on contrast

Do not use the entire palette in every component.

## Typography

Prioritize:

- readable font sizes
- clear headings
- consistent hierarchy
- adequate line height
- sufficient contrast

Avoid excessive font sizes, excessive uppercase text, and visually noisy typography.

## Components

Prefer reusable components for:

- buttons
- cards
- tables
- badges
- inputs
- selects
- modals
- alerts
- navigation
- tabs
- statistics cards
- loading states
- empty states
- error states

A component should have a clear responsibility.

## Buttons

Buttons must communicate their purpose clearly.

Use consistent visual hierarchy:

- Primary action
- Secondary action
- Neutral action
- Destructive action

Destructive actions such as delete, remove, cancel, or permanently change data must be visually distinguishable.

Do not create multiple button styles for the same semantic action.

## Tables and statistics

Basketball statistics contain numerical information.

Tables must prioritize:

- alignment
- readability
- spacing
- column hierarchy
- mobile behavior
- visual distinction between headers and values

Important statistics may use visual emphasis, but do not overuse colors.

## Forms

Forms must:

- clearly identify fields
- show required fields
- provide useful labels
- show validation errors near the relevant field
- preserve entered information when possible
- avoid unnecessary fields

Do not rely only on placeholder text as a field label.

## States

Every important interactive component should consider:

- normal
- hover
- focus
- active
- disabled
- loading
- success
- error
- empty

Do not leave the user without feedback after an action.

## Visual consistency

Before adding a new component, inspect existing UI patterns.

If an existing component already solves the same problem, reuse or extend it instead of creating another visual variant.

## Restrictions

Do not:

- introduce a new UI framework without authorization
- replace the existing design system without authorization
- perform broad visual redesigns without authorization
- modify backend code
- change API contracts
- change business rules

When a design improvement requires a structural or architectural change, explain it first and request authorization.

## Workflow

For significant UI changes:

1. Inspect the existing implementation.
2. Identify inconsistencies.
3. Explain the current problem.
4. Propose the visual solution.
5. Ask for authorization.
6. Implement only the approved scope.
7. Verify the affected states and responsive behavior.