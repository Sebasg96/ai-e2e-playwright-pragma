# 📖 Guía Académica de Setup — AI-E2E Playwright PRAGMA

> Documentación paso a paso de todos los comandos ejecutados durante la inicialización del proyecto.
> Esta guía sirve como referencia y explicación académica para el repositorio de portafolio.

---

## 📋 Índice
1. [Prerrequisitos del sistema](#1-prerrequisitos-del-sistema)
2. [Inicialización del repositorio Git](#2-inicialización-del-repositorio-git)
3. [Creación del proyecto Node.js](#3-creación-del-proyecto-nodejs)
4. [Instalación de dependencias](#4-instalación-de-dependencias)
5. [Instalación de Playwright browsers](#5-instalación-de-playwright-browsers)
6. [Estructura de carpetas del framework](#6-estructura-de-carpetas-del-framework)
7. [Configuración de variables de entorno](#7-configuración-de-variables-de-entorno)
8. [Ejecución de tests](#8-ejecución-de-tests)
9. [Integración de AI Agents y Skills](#9-integración-de-ai-agents-y-skills)
10. [CI/CD con GitHub Actions](#10-cicd-con-github-actions)
11. [Flujo de trabajo recomendado](#11-flujo-de-trabajo-recomendado)

---

## 1. Prerrequisitos del sistema

Antes de comenzar, verificar que el sistema tenga instalado:

```bash
# Verificar versión de Node.js (requerida: >= 20)
node --version
# Expected: v20.x.x o superior

# Verificar npm
npm --version
# Expected: 10.x.x o superior

# Verificar git
git --version
# Expected: git version 2.x.x
```

> **¿Por qué Node.js 20?** Playwright 1.52 requiere Node.js 18+ para soporte completo de ES Modules y las últimas APIs de fetch. Node 20 es la versión LTS actual con soporte hasta 2026.

---

## 2. Inicialización del repositorio Git

```bash
# Paso 2.1 — Navegar al directorio del workspace
cd "/home/seb/Documents/PRAGMA E2E"

# Paso 2.2 — Inicializar repositorio Git local
git init
# Output: Initialized empty Git repository in /path/to/PRAGMA E2E/.git/

# Paso 2.3 — Renombrar la rama por defecto a 'main' (estándar moderno)
git branch -m main
# Esto evita el uso del término 'master' que GitHub desaconseja

# Paso 2.4 — Conectar con el repositorio remoto en GitHub
git remote add origin https://github.com/Sebasg96/ai-e2e-playwright-pragma.git

# Verificar la configuración del remote
git remote -v
# Expected:
# origin  https://github.com/Sebasg96/ai-e2e-playwright-pragma.git (fetch)
# origin  https://github.com/Sebasg96/ai-e2e-playwright-pragma.git (push)
```

> **Conceptos clave**:
> - `git init` crea la carpeta `.git/` que contiene todo el historial del repositorio
> - `git branch -m main` renombra la rama inicial — convenio adoptado por GitHub desde 2020
> - `git remote add origin <url>` enlaza el repo local con el remoto en GitHub

---

## 3. Creación del proyecto Node.js

El archivo `package.json` se creó manualmente (no con `npm init`) para tener control total sobre su contenido desde el inicio:

```bash
# Estructura del package.json creado:
cat package.json
```

**Scripts definidos:**

| Script | Comando | Descripción |
|---|---|---|
| `npm test` | `playwright test` | Ejecuta todos los tests |
| `npm run test:smoke` | `playwright test --grep @smoke` | Solo tests críticos |
| `npm run test:sanity` | `playwright test --grep @sanity` | Tests de PR |
| `npm run test:regression` | `playwright test --grep @regression` | Tests completos |
| `npm run test:a11y` | `playwright test --grep @a11y` | Tests de accesibilidad |
| `npm run test:ui` | `playwright test --ui` | Modo visual interactivo |
| `npm run report` | `playwright show-report` | Abre HTML report |
| `npm run type-check` | `tsc --noEmit` | Valida TypeScript sin compilar |

> **¿Por qué estos scripts?** Siguen la estrategia de tiering del framework:
> Smoke → Sanity → Regression → A11y. Cada nivel se ejecuta en un contexto diferente del CI/CD.

---

## 4. Instalación de dependencias

```bash
# Instalar todas las dependencias listadas en package.json
npm install
# Output:
# added 126 packages, and audited 127 packages in 8s
# found 0 vulnerabilities
```

**Dependencias instaladas:**

| Paquete | Versión | Propósito |
|---|---|---|
| `@playwright/test` | ^1.52.0 | Framework de testing E2E — core del proyecto |
| `typescript` | ^5.7.0 | Lenguaje tipado — mejora mantenibilidad |
| `@types/node` | ^22.0.0 | Tipos de TypeScript para Node.js APIs |
| `dotenv` | ^16.4.0 | Carga variables desde `.env` |
| `allure-playwright` | ^3.0.0 | Reporter avanzado con métricas y tendencias |
| `eslint` + TS plugins | ^9.0.0 | Linting — asegura calidad de código |

> **¿Por qué `@playwright/test` y no `playwright` directamente?**
> `@playwright/test` incluye el test runner integrado con soporte nativo para 
> fixtures, assertions web-first, y configuración de proyectos multi-browser.
> Es el paquete oficial recomendado por Microsoft para testing.

---

## 5. Instalación de Playwright browsers

```bash
# Instalar solo Chromium para desarrollo local (más rápido)
npx playwright install chromium
# Output:
# Downloading Chrome for Testing 147.0.7727.15 from cdn.playwright.dev
# 170.4 MiB downloaded to ~/.cache/ms-playwright/chromium-1217

# Para CI con todos los browsers:
npx playwright install --with-deps
# Instala: Chromium, Firefox, y WebKit + dependencias del sistema

# Para producción/CI instalación completa con dependencias del sistema:
npx playwright install chromium --with-deps
# Nota: requiere permisos sudo en Linux para instalar libs del sistema
```

> **¿Dónde se instalan?** En `~/.cache/ms-playwright/` — NO dentro del proyecto.
> Esto evita subir binarios de varios cientos de MB al repositorio.
>
> **¿Por qué Chromium primero?** En desarrollo local usamos Chromium (más rápido).
> Firefox y WebKit se validan en CI durante el pipeline de regresión nightly.

---

## 6. Estructura de carpetas del framework

La estructura fue diseñada siguiendo el patrón **Page Object Model (POM)**:

```bash
# Ver estructura completa
find . -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
```

### Explicación por directorio

#### `src/pages/` — Page Objects
```
src/pages/
├── BasePage.ts        # Clase abstracta base con utilities compartidos
├── LoginPage.ts       # POM para la página de autenticación de PRAGMA  
└── DashboardPage.ts   # POM para el dashboard principal
```

**Principio:** Cada página de la aplicación tiene una clase correspondiente.
Los tests solo interactúan con la UI a través de estos objetos — nunca directamente.

#### `src/fixtures/` — Custom Fixtures
```
src/fixtures/
└── base.fixture.ts    # Extiende `test` de Playwright con POMs pre-instanciados
```

**Principio:** En lugar de crear `new LoginPage(page)` en cada test, los fixtures
lo hacen automáticamente. Reduce boilerplate y asegura consistencia.

#### `tests/` — Test Files (organizados por tier)
```
tests/
├── auth.setup.ts      # Setup global: login una vez, guarda sesión
├── smoke/             # @smoke — tests más críticos, ejecutan siempre
├── sanity/            # @sanity — features principales, ejecutan en PRs
├── regression/        # @regression — cobertura completa, nightly
└── a11y/              # @a11y — accesibilidad WCAG 2.1 AA
```

#### `.github/` — AI Integration
```
.github/
├── agents/            # Definiciones de AI agents (personas especializadas)
├── instructions/      # Instrucciones de código para AI assistants
├── skills/            # Playbooks reutilizables con ejemplos y templates
└── workflows/         # CI/CD con GitHub Actions
```

---

## 7. Configuración de variables de entorno

```bash
# Paso 7.1 — Copiar el template de variables de entorno
cp .env.example .env

# Paso 7.2 — Editar con valores reales (nunca subir .env a git)
nano .env   # o usar VS Code: code .env

# Contenido de .env para desarrollo local:
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=tu-usuario@pragma-test.com
TEST_USER_PASSWORD=tu-contraseña-segura
ENVIRONMENT=local
```

> **Seguridad:** `.env` está en `.gitignore`. Los valores reales NUNCA se suben a GitHub.
> En CI, estos valores se configuran como **GitHub Secrets** (`Settings > Secrets > Actions`).

### Configuración de GitHub Secrets (para CI)

```
SETTINGS > Secrets and variables > Actions > New repository secret

Añadir:
- BASE_URL => https://tu-app.vercel.app
- TEST_USER_EMAIL => testuser@pragma.com
- TEST_USER_PASSWORD => ***
```

---

## 8. Ejecución de tests

```bash
# Ejecutar smoke tests (más rápido, siempre primero)
npm run test:smoke

# Ejecutar en modo UI interactivo (recomendado para desarrollo)
npm run test:ui

# Ejecutar en modo debug (pausa en cada paso)
npm run test:debug

# Ejecutar con headed browser (ver el browser en acción)
npm run test:headed

# Ejecutar un archivo específico
npx playwright test tests/smoke/login.spec.ts

# Ejecutar con un browser específico
npx playwright test --project=chromium
npx playwright test --project=firefox

# Ver el reporte HTML generado
npm run report
```

### Flujo de primera ejecución

```bash
# 1. Asegurarse de que PRAGMA está corriendo localmente
# (En el repo de la app): npm run dev

# 2. Ejecutar el setup de autenticación manualmente (si es necesario)
npx playwright test tests/auth.setup.ts

# 3. Correr smoke tests
npm run test:smoke -- --project=chromium

# 4. Ver reporte
npm run report
```

---

## 9. Integración de AI Agents y Skills

Este proyecto integra el sistema de agentes de [fugazi/test-automation-skills-agents](https://github.com/fugazi/test-automation-skills-agents).

### ¿Cómo funciona?

Los archivos en `.github/agents/`, `.github/instructions/`, y `.github/skills/` son leídos por
AI assistants (GitHub Copilot, Claude con MCP, Cursor) para guiar la generación de código.

```bash
# Verificar que los archivos de agentes existen
ls .github/agents/
# playwright-test-planner.agent.md
# playwright-test-generator.agent.md
# playwright-test-healer.agent.md
# flaky-test-hunter.agent.md

# Verificar instrucciones
ls .github/instructions/
# playwright-typescript.instructions.md
# a11y.instructions.md

# Verificar skills
ls .github/skills/
# playwright-e2e-testing/SKILL.md
```

### Usar agentes en VS Code (GitHub Copilot)
```
1. Abrir GitHub Copilot Chat (Ctrl+Alt+I)
2. Seleccionar el agente: @playwright-test-planner
3. Prompt: "Explore PRAGMA app at http://localhost:3000 and create a test plan"
```

### Usar agentes en Claude / Cursor
Los archivos `.agent.md` funcionan como system prompts especializados.
Al referenciar el contenido del agente, el AI asume la persona definida.

---

## 10. CI/CD con GitHub Actions

El pipeline está en `.github/workflows/playwright-tests.yml`:

```bash
# Estructure de jobs:
# 1. smoke   → En cada push a main/develop
# 2. sanity  → En cada Pull Request
# 3. regression → Nightly (2 AM UTC) con matrix de browsers
# 4. accessibility → En PRs y nightly
```

### Ver pipeline en GitHub
```
Repository > Actions > Playwright E2E Tests
```

### Configurar primera ejecución manual
```
Repository > Actions > Playwright E2E Tests > Run workflow > Select tier
```

---

## 11. Flujo de trabajo recomendado

### Para desarrollar nuevos tests:

```bash
# 1. Crear rama feature
git checkout -b feature/test-strategy-module

# 2. Actualizar/crear POM si la página es nueva
# → src/pages/StrategyPage.ts

# 3. Actualizar fixtures si es necesario
# → src/fixtures/base.fixture.ts

# 4. Escribir el test en el tier correcto
# → tests/sanity/strategy.spec.ts  (nuevo feature)
# → tests/smoke/strategy-critical.spec.ts  (flujo crítico)

# 5. Verificar TypeScript
npm run type-check

# 6. Ejecutar el test localmente
npx playwright test tests/sanity/strategy.spec.ts --headed

# 7. Commit y push
git add .
git commit -m "test(strategy): add sanity tests for OKR creation flow"
git push origin feature/test-strategy-module

# 8. Crear PR — el pipeline smoke + sanity correrá automáticamente
```

### Convención de commits

```
test(scope): descripción corta

Tipos: test | feat | fix | refactor | docs | ci
Scopes: login | dashboard | strategy | a11y | ci | pom

Ejemplos:
test(login): add smoke test for invalid credentials
pom(strategy): add KeyResultPage with check-in methods
ci: add webkit browser to regression matrix
docs: update setup guide with env variables section
```

---

*Generado el 11 de Abril, 2026 — Sebastian Gomez*  
*Repositorio: [github.com/Sebasg96/ai-e2e-playwright-pragma](https://github.com/Sebasg96/ai-e2e-playwright-pragma)*
