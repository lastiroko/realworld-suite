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

The backend uses Gradle with the Spring Boot plugin. In network-restricted environments the Gradle wrapper cannot download the plugin distribution; run builds with an existing Gradle installation that already has the Spring Boot plugin cached, or configure an internal mirror.

```bash
cd apps/dsar-workflow
# Requires network access to download Gradle plugins and dependencies on the first run
./gradlew test
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
