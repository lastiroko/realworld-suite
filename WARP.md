# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a monorepo containing a full-stack demonstration suite with three applications:
- **dsar-workflow**: A Spring Boot (Java 21) service for managing Data Subject Access Request (DSAR) cases with workflow states
- **incident-register**: A Spring Boot (Java 21) service for managing security incidents
- **ui**: A React + TypeScript + Vite frontend that connects to the backend services

## Commands

### Backend Services (dsar-workflow & incident-register)

Both backend services use Gradle with wrapper scripts.

**dsar-workflow** (port 8080):
```powershell
# Build and test
apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow build

# Run tests only
apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow test

# Run application (default profile uses PostgreSQL)
apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow bootRun

# Run with H2 in-memory database
apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow bootRun --args='--spring.profiles.active=h2'

# Run with local profile (PostgreSQL on localhost)
apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow bootRun --args='--spring.profiles.active=local'
```

**incident-register** (default port):
```powershell
# Build and test
apps\incident-register\gradlew.bat -p apps\incident-register build

# Run tests only
apps\incident-register\gradlew.bat -p apps\incident-register test

# Run application (uses H2 in-memory database)
apps\incident-register\gradlew.bat -p apps\incident-register bootRun
```

### Frontend (ui)

```powershell
# Install dependencies
cd apps\ui
npm install

# Run development server (port 5173 with proxy to backend on :8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Infrastructure

Start PostgreSQL database for dsar-workflow:
```powershell
# Start database
docker-compose -f infra\docker-compose.yml up -d

# Stop database
docker-compose -f infra\docker-compose.yml down
```

Database credentials:
- DB: `dsar`
- User: `dsar`
- Password: `dsar`
- Port: 5432

## Architecture

### Backend Architecture

Both backend services follow a similar layered architecture pattern:

**Package Structure:**
- `controller/` or at package root: REST API endpoints (Spring MVC `@RestController`)
- `entity/`: JPA entities mapping to database tables
- `repository/`: Spring Data JPA repositories for data access
- `service/`: Business logic layer
- Request/Response DTOs defined alongside controllers

**dsar-workflow specifics:**
- Base package: `com.realworld.dsar`
- Sub-packages:
  - `caseapp`: Core case management (CRUD, search, pagination, CSV export)
  - `caseapp.audit`: Audit trail tracking for case changes
  - `caseapp.security`: API key authentication filter for write operations (POST/PATCH/DELETE)
  - `api`: Health checks and CORS configuration
- Database migrations: `src/main/resources/db/migration/` (Flyway)
- Profiles: `application.properties` (default), `application-local.yml`, `application-dev.properties`, `application-h2.properties`
- **API Security**: Write operations (POST, PATCH, DELETE) require `X-API-Key` header if `app.apiKey` is configured in properties
- **Key endpoints**:
  - `/api/cases` - CRUD operations
  - `/api/cases/board` - Kanban board view grouped by status
  - `/api/cases/page` - Paginated search with sorting
  - `/api/cases/export` - CSV export with same filters as pagination
  - `/api/cases/{id}/audit` - Audit log for a case
  - `/api/cases/{id}/status` - Workflow transitions (NEW → VERIFYING → DELIVERED)

**incident-register specifics:**
- Base package: `com.realworld.irf.incident`
- Simpler structure with all classes in the incident package
- Uses H2 in-memory database (no migrations needed)
- Workflow states: OPEN → SECTION8 (after approval) → CLOSED
- **Key endpoints**:
  - `/api/incidents` - List/create incidents
  - `/api/incidents/board` - Kanban board view
  - `/api/incidents/{id}/approve-section8` - Approve for Section 8
  - `/api/incidents/{id}/close` - Close incident

### Frontend Architecture

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite (using rolldown-vite variant)
- **State management**: React hooks (useState, useEffect)
- **Data fetching**: Native fetch API
- **Proxy**: Vite dev server proxies `/api` to `http://localhost:8080`
- **Key components**:
  - `Kanban`: Main dashboard with drag-and-drop style board for dsar-workflow cases
  - `TableView`: Paginated table with search, filtering, and CSV export
  - Inline modal for case details and audit history
- **API integration**: Direct HTTP calls to backend REST endpoints at `http://localhost:8080/api/cases`

### Database Schema (dsar-workflow)

The `cases` table tracks DSAR workflow with these key columns:
- State machine: `status` (NEW, VERIFYING, DELIVERED)
- Timestamps: `created_at`, `due_at`, `verifying_at`, `delivered_at`
- Reference: Unique UUID-based case reference
- Metadata: `owner`, `summary`

Audit events are tracked separately in the `audit` table (implementation in `caseapp.audit` package).

### CI/CD

GitHub Actions workflows:
- **backend-ci.yml**: Triggers on changes to `apps/dsar-workflow/**`, runs Gradle build with Java 21
- **frontend-ci.yml**: Triggers on changes to `apps/ui/**`, runs npm build with Node 20

Both use caching for dependencies (Gradle cache, npm).

## Development Notes

### Running the Full Stack Locally

1. Start PostgreSQL: `docker-compose -f infra\docker-compose.yml up -d`
2. Start dsar-workflow: `apps\dsar-workflow\gradlew.bat -p apps\dsar-workflow bootRun` (or with `-Dspring.profiles.active=local`)
3. Start UI: `cd apps\ui && npm run dev`
4. Access UI at http://localhost:5173

For testing dsar-workflow without Docker, use the h2 profile.

### API Authentication

The dsar-workflow service uses an optional API key filter (`ApiKeyWriteGuard`):
- GET and OPTIONS requests pass through without authentication
- POST, PATCH, DELETE require `X-API-Key` header if `app.apiKey` property is set
- If `app.apiKey` is empty/blank, no authentication is enforced

### Testing

Both backend services use JUnit 5 (Jupiter) via Spring Boot Test:
- Test annotations: `@SpringBootTest`, `@WebMvcTest`, `@Test`
- Run all tests: `gradlew.bat test`
- Example test: `CaseSearchApiTest` for search/pagination API

### Database Migrations

dsar-workflow uses Flyway for schema versioning:
- Migration files: `apps/dsar-workflow/src/main/resources/db/migration/V*.sql`
- Controlled by `spring.flyway.enabled` property (currently disabled in default application.properties)
- When enabled, migrations run automatically on startup

### Spring Profiles

**dsar-workflow** supports multiple profiles for different environments:
- Default (`application.properties`): PostgreSQL with Flyway disabled
- `local` (`application-local.yml`): PostgreSQL with dynamic schema updates
- `dev` (`application-dev.properties`): PostgreSQL with Flyway validation
- `h2` (`application-h2.properties`): H2 in-memory for testing without Docker
