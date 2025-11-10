# Realworld DSAR Workflow

This repository contains two coordinated applications:

- `apps/dsar-workflow`: Spring Boot service that persists DSAR (data subject access request) records, supports lifecycle transitions, summary reporting, and note management backed by Flyway migrations.
- `apps/ui`: React + Vite front end that provides an operator console for creating requests, reviewing metrics, acting on queue items, and managing notes.

## Project status

The DSAR workflow implementation is feature-complete relative to the requirements from the previous iteration:

- REST endpoints cover creation, updates, status transitions with automatic resolution notes, note CRUD, status summaries, and validation errors.
- Integration tests exercise the end-to-end lifecycle, including validation failures and conflict handling.
- The UI exposes intake forms, dashboards, queue filtering, and inline actions against the backend API.

## Local development

### Backend

The Spring Boot service now defaults to an in-memory H2 database, so you can launch the API locally without provisioning Postgres. Gradle still needs network access the first time it resolves plugins and dependencies.

```bash
cd apps/dsar-workflow
./gradlew bootRun   # starts the API against the in-memory H2 database
./gradlew test      # executes the integration test suite
```

To point the service at a real Postgres instance instead, activate the `postgres` Spring profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=postgres'
```

### Frontend

```bash
cd apps/ui
npm install
npm run dev   # start development server
npm run build # type-check and create a production build
```

## Known limitations

- Automated backend builds require access to Maven Central and the Gradle Plugin Portal; without connectivity, tests cannot run.
- The UI relies on the backend service being available at `/api`. Proxy configuration may be needed when developing locally.
