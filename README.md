# CampusPulse

CampusPulse is a React + Vite college event management frontend for administrators, coordinators, and students. It runs without a backend and stores its workspace in the current browser.

## Features

- Role-based portals with protected routes and persistent sessions
- Event, venue, coordinator, registration, attendance, and certificate workflows
- Student personal and academic profiles with immutable academic fields in the student workflow
- Academic registration snapshots, participant search/filtering, and CSV export
- Attendance-based certificates, downloadable PDFs, CampusCred activity records, and analytics
- Responsive layouts and direct URL support through nested React Router routes

## Tech Stack

- React 19, Vite 8, React Router 7
- lucide-react, jsPDF, html-to-image, qrcode.react
- Browser localStorage repository (no API service is configured)

## Requirements and Installation

Use Node.js 22.12+ (Vite 8 requirement) and npm.

```sh
npm install
npm run dev
```

The Windows equivalent is `npm.cmd run dev`. Run static checks with `npm.cmd run lint` and `npm.cmd run build`. Preview a production build with `npm.cmd run preview`.

## Accounts

The seeded local workspace includes:

| Role | Email |
| --- | --- |
| Administrator | `admin@campuspulse.demo` |
| Coordinator | `coordinator@campuspulse.demo` |
| Student | `student@campuspulse.demo` |
| Student | `aditi.student@campuspulse.demo` |
| Student | `rohan.student@campuspulse.demo` |
| Student | `meera.student@campuspulse.demo` |

Other seeded coordinators use `coordinator-b@campuspulse.demo` and `coordinator-c@campuspulse.demo`. The current frontend authentication accepts any non-empty password for a known account. Coordinator accounts created by an administrator can sign in with their assigned email. This is prototype-only behavior; it is not production authentication and no passwords are stored.

## Local Data

Sample events, coordinators, students, registrations, attendance, and certificates load when a data key is absent. Changes persist in browser localStorage. Admin → Settings has an explicit, confirmation-protected reset that restores the seeded workspace and clears locally created records for this application. It does not run automatically.

## Deployment

Build with `npm.cmd run build` and deploy the generated `dist/` directory. `public/_redirects` configures Netlify SPA fallback and `vercel.json` configures Vercel rewrites so nested React Router URLs resolve to `index.html`. Assets are imported from `src/assets` and bundled by Vite. There are currently no required environment variables or backend URLs.

## Current Limitations

- Authentication, authorization, and data are browser-local and can be changed by the browser user. They are not suitable for production or multi-user data sharing.
- Password validation, password recovery, email invitations, notification delivery, and institution verification require a backend.
- Locally generated attendance and CampusCred records are not institutionally verified. Legacy registrations are preserved; old records do not gain academic snapshot fields retroactively.
- Supabase is not connected. See [the integration plan](docs/SUPABASE_INTEGRATION_PLAN.md).

## Documentation

- [Architecture](docs/PROJECT_ARCHITECTURE.md)
- [Supabase integration plan](docs/SUPABASE_INTEGRATION_PLAN.md)
- [Testing checklist](docs/TESTING_CHECKLIST.md)
