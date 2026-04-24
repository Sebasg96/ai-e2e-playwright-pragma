# PRAGMA E2E Complete Test Plan

## Objective

Provide end-to-end confidence for the PRAGMA platform across critical business flows, role-based access, and cross-browser behavior using the existing Playwright + TypeScript + POM framework.

## Scope

- In scope: Auth, Dashboard navigation, Strategy (OKRs, Key Results, check-ins, cascades), Settings (user and tenant management), role permissions, and accessibility checks.
- In scope browsers/devices: `chromium`, `firefox`, `webkit`, and `mobile-chrome` as defined in `playwright.config.ts`.
- Out of scope: backend unit/integration tests, API contract tests, performance/load testing.

## Test Environments

- Local: `BASE_URL=http://localhost:3000`
- Staging: production-like URL from CI secrets
- Seeded tenant: `pragma-e2e-test` with 3 personas (admin/member/viewer)

## Test Data and Personas

- **Admin**: `testuser@pragma-e2e.com` (full permissions)
- **Member**: `member@pragma-e2e.com` (contributor/check-in permissions)
- **Viewer**: `viewer@pragma-e2e.com` (read-only)

### Data strategy

- Keep core smoke/sanity tests idempotent (create isolated records with timestamp suffixes).
- Run `npm run clean:testdata` after regression runs to remove generated entities.
- Avoid state coupling between scenarios; each test prepares its own prerequisite objects or validates pre-seeded fixtures.

## Tiering and Execution Cadence

| Tier | Tag | Directory | Goal | Trigger |
|---|---|---|---|---|
| Smoke | `@smoke` | `tests/smoke` | Critical user journey health | Every commit |
| Sanity | `@sanity` | `tests/sanity` | Core feature confidence | Every PR |
| Regression | `@regression` | `tests/regression` | Full feature/edge coverage | Merge + nightly |
| Accessibility | `@a11y` | `tests/a11y` | WCAG and keyboard baseline | PR + nightly |

## Entry and Exit Criteria

### Entry criteria

- PRAGMA environment is reachable (`BASE_URL` responds).
- Valid credentials exist in `.env` or CI secrets.
- `tests/auth.setup.ts` succeeds and writes `playwright/.auth/user.json`.

### Exit criteria

- Smoke: 100% pass.
- Sanity: no critical failures; acceptable flaky rate is zero.
- Regression: no Sev-1 or Sev-2 issues open.
- A11y: all high-impact issues triaged; blockers fixed before release.

## Core Scenario Catalog

Each scenario includes a suggested tier and should be saved as separate, independent tests.

### 1) Authentication and Session Management

1. **Login form renders with required fields** (`@smoke`)
   - Start state: anonymous user at `/login`
   - Steps: open login page, validate email/password/submit controls
   - Expected: visible and interactable form
   - Known test IDs: `auth-login-email-input`, `auth-login-password-input`, `auth-login-submit-button`

2. **Valid login redirects to authenticated area** (`@smoke`)
   - Start state: anonymous user
   - Steps: submit valid admin credentials
   - Expected: URL matches `/dashboard|/home|/strategy|/`

3. **Invalid login shows authentication error** (`@smoke`)
   - Steps: submit invalid credential pair
   - Expected: error text shown (`Invalid credentials or login failed.`)

4. **Logout invalidates session and redirects to login** (`@sanity`)
   - Steps: login, trigger logout from both Hub and module layout path
   - Expected: redirected to `/login`; protected route access denied
   - Known test IDs: `user-menu-btn`, `logout-btn`

5. **Session persistence across page reload** (`@sanity`)
   - Steps: login, refresh page
   - Expected: user remains authenticated and dashboard remains loaded

6. **Expired/invalid storage state forces re-authentication** (`@regression`)
   - Steps: corrupt auth state, navigate to protected page
   - Expected: redirected to login, no blank/loop state

### 2) Dashboard and Global Navigation

7. **Dashboard loads with navigation container** (`@sanity`)
   - Expected: Hub links or sidebar/toggle are present
   - Known test IDs: `sidebar-nav`

8. **Navigate Dashboard -> Strategy** (`@sanity`)
   - Steps: click strategy nav entry (Hub link or sidebar)
   - Expected: URL contains `/strategy`
   - Known test IDs: `nav-strategy`

9. **Collapsed/expanded menu does not break navigation** (`@regression`)
   - Steps: collapse menu, navigate modules, expand menu
   - Expected: links still reachable and active-state accurate

10. **Direct URL navigation to known module while authenticated** (`@regression`)
   - Steps: open `/strategy` directly
   - Expected: route resolves without client-side crash

11. **Protected route redirect when anonymous** (`@smoke`)
   - Steps: anonymous user requests `/dashboard` and `/strategy`
   - Expected: redirected to `/login`

### 3) Strategy Management (Admin)

12. **Create new OKR with valid required fields** (`@sanity`)
   - Start state: admin authenticated at strategy module
   - Steps: open creation form, fill required fields, submit
   - Expected: OKR appears in list/board with correct title/owner

13. **Validation prevents empty OKR submission** (`@regression`)
   - Steps: submit form without required fields
   - Expected: inline validation messages; no object created

14. **Edit existing OKR metadata** (`@regression`)
   - Steps: update title, period, owner
   - Expected: persisted values after reload

15. **Archive/delete OKR with confirmation** (`@regression`)
   - Steps: trigger delete/archive, accept confirmation
   - Expected: entity removed/archived, no stale references

16. **Create Key Result under OKR** (`@sanity`)
   - Steps: open KR creator, add measurable target, save
   - Expected: KR linked to parent OKR and visible in detail

17. **KR target validation boundaries** (`@regression`)
   - Steps: invalid negative/zero/overflow values
   - Expected: validation shown; invalid values blocked

18. **Cascading relationships are displayed correctly** (`@regression`)
   - Steps: create/link child objective to parent objective
   - Expected: hierarchy view shows parent-child relationship correctly

19. **Initiative linkage to KR updates progress context** (`@regression`)
   - Expected: linked initiative appears in KR details and aggregate calculations update

20. **Search/filter/sort in strategy list persists during session** (`@regression`)
   - Steps: apply filters and sort, navigate away/back
   - Expected: expected rows and stable ordering

### 4) Strategy Execution (Member and Viewer)

21. **Member can submit KR check-in** (`@sanity`)
   - Start state: member assigned to KR
   - Steps: open KR, submit progress update and note
   - Expected: latest check-in timestamp/value/comment visible

22. **Member check-in enforces allowed value range** (`@regression`)
   - Expected: out-of-range values blocked with clear messaging

23. **Viewer cannot edit strategy entities** (`@sanity`)
   - Steps: login as viewer, open strategy detail
   - Expected: create/edit/delete controls absent or disabled

24. **Unauthorized mutation attempts are safely handled** (`@regression`)
   - Steps: force navigation to edit/create URLs as viewer
   - Expected: redirect or permission error page; no mutation

25. **Concurrent updates show latest saved state** (`@regression`)
   - Steps: two sessions update same KR sequentially
   - Expected: final state consistent with backend rules (last-write or merge policy)

### 5) Settings and Tenant Administration

26. **Admin can open settings and manage users** (`@sanity`)
   - Steps: navigate to settings, open users section
   - Expected: user list loads with pagination/search

27. **Invite/create user with valid role** (`@regression`)
   - Expected: new user appears with assigned role and status

28. **Duplicate email invite is rejected gracefully** (`@regression`)
   - Expected: conflict message shown; no duplicate entry

29. **Role update changes permissions immediately (or after refresh per product rule)** (`@regression`)
   - Expected: updated access boundaries validated via relogin

30. **Member/viewer access to admin settings is blocked** (`@sanity`)
   - Expected: hidden entry points or explicit unauthorized response

### 6) Resilience and UX Regression

31. **Network/intermittent backend failure on save** (`@regression`)
   - Steps: simulate failed save for strategy update
   - Expected: non-destructive error feedback and retry path

32. **Loading/empty states render correctly** (`@regression`)
   - Expected: skeleton or empty-state text appears without layout breakage

33. **Client-side error handling route does not white-screen** (`@regression`)
   - Expected: fallback UI appears with recoverable navigation

34. **Mobile viewport basic strategy navigation works** (`@regression`)
   - Project: `mobile-chrome`
   - Expected: nav drawer, key screens, and primary actions remain usable

### 7) Accessibility Baseline

35. **Login form keyboard-only flow** (`@a11y`)
   - Steps: tab sequence, submit via Enter
   - Expected: visible focus order and successful submission path

36. **Dashboard navigation landmarks and names are exposed** (`@a11y`)
   - Expected: semantic roles for nav and actionable controls

37. **Strategy create/edit forms have associated labels and error semantics** (`@a11y`)
   - Expected: inputs are labelled; errors announced/associated

38. **Color contrast and focus visibility for critical controls** (`@a11y`)
   - Expected: controls remain distinguishable in active/focused states

## Locator and POM Mapping (Known Today)

- **Auth**: `auth-login-email-input`, `auth-login-password-input`, `auth-login-submit-button` (`LoginPage`)
- **Dashboard**: `user-menu-btn`, `logout-btn`, `sidebar-nav`, `nav-strategy` (`DashboardPage`)
- **Fallback roles/text**: `button[name="Toggle Menu"]`, `button[name="Logout"]`, links `Gestionar Estrategia` and `Dashboard`

## Risk-Based Prioritization

Highest business risk (prioritize first):

1. Authentication breakage (blocked user access)
2. Strategy create/check-in flows (core product value)
3. Role/permission leakage (security/compliance risk)
4. Navigation/routing regressions (high support burden)

## Recommended File Backlog

- `tests/smoke/auth-critical.spec.ts`
- `tests/smoke/protected-routes.spec.ts`
- `tests/sanity/strategy-core.spec.ts`
- `tests/sanity/role-access.spec.ts`
- `tests/regression/strategy-crud.spec.ts`
- `tests/regression/strategy-checkins.spec.ts`
- `tests/regression/settings-users.spec.ts`
- `tests/regression/resilience.spec.ts`
- `tests/a11y/auth.a11y.spec.ts`
- `tests/a11y/strategy.a11y.spec.ts`

## Generator-Ready Scenario Template

Use this template for each scenario when handing off to `playwright-test-generator`:

1. **Title + tag**: `should <action> when <condition> @<tier>`
2. **Module**: `Auth | Dashboard | Strategy | Settings`
3. **Start state**: role, URL, prerequisite objects
4. **Steps**: explicit interaction sequence (no ambiguity)
5. **Expected outcomes**: URL/UI/permission/data assertions
6. **Locators**: `data-testid` first; role/label/text fallback only
7. **Cleanup**: delete/archive generated entities when relevant

## Traceability Matrix

- Requirements to verify in every release:
  - User can authenticate and recover from auth failures
  - Authenticated user can navigate to core modules
  - Admin can manage strategy artifacts (create, update, archive)
  - Member can execute strategy (check-ins)
  - Viewer remains read-only
  - Accessibility baseline preserved for major flows

