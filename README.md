# Pitch Board

A full-stack MERN marketplace where startup founders post funding pitches and investors browse them and express interest.

Built as a take-home assignment for the StartupMeu MERN Stack Intern role.

## Features

- Register and log in as a **founder** or an **investor** (JWT authentication, passwords hashed with bcrypt)
- **Role-based access**: only founders can create pitches, and only the owner can edit or delete a pitch
- Browse pitches with **search by title** and **filters** for sector and stage
- **Pitch detail page** with an "Express interest" form for investors (one interest per investor per pitch, enforced by a unique database index)
- **Dashboard**:
  - Founders see their own pitches and the interest they received (investor name, email and message)
  - Investors see the pitches they showed interest in
- Deleting a pitch also removes its interest records
- Clear loading, error and success states in the UI
- Automated API tests with Jest and Supertest, running against a separate test database

## Technologies Used

| Layer | Technology |
|---|---|
| Database | MongoDB (Atlas) with Mongoose |
| Backend | Node.js, Express.js |
| Frontend | React (Vite), React Router, Axios, Context API |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Testing | Jest, Supertest |

## Project Structure

```
pitch-board/
├── server/
│   ├── config/         # database connection
│   ├── controllers/    # route logic (auth, pitches, interests)
│   ├── middleware/     # auth: protect (token check), authorize (role check)
│   ├── models/         # Mongoose schemas: User, Pitch, Interest
│   ├── routes/         # URL to controller mapping
│   ├── tests/          # Jest + Supertest API tests
│   ├── app.js          # Express app (used by the server and the tests)
│   ├── server.js       # connects to MongoDB and starts listening
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── api/        # single Axios instance (adds the token to requests)
│   │   ├── context/    # AuthContext (logged-in user state)
│   │   ├── components/ # Navbar, PitchCard, ProtectedRoute
│   │   └── pages/      # Login, Register, Pitches, PitchDetail, PitchForm, Dashboard
│   └── .env.example
└── README.md
```

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org) (LTS version) and npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (the free M0 tier is enough)
  - Create a database user
  - Add your IP address under Network Access
  - Copy the connection string and add a database name, e.g. `/pitchboard`, before the `?`

### 1. Clone the repository

```bash
git clone https://github.com/abeeshkumaravel143-bit/pitch-board.git
cd pitch-board
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder (copy `.env.example`; on Windows use `copy .env.example .env`) and fill in:

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string used to sign tokens |
| `CLIENT_URL` | Frontend address allowed by CORS (default `http://localhost:5173`) |

You can generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` folder (copy `.env.example`) containing:

```
VITE_API_URL=http://localhost:5000/api
```

## How to Run

Open two terminals.

**Terminal 1: server**

```bash
cd server
npm run dev
```

You should see `MongoDB connected` and `Server running on port 5000`.

**Terminal 2: client**

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Trying the app

1. Register a **founder** account and create a pitch (New Pitch).
2. Log out, register an **investor** account, open the pitch and send interest.
3. Log back in as the founder and open the Dashboard to see the interest received.

## Running the Tests

```bash
cd server
npm test
```

The tests use a separate `pitchboard_test` database (on the same cluster) which is dropped before and after the run, so real data is never touched. There are 17 API tests covering registration and login, token checks, role permissions, pitch validation and filtering, ownership rules, malformed ids, and the interest rules (including duplicates and who can see what).

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/pitches` (filters: `q`, `sector`, `stage`, `mine=true`) | Logged in |
| GET | `/api/pitches/:id` | Logged in |
| POST | `/api/pitches` | Founder |
| PUT, DELETE | `/api/pitches/:id` | Pitch owner |
| POST | `/api/pitches/:id/interest` | Investor |
| GET | `/api/interests/mine` | Logged in (data depends on role) |

## Design Notes

- **Separation of concerns**: routes only map URLs to controllers, and controllers hold the logic.
- **Authentication vs authorization**: the `protect` middleware verifies the JWT and loads the user; `authorize('founder')` checks the role.
- **Security basics**: passwords are hashed and never returned by the API, controllers pick allowed fields instead of trusting `req.body` (so a user cannot set another user as the pitch owner), search input is escaped before being used in a regex, and invalid ids return a clean `400`.
- **Data integrity**: a unique index on `(pitch, investor)` prevents duplicate interests even under concurrent requests.

## Known Limitations and Possible Improvements

- The login token is stored in `localStorage`, which is simple but exposed to XSS; httpOnly cookies would be safer for production.
- No pagination on the pitch list.
- Founders are not notified (e.g. by email) when an investor sends interest; they see it on the Dashboard.
- No password reset, email verification or rate limiting.

## AI Tool Used

I installed **Code0 (CodeZero AI IDE)** in VS Code as requested, signed in and connected it to this repository, but the extension froze on my machine and I could not use it for development. Most of the AI assistance in this project came from a general-purpose AI chat assistant (Claude).

## AI Development Experience

I built this project step by step with an AI chat assistant. For each part (server setup, auth, models, React pages, tests) I asked for the code together with an explanation, typed or pasted it into my project, ran it, tested it in Postman and the browser, and fixed whatever broke. I also used it to learn Express, Mongoose and JWT concepts that were new to me, since my earlier backend experience was in Python/FastAPI. I committed to GitHub after each working feature.

## Specific Tasks Where I Used AI

1. **API creation**: built the JWT register/login, role-based middleware, pitch CRUD and the interest feature, then tested every route in Postman.
2. **Debugging a React crash**: the pitch list threw "Cannot read properties of undefined"; I traced it to component code pasted into the wrong file and fixed it.
3. **Debugging a filter bug**: the founder dashboard showed every pitch instead of only the founder's own, because the `mine` filter was ignored; I fixed the query so the filter is built before the database call.
4. **Database integration**: fixed a MongoDB Atlas "bad auth" error by resetting the database user's password and correcting the connection string.
5. **Testing and refactoring**: set up Jest and Supertest, split `app.js` from `server.js` so the app can be tested without starting a server, and got 17 API tests passing against a separate test database.