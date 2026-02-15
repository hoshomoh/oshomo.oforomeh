# Project Guidelines

## UI Components

- **Do NOT directly modify files in `components/ui/`** - These are shadcn/ui components that can be overwritten by updates. If you need custom behavior, compose the underlying primitives in your own component instead of modifying the shared UI components.

## React Imports

- **Always use namespace import**: `import * as React from 'react'` — never use `import React from 'react'` or destructured named imports like `import { useState } from 'react'`
- **Access everything via `React.`**: Use `React.useState`, `React.useMemo`, `React.useEffect`, `React.ReactNode`, etc.
- This ensures consistent imports across the codebase and avoids mixing default and named imports

## Component Architecture

- **Keep components clean and focused on rendering** - Components should primarily handle layout and JSX. Extract stateful logic, effects, memos, and data transformations into custom hooks or utility functions.
  - **Custom hooks**: Extract `useEffect`, `useMemo`, `useState`, and related logic into `hooks/` (e.g., `useSettings`, `useFilters`, `useDashboardStats`)
  - **Utility functions**: Extract pure data transformations, formatting, and computation into `lib/` (e.g., `lib/format.ts`, `lib/constants.ts`)
  - **10-line rule**: If a component or page has more than ~10 lines of non-JSX logic (hooks, memos, effects, handlers, computed values), extract that logic into a dedicated custom hook
  - **Goal**: A component file should read like a template — props in, JSX out, with hooks and utils doing the heavy lifting

## State Management

- **Use `useReducer` when `useState` count exceeds 2** - When a component needs more than 2 pieces of related state, consolidate them into a `useReducer` with typed actions. This keeps state transitions predictable and co-located.

## Date Handling

- **Always use `date-fns` for all date manipulations** — never use raw `Date` constructor, `.getFullYear()`, `.getMonth()`, `.getTime()`, `.toISOString()`, `.toLocaleDateString()`, or similar native Date methods
- Use `date-fns` functions instead: `format`, `parseISO`, `getTime`, `getYear`, `getMonth`, `startOfMonth`, `compareDesc`, `compareAsc`, etc.
- For common patterns, use helpers from `lib/date.ts` (e.g., `toISODate`, `toMonthKey`, `compareDatesDesc`)
- Exception: `new Date()` (no arguments) is acceptable for getting "now" — but prefer wrapping it in date-fns operations immediately

## React Patterns

- **Minimize `useEffect` usage** - Only use `useEffect` for true side effects (event listeners, DOM mutations, async data fetching on mount, persisting to storage). Prefer these alternatives:
  - **Derived state**: Use `useMemo` instead of `useEffect` + `useState` for values computed from props/state
  - **Event handlers**: Move logic triggered by user actions (e.g., form field changes) into the handler instead of syncing with `useEffect`
  - **Initial state from props**: Use `useState(() => computeFromProps())` lazy initializer or the `key` prop to reset component state, instead of syncing props to state with `useEffect`
  - **URL param initialization**: Pass initial overrides to hooks (e.g., `useFilters(data, accounts, initialOverrides)`) instead of reading URL params in a `useEffect` after mount
