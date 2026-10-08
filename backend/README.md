# CampusLoop Backend

Express.js REST API and Socket.IO real-time engine for CampusLoop.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js ES Modules (`"type": "module"`)
- **Web Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Validation**: Zod
- **Logging**: Pino & `pino-http`
- **Security**: Helmet, CORS, Cookie-Parser
- **Testing**: Vitest + Supertest

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run development server with nodemon
npm run dev

# Run automated tests
npm test

# Run production build
npm start
```

---

## 🧪 Endpoints (Phase 1)

- `GET /api/health` — Returns service health and MongoDB connection status.
