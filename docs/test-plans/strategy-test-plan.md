# PRAGMA Strategy Module Test Plan

## 1. Overview
This document outlines the Playwright End-to-End test scenarios for the PRAGMA Strategy module. It leverages the application's actual React components and existing `data-testid` attributes to ensure resilient and scalable test execution.

**Target Path:** `http://localhost:3000/strategy` (or equivalent environment URL)
**Key Areas Covered:** 
- Strategy Dashboard Navigation (Mega, Areas, Objectives)
- Key Result (KR) Creation and Check-ins
- Initiative Creation and Kanban Tracking
- Strategy Weight Management

---

## 2. Test Environment Setup & Teardown

To ensure test idempotency, the environment data must be preserved at a clean baseline between test executions. 

### Data Cleanup Script (Teardown Hook)
Existe un script dedicado para limpiar toda la información estratégica del tenant, asegurando un entorno determinístico:
- **Script:** `scripts/cleanTestData.ts`
- **Función:** Este script usa Prisma para eliminar recursivamente toda la información estructurada (Accesos, Iniciativas, OKRs, KRs, Objetivos, Megas, Propósitos y Ejes Estratégicos) manteniendo intacto el `Tenant` y los `Usuarios`.
- **Implementación Recomendada en Playwright:** Integrar este comando dentro de la etapa de "Global Teardown" o en un `afterAll` hook del suite de Strategy.
  ```bash
  npx tsx scripts/cleanTestData.ts [tenantId]
  ```

---

## 3. Test Scenarios

### 2.1 Smoke Tests (Critical Pathways)

#### `@smoke` Verify User can navigate to the Strategy Dashboard
- **Module:** Strategy Navigation
- **Pre-conditions:** User is authenticated and lands on Hub/Dashboard.
- **Steps:**
  1. Click on the Strategy Module in the sidebar (`data-testid="nav-item-strategy"`).
  2. Wait for the page title to appear (`data-testid="strategy-page-title"`).
  3. Verify the global progress indicator is visible (`data-testid="strategy-global-progress"`).
  4. Ensure the default Dashboard tab is active (`data-testid="strategy-tab-dashboard"`).
- **Expected Outcome:** Strategy Dashboard loads successfully with primary navigation elements present.

#### `@smoke` Verify Key Result Creation Modal Functionality
- **Module:** KR Management
- **Pre-conditions:** User is authenticated and is on the Strategy Dashboard. Purpose and MEGA must be defined first.
- **Steps:**
  1. Click to expand an Objective (`data-testid="strategy-objective-expand-btn"`).
  2. Click the New KR button inside the cascade (`data-testid="strategy-add-objective-btn"` / `strategy-cascade-add-kr`).
  3. Verify the modal opens (`data-testid="kr-creator-form"`).
  4. Verify the sections display properly (`data-testid="kr-creator-direction-section"`, `data-testid="kr-creator-statement"`).
  5. Close the modal (`data-testid="kr-creator-close"`).
- **Expected Outcome:** User can successfully open and close the KR creation form.

---

### 2.2 Sanity Tests (Primary Functionality Flow)

#### `@sanity` Define Organization Purpose
- **Module:** Strategy Architecture
- **Pre-conditions:** User is Tenant Admin and no purpose exists.
- **Steps:**
  1. Navigate to the Strategy Dashboard.
  2. Locate the Organization Purpose section (`data-testid="strategy-purpose-org"`).
  3. Add a new Values statement (`data-testid="strategy-add-value-input"`, click `data-testid="strategy-add-value-btn"`).
  4. Add a new Strategic Axis (`data-testid="strategy-add-axis-input"`, click `data-testid="strategy-add-axis-btn"`).
- **Expected Outcome:** Purpose values and strategic axes are successfully defined and displayed.

#### `@sanity` Create a Strategy MEGA
- **Module:** Strategy Architecture
- **Pre-conditions:** The Organization Purpose has been defined.
- **Steps:**
  1. Click on MEGA suggestion/addition (`data-testid="strategy-mega-suggest-btn"` or `strategy-mega-submit-btn`).
  2. Fill in the MEGA parameters and confirm.
- **Expected Outcome:** A new MEGA is created and visible in the architecture cascade.

#### `@sanity` Create a New Key Result
- **Module:** KR Management
- **Pre-conditions:** Organization Purpose, MEGA, and at least one Objective are defined.
- **Steps:**
  1. Open KR creator modal (`data-testid="kr-creator-toggle"`).
  2. Select direction, typically `Aumentar` (`data-testid="kr-creator-direction-btn-aumentar"`).
  3. Input statement text (`data-testid="kr-creator-statement"` or child input).
  4. Fill unit type (`data-testid="kr-creator-unit-input"`).
  5. Set target value (`data-testid="kr-creator-target-input"`).
  6. Submit form (`data-testid="kr-creator-submit-btn"`).
- **Expected Outcome:** KR is successfully created and appears sequentially inside the Objective component.

#### `@sanity` Perform Weekly OKR Check-in
- **Module:** KR Check-ins
- **Pre-conditions:** User has active KRs assigned.
- **Steps:**
  1. Navigate to the Strategy Dashboard.
  2. Click the weekly check-in button (`data-testid="strategy-weekly-checkin-btn"`).
  3. Ensure the check-in modal opens (`data-testid="kr-checkin-modal"`).
  4. Provide progress input/status and advance via the "Next KR" or "Finalizar" button.
  5. Verify successful submission without errors.
- **Expected Outcome:** User can log progression values sequentially for their assigned KRs and save.

#### `@sanity` Submit a New Initiative
- **Module:** Initiatives / Kanban
- **Pre-conditions:** An established KR must exist.
- **Steps:**
  1. Navigate to the Kanban board (`/kanban`) or Strategy component that links to initiatives.
  2. Open the initiative creator (`data-testid="initiative-creator-toggle"`).
  3. Fill out the initiative name (`data-testid="initiative-creator-title"`).
  4. Select the parent Key Result (`data-testid="initiative-creator-kr-select"`).
  5. Assign an owner (`data-testid="initiative-creator-owner"`).
  6. Click submit (`data-testid="initiative-creator-submit"`).
- **Expected Outcome:** A new initiative card is generated (`data-testid="kanban-initiative-<id>"`).

---

### 2.3 Regression Tests (Edge Cases & Settings)

#### `@regression` Adjust Sub-Weights within Strategy Weights Tab
- **Module:** Weight Management
- **Pre-conditions:** Existing MEGA and Objectives with weights initialized.
- **Steps:**
  1. Navigate to the Strategy Dashboard.
  2. Switch to the Weights tab (`data-testid="strategy-tab-weights"`).
  3. Identify an objective row and toggle to expand it (`data-testid="weights-obj-<id>-toggle"`).
  4. Modify a Key Result's weight input (`data-testid="weights-kr-<id>-input"`).
  5. Save the weights (`data-testid="weights-save-button"`).
- **Expected Outcome:** Weights save properly and update the overall visual distribution percentage.

#### `@regression` Delete Axis / Value from MEGA Purpose
- **Module:** Mega Configuration
- **Pre-conditions:** User has Tenant Admin capabilities.
- **Steps:**
  1. Navigate to Strategy Dashboard.
  2. Hover or expand the Organization Purpose MEGA block (`data-testid="strategy-purpose-org"`).
  3. Identify a value or axis item.
  4. Attempt deletion (`data-testid="strategy-delete-value-btn"` or `data-testid="strategy-delete-axis-btn"`).
- **Expected Outcome:** Values and axes update gracefully and persist on reload without throwing runtime exceptions.

## 3. Data-TestID Reference Map

These selectors correlate to the existing application source code (`src/components/Strategy/*`) to be used in E2E page objects:

**Dashboard & Navigation:**
- `strategy-page-title`
- `strategy-global-progress`
- `strategy-weekly-checkin-btn`
- `strategy-tab-dashboard`, `strategy-tab-weights`, `strategy-tab-health`

**Cascade & Architecture:**
- `strategy-purpose-org`, `strategy-purpose-area`
- `strategy-add-value-btn`, `strategy-add-value-input`, `strategy-delete-value-btn`
- `strategy-mega-delete-btn`, `strategy-mega-suggest-btn`, `strategy-mega-submit-btn`

**Key Results & Initiatives Creators:**
- `kr-creator-toggle`, `kr-creator-form`, `kr-creator-close`
- `kr-creator-direction-btn-aumentar`, `kr-creator-direction-btn-mantener`
- `kr-creator-submit-btn`
- `initiative-creator-toggle`, `initiative-creator-kr-select`, `initiative-creator-submit`

**Execution & Check-ins:**
- `kr-checkin-modal`, `kr-checkin-close`
- `weights-save-button`, `weights-obj-<id>-input`
