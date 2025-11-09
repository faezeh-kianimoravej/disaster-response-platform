# ADR: Frontend Standards — Pages, Components, Hooks, API, Forms, Validation, and Types

Date: 2025-10-30

Status: Proposed / Reference

Purpose

This document captures frontend architecture and coding standards to keep the client codebase consistent, maintainable and testable. Use this as a checklist when creating or reviewing pages, components, hooks, API modules and form validation. It complements existing ADRs (e.g. notification workflow) and is intended to be referenced during code review and pull request checks.

Scope

- All code inside `client-app/src/**`
- Pages, page-level containers, presentational components, hooks, API modules, types, and validation logic
- Recommended developer workflow and PR checklist items

Principles (summary)

- Single responsibility: separate display, API, and form models.
- Centralized auth & routing: use `AuthGuard` for page access control and React Router for navigation.
- Small, reusable UI: prefer tiny components (LoadingPanel, SearchSelect, IncidentCard).
- Hooks for encapsulating data & logic; keep side-effects in hooks and pages only when needed.
- Typed boundaries: clearly name Display/API/Form types and provide adapters to convert between them.
- Validation: enforce at the hook level and allow graceful combination with backend validation errors.
- Visible UX: keep page chrome visible while loading and show inline loading placeholders.

Structure and Naming Conventions

- Pages
  - File path: `src/pages/NamePage.tsx`
  - Export default a thin wrapper that applies `AuthGuard` (if the page is protected) and renders a content component:
    - `export default function FooPage() { return <AuthGuard requireRoles={[...]}><FooPageContent /></AuthGuard> }`
    - Page content component implemented as `function FooPageContent() { ... }`
  - Hooks must be declared at the top of the content component (before early returns) to preserve hook ordering.
  - Keep UI and data orchestration in the page content component; keep the default export minimal.

- Components
  - File path: `src/components/Name.tsx` (or `components/forms/`, `components/views/` for grouped components)
  - Props typed using interfaces or types. Small components only accept props they actually need.
  - Prefer presentational components (pure functions) where possible; avoid embedding data fetching inside UI components.
  - Reusable components (e.g. `LoadingPanel`) should be self-contained and accept small configuration options (className, text, size).
  - No console.* statements in committed code.

- Hooks
  - File path: `src/hooks/useSomething.ts` (export default or named export `useSomething`)
  - Hook signature guidance for data hooks:
    - return shape: `{ data, loading, error, refetch, isFetching? }`
    - Accept an `options` param to control behaviour (e.g., `{ enabled?: boolean, staleTime?: number }`).
    - Avoid rendering side-effects inside hooks — return data and helper functions.
  - Use React Query or a tiny fetcher with consistent semantics. If using custom hooks, keep them consistent across the app.
  - Put validation logic at hook level for form hooks (see Validation section).

- API / Services
  - Single responsibility: API functions only call endpoints and normalize raw API response into API types.
  - API layer file example: `src/api/incidents.ts` export functions like `getIncidents(regionId)` that return raw API data (typed as API types).
  - Keep HTTP client configuration centralized (e.g., `src/api/client.ts` with axios instance including auth headers and interceptors).
  - Convert API types into display or form types in adapters (not in the component).

Types: Display / API / Form

Naming conventions and purpose:
- IncidentAPI / IncidentResponse: the shape returned by the backend.
- IncidentForm: the form model used by forms for creating/updating incidents.
- IncidentDisplay: the model used by UI components (derived from API via an adapter — e.g., `mapIncidentApiToDisplay`).

Why this separation?
- Keep API changes isolated from forms and UI.
- Avoid leaking API-specific fields (timestamps, internal IDs) into UI components.
- Form models may have flattened or combined fields better suited for form libraries.

Adapters

- Always create small adapter functions adjacent to the API module:
  - `function incidentApiToDisplay(api: IncidentAPI): IncidentDisplay { ... }`
  - `function incidentFormToApi(form: IncidentForm): IncidentAPIRequest { ... }`

Forms & Validation

- Use a form library (recommended: react-hook-form) for component-level form wiring.
- Put validation rules in the hook that provides form wiring. For example, a `useUserForm` hook returns default values and validation schema/rules.
  - Example responsibilities of `useUserForm`:
    - Provide `defaultValues` shaped as `UserForm`.
    - Provide `validationResolver` or `register` rules consumed by `react-hook-form`.
    - Provide `submit` helper that calls API and maps backend validation errors to `setError`.
- Combine frontend validation with backend validation:
  - On submit call the API; on 4xx validation errors map server errors to field-level errors and pass them into the form's `setError`.
  - Hook-level API: return `handleSubmit`/`onSubmit` that callers can pass to forms; keep HTTP error mapping in the hook.

Example pattern (pseudo):

- Hook `useCreateUser`:
  - returns: { submit: async (formData) => { try { await api.createUser(adapter(formData)); } catch (e) { if (e.validation) throw mappedErrors; else throw e } } }

- Hook `useUserForm`
  - returns: { defaultValues, validationResolver, onSubmit: async (values, setError) => { try { await createUser.submit(values) } catch (err) { Object.entries(err).forEach(([field,msg]) => setError(field, { message: msg })) } } }

Pages must not duplicate validation logic — read the hook and pass hook helpers to the form component.

Loading and UX Patterns

- Keep page chrome visible while data loads (header, filters, region controls). Only the content area should show a loading placeholder.
- Use a small, reusable `LoadingPanel` component (text + animated dots) or a skeleton UI for richer lists.
- Avoid full-page early returns unless the whole page needs to be blocked.

Auth and Routing

- Use `AuthGuard` for all protected pages. The page's default export should be a wrapper that composes `AuthGuard` and the page content.
- Avoid duplicating auth checks inside pages/components -- rely on `AuthGuard` for guard semantics.
- Use `useNavigate` from React Router only inside components or hooks where navigation is meaningful (page content or action handlers).

Error Handling

- Display user-friendly error messages returned from API, and show generic fallback messages when unknown errors occur.
- Map API errors to fields in forms using consistent mapping in hooks.
- For data hooks, return `error` so pages can render an error block; do not swallow errors silently.

Toast notifications and contextual UI errors

- Use the app-wide toast system for transient notifications and confirmations:
  - Success messages (e.g., "Resource saved")
  - Confirmations (e.g., "Item deleted")
  - High-level or global errors that need user attention (e.g., auth failure, network down)

- In addition to toasts, the UI area where the error occurred must show an inline, contextual message and an optional retry action. This mirrors the pattern implemented on the Dashboard page and improves discoverability and recoverability:
  - For list failures: show a concise message inside the list area (centered for block-level errors) such as "Unable to load incidents." and offer a retry control.
  - For small controls or selectors (e.g., region selector) prefer a compact inline retry control placed adjacent to the control.

- Implementation notes / conventions:
  - Use the shared `ErrorRetry` component (or `ErrorRetryInline` / `ErrorRetryBlock`) when available to keep copy and styles consistent.
  - The page should call `showError(...)` (toast) when an error occurs and also render the inline error UI so users who miss toasts or return to the page can see the error in context.
  - Inline retry controls SHOULD be implemented as native `<button>` elements (keyboard-focusable) and include an `aria-label` describing the action. For visual affordance add a pointer cursor (e.g., Tailwind `cursor-pointer`) and a visible focus style (prefer `focus:ring-*` over removing outlines).
  - Block-level retries (lists, detail panels) should include a clearly labeled retry button and may include auxiliary actions (e.g., "Contact support").
  - Keep toasts short and user-focused; map server error codes to friendly strings rather than echoing raw server messages.

- Pattern: always show both a toast (so users who miss the inline message still see the error) and a concise inline message with a retry action when appropriate.

Retry pattern (contract)

- When a data fetch fails for a page or a control, follow this explicit small contract so implementations remain consistent across the app:
  1. In the page's component, detect the hook `error` (from `useFoos`, `useIncidents`, `useRegion`, etc.) and call the toast helper once via `useEffect`, e.g. `useEffect(() => { if (error) showError('Unable to load items.'); }, [error, showError]);`.
  2. Render a contextual inline error UI in the same area where the data would appear. Use `ErrorRetryBlock` for block-level content (lists/details) and `ErrorRetryInline` for small controls (selectors, small widgets).
  3. The inline retry control MUST call the hook's `refetch()` or a returned `refetch` wrapper. Use the same `refetch` naming as React Query so reviewers and tests can mock it consistently.
  4. Inline retry controls MUST be keyboard-accessible native `<button>`s, include an `aria-label`, and offer a visible focus indicator (prefer `focus:ring-*` over `focus:outline-none`). For visual affordance add `cursor-pointer`.

Example (contract-compliant):

```tsx
const { data, loading, error, refetch } = useFoos(regionId);
const { showError } = useToast();

useEffect(() => {
  if (error) showError('Unable to load items.');
}, [error, showError]);

return (
  <section aria-busy={loading} aria-live="polite">
    {loading && <LoadingPanel text="Loading items..." />}

    {error && !loading && (
      <ErrorRetryBlock message="Unable to load items." onRetry={() => refetch()} />
    )}

    {!loading && !error && data && <FooList items={data} />}
  </section>
)
```

Accessibility

- Use semantic markup for interactive elements: buttons, links, headings.
- Ensure form inputs have labels, errors are announced (aria-live regions) and keyboard navigation is preserved.
- Loading placeholders should not trap focus; use `aria-busy`/`aria-live` as appropriate.

Testing

- Unit tests (React Testing Library / Jest) for: components, hooks (mock fetch), and adapters.
- Integration tests for key flows (create user, edit incident) where feasible.
- Add basic tests for: hook signatures, API mapping (adapters), and a smoke test for pages to ensure they render with mocked hooks.

Linting, Formatting and CI

- Enforce ESLint + Prettier. Recommended rules:
  - `no-console: error` (no console.* in committed code)
  - `react-hooks/rules-of-hooks`
  - `@typescript-eslint/no-explicit-any` (warn/strict)
- Add CI checks: lint, typecheck, unit tests. Block merging on failures.

PR Review Checklist (copy into PR template)

- [ ] Page files follow page structure (AuthGuard wrapper + content component)
- [ ] No direct auth checks inside the page (AuthGuard handles authorization)
- [ ] Hooks are declared at top of the component and follow the `{ data, loading, error, refetch }` convention
- [ ] API calls are in `src/api`, adapters live in `src/lib/adapters` (or alongside API file)
- [ ] Types: Display / API / Form are named and used consistently; adapters present
- [ ] Forms: using a form hook (e.g., `useXForm`) and hook handles validation and submits
- [ ] Loading UI uses `LoadingPanel` or a skeleton variant (no console logs)
- [ ] Errors and confirmations use the toast system for transient notifications; failing UI areas show a concise inline message and an action (e.g., "Unable to load data" + Retry)
- [ ] Components are small, typed and reused where applicable
- [ ] Tests added (unit for components/hooks, at least smoke for the page)
- [ ] Lint and typecheck pass locally and in CI

Enforcement and Onboarding

- Add this ADR to the PR checklist and reference it in code reviews.
- When a new developer joins, ask them to read the ADR and run a short checklist during their first PR.
- If a migration is required (e.g., convert old loading blocks), create a small tech-debt task with concrete replacements and tests.

Examples (concise)

- Page skeleton (recommended)

```tsx
export default function FooPage() {
  return (
    <AuthGuard requireRoles={["Role A"]}>
      <FooPageContent />
    </AuthGuard>
  );
}

function FooPageContent() {
  // Hooks first (do not early-return before hooks are declared)
  const { data, loading, error } = useFooData();

  const { filters, setFilters } = useFooFilters(data);

  return (
    <div>
      <h1>Foo</h1>
      <Filters ... />

      {loading && <LoadingPanel text="Loading foos..." />}

      {!loading && data && <FooList items={data} />}
    </div>
  );
}
```

- Hook signature (recommended)

```ts
// src/hooks/useFoos.ts
export function useFoos(regionId: number, options?: { enabled?: boolean }) {
  // returns a stable shape for callers
  return { data, loading, error, refetch };
}
```

- Types adapters (recommended)

```ts
// src/lib/adapters/incident.ts
export function apiToDisplay(api: IncidentAPI): IncidentDisplay { ... }
export function formToApi(form: IncidentForm): IncidentApiRequest { ... }
```

Migration notes / Tech-debt

- If many pages use early-return full-page loaders, migrate them to inline `LoadingPanel` progressively.

Appendix: Quick Review Checklist (single page copy)

- Page wrapper: AuthGuard? Yes/No
- Hooks declared before returns? Yes/No
- Loading UI: LoadingPanel or skeleton? Yes/No
- Form uses hook-level validation and maps server errors? Yes/No
- Types: API/Form/Display separation and adapters? Yes/No
- No console.* left in file? Yes/No
- Tests for new behavior? Yes/No
- Lint & types pass? Yes/No
