# PlantWeb Project Architecture

## Overview

PlantWeb is a full-stack web application for selling plants. The project is split into separate `frontend` and `backend` directories. Currently, the project appears to be in its early development stages, with foundational folders and configurations set up.

## Technology Stack

### Frontend

- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4, with Shadcn UI (Radix UI primitives) and Class Variance Authority (`cva`)
- **State Management:** Zustand
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Phosphor Icons (`@phosphor-icons/react`), although `lucide-react` is also present in `package.json`.
- **Other utilities:** `axios` for HTTP requests, `sonner` for toast notifications.

### Backend

- **Framework:** Express (implied by user, though `package.json` currently only lists `nodemon` in devDependencies, meaning standard dependencies like `express` or `mssql` might not be saved yet or will be added soon).
- **Language:** JavaScript (Node.js)
- **Database:** SQL Server (as mentioned by the creator).
- **Execution:** Uses `nodemon` for development and `node src/server.js` for production start.

## Directory Structure

### `/backend`

- `package.json`: Contains basic scripts (`dev`, `start`).
- `src/`: The main source code directory.
  - `controllers/`: Intended for request handlers.
  - `libs/`: Contains utility or configuration files (e.g., `db.js` for database connection).
  - `middlewares/`: For Express middleware.
  - `models/`: Database models/schemas.
  - `routes/`: Express route definitions.
  - `server.js`: The application entry point (currently empty).

### `/frontend`

- `package.json`: Extensive list of modern React/Tailwind ecosystem tools.
- `vite.config.ts`, `tsconfig.*.json`, `tailwind.config.*` (implied/Vite specific configs): Standard setup files.
- `src/`: Core frontend code.
  - `assets/`: Static assets like images or global CSS variables.
  - `components/`: UI components, likely including shadcn UI components.
  - `lib/`: Utility functions (often contains `utils.ts` for Tailwind merge).
  - `pages/`:
    - `HomePage.tsx`
    - `SignInPage.tsx`
    - `SignUpagePage.tsx` (Note: there is a typo in the file name `SignUpagePage.tsx`).
  - `App.tsx`: Main application component, sets up `BrowserRouter`, `Toaster`, and public routes.
  - `main.tsx`: React DOM rendering entry point.
  - `index.css`: Global styles, likely includes Tailwind directives and CSS variables for theming.

## Notes for Future Reference

- The backend `server.js` is currently empty. To get the backend running, an Express instance needs to be initialized, and the `mssql` (or equivalent) database connection should be set up in `src/libs/db.js`.
- Frontend routing is functional for basic public routes (`/`, `/signin`, `/signup`), but protected routes need to be implemented in `App.tsx`.
- The typo `SignUpagePage.tsx` might cause confusion later and could be renamed to `SignUpPage.tsx`.
- Ensure Express and SQL Server driver (`mssql`) are properly added to `backend/package.json` dependencies if not already installed globally.
