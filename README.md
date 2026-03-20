# Learning Tracker — Spaced Repetition

Track your learning progress and revise efficiently using SM-2 spaced repetition.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or use [MongoDB Atlas](https://cloud.mongodb.com) free tier)

### 1. Start the Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learning-tracker
JWT_SECRET=your_secret_key_here
```

```bash
npm run dev
```

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 📚 **Categories** — Organize learning into DSA, Books, Theory Subjects, etc.
- 📋 **Sections & Topics** — Break down each category into sections with trackable topics
- 📊 **Progress Tracking** — Visual progress rings and bars per section/category
- 🔄 **Spaced Repetition** — SM-2 algorithm schedules revision reminders
- 🔐 **Auth** — JWT-based user accounts
- 🌙 **Dark Mode** — Premium dark theme with glassmorphism
