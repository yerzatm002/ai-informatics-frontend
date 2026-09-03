# AI Informatics Frontend

React + Vite + Tailwind frontend for the FastAPI/Neon/Gemini backend of the dissertation MVP.

## Implemented

- Login / registration
- JWT Bearer authentication
- Automatic CONTROL / AI group display
- Student dashboard and progress
- Topics and lessons
- Practical tasks with persisted attempts
- Context-aware Gemini AI Tutor for AI-group users
- PRE / POST tests
- Likert survey
- Personal results
- Research Admin dashboard
- CONTROL vs AI analytics
- Participant list
- CSV export
- Responsive layout

## Backend URL

Create `.env` in the frontend root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

The supplied FastAPI backend already allows `http://localhost:5173` via CORS.

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend should be running at:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Suggested test accounts after backend seed

Admin: use the valid admin email configured in backend `.env` and its seed password.

AI demo student:

```text
ai1@demo.kz
Student123!
```

CONTROL demo student:

```text
control1@demo.kz
Student123!
```

## Production build

```bash
npm run build
```

Output is generated into `dist/`.

## API mapping

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /topics`
- `GET /topics/:id`
- `GET /topics/:id/tasks`
- `POST /tasks/:id/submit`
- `GET /tests/PRE`
- `POST /tests/PRE/submit`
- `GET /tests/POST`
- `POST /tests/POST/submit`
- `POST /agent/chat`
- `GET /survey`
- `POST /survey/submit`
- `GET /me/progress`
- `GET /admin/users`
- `GET /admin/analytics`
- `GET /admin/export`
