---
name: responsive-design
description: Make Basket Stats interfaces responsive across desktop, tablet, and mobile devices. Use when creating, reviewing, fixing, or redesigning layouts, dashboards, tables, forms, navigation, cards, modals, game boards, or statistics views for different screen sizes.
---

# Responsive Design — Basket Stats

All Basket Stats interfaces must work correctly on:

- Desktop
- Laptop
- Tablet
- Mobile

## Core principle

Responsive design is not simply making elements smaller.

The interface must adapt its:

- layout
- spacing
- typography
- navigation
- tables
- controls
- cards
- forms
- content hierarchy

according to available screen space.

## Before changing responsive behavior

Inspect:

- existing CSS
- layout system
- breakpoints
- reusable components
- current responsive patterns

Reuse existing conventions.

Do not introduce unnecessary breakpoint systems.

## Mobile-first considerations

On small screens:

- avoid horizontal overflow
- avoid tiny text
- avoid controls touching each other
- avoid fixed-width containers when unnecessary
- prioritize important information
- stack elements when appropriate

## Tables

Statistics tables require special attention.

Possible solutions include:

- horizontal scrolling
- responsive column prioritization
- stacked mobile rows
- separate mobile representations

Do not simply shrink every column until the table becomes unreadable.

## Navigation

Navigation must remain usable on small screens.

If the current application already has a responsive navigation pattern, reuse it.

Do not introduce a new navigation architecture without authorization.

## Forms

On mobile:

- inputs should use available width
- labels must remain readable
- buttons must be easy to tap
- fields should not overflow the viewport

## Game interface

The game board is a high-priority responsive area.

Verify:

- scoreboard
- game clock
- team information
- player controls
- event buttons
- statistics
- action buttons

on smaller screens.

Important actions must remain accessible.

## Modals

Dialogs must:

- fit within the viewport
- remain scrollable when necessary
- not hide important actions
- remain usable on mobile

## Images

Images should not overflow containers.

Use responsive dimensions while preserving aspect ratio.

## Verification

After a responsive change verify at least:

- approximately 320px width
- approximately 375px width
- approximately 768px width
- desktop width

Do not assume that a single breakpoint test is enough.

## Restrictions

Do not:

- rewrite the entire CSS architecture without authorization
- introduce a new CSS framework without authorization
- remove existing responsive behavior without analysis
- hide important functionality on mobile without a UX reason

## Workflow

1. Inspect the existing layout.
2. Identify the responsive problem.
3. Determine the appropriate adaptation.
4. Reuse existing styles/components.
5. Implement only the required change.
6. Verify desktop, tablet, and mobile.