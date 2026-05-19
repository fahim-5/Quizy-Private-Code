# Database Design — Online Quiz Platform

This document describes the MongoDB schema design for the Online Quiz Platform. It matches the current application models and API endpoints and recommends fields, indexes, relationships, sample documents, and operational notes.

---

## Design Goals

- Support teacher-created quizzes (title, duration, rules).
- Keep a question bank (add/edit/delete questions per quiz).
- Allow students to take quizzes with a timer and auto-submit.
- Store results with automatic scoring for objective questions.
- Provide efficient queries for leaderboards and result history.
- Protect correct answers from being exposed to clients.

---

## Collections (Overview)

- `users` — authentication & profile
- `quizzes` — quiz metadata, duration, rules
- `questions` — question bank, options, correct answer (server-only)
- `results` — user quiz attempts and computed scores
- (optional) `posts`, `logs`, `analytics` — for forums/audit/metrics

---

## `users` Collection

Purpose: Store accounts for students and teachers.

Fields:

- `_id` (ObjectId)
- `name` (string)
- `email` (string, unique, indexed)
- `identifier` (string) — optional roll/student/teacher ID
- `passwordHash` (string)
- `role` (string) — one of `student|teacher` (index)
- `active` (boolean, default true)
- `createdAt` (date)
- `lastLogin` (date)

Indexes:

- `email` unique
- `identifier` unique (if used)
- `role` for teacher queries

Sample document:

```json
{
  "_id": { "$oid": "..." },
  "name": "Fahim B.",
  "email": "fahim@example.com",
  "identifier": "2024001",
  "passwordHash": "$2b$...",
  "role": "teacher",
  "active": true,
  "createdAt": "2026-04-03T..."
}
```

---

## `quizzes` Collection

Purpose: Store quiz metadata and settings (title, duration/timeLimit, rules).

Fields:

- `_id` (ObjectId)
- `title` (string, required)
- `description` (string)
- `timeLimit` (number) — seconds; 0 or omitted = no limit
- `rules` (string) — human-readable rules or notes
- `creator` (ObjectId, ref `users`) — who created the quiz
- `isActive` (boolean) — whether quiz is visible
- `settings` (object) — e.g. `{ shuffleQuestions: true, showResultsImmediately: false }`
- `createdAt`, `updatedAt` (dates)
- `tags` (array of strings)
- `stats` (optional cached fields) — e.g. `{ attempts: 12, avgScore: 78 }`

Indexes:

- `creator`
- `isActive`
- text index on `title` + `description` for search (optional)

Sample document:

```json
{
  "_id": { "$oid": "..." },
  "title": "Midterm: Data Structures",
  "description": "CSE 4165 midterm quiz",
  "timeLimit": 1800,
  "rules": "No external resources. 1 attempt.",
  "creator": { "$oid": "..." },
  "isActive": true,
  "settings": { "shuffleQuestions": true, "showResultsImmediately": true },
  "createdAt": "2026-04-03T..."
}
```

Notes:

- `rules` kept as a single string for simplicity; if you need structured rules, use an array of objects.
- `timeLimit` stored in seconds; frontend Timer uses this value.

---

## `questions` Collection

Purpose: Question bank for quizzes. Do NOT return `correctIndex` in public endpoints.

Fields:

- `_id` (ObjectId)
- `quiz` (ObjectId, ref `quizzes`) — required
- `text` (string) — question text
- `type` (string) — `mcq|multi|text|boolean` (helps scoring)
- `options` (array) — for objective q's: `[{ text: "A" }, { text: "B" }]`
- `correctIndex` (number) — index of correct option (server-only)
- `points` (number) — points for this question (default 1)
- `explanation` (string) — optional after-submit explanation
- `createdAt` (date)

Indexes:

- `quiz` — to fetch questions by quiz

Security:

- The API should use `.select('-correctIndex')` (already implemented) when returning questions.

Sample document:

```json
{
  "_id": { "$oid": "..." },
  "quiz": { "$oid": "..." },
  "text": "What is the time complexity of binary search?",
  "type": "mcq",
  "options": [
    { "text": "O(n)" },
    { "text": "O(log n)" },
    { "text": "O(n log n)" }
  ],
  "correctIndex": 1,
  "points": 2,
  "createdAt": "2026-04-03T..."
}
```

---

## `results` Collection

Purpose: Store completed quiz attempts and computed scores.

Fields:

- `_id` (ObjectId)
- `user` (ObjectId, ref `users`) — who took the quiz
- `quiz` (ObjectId, ref `quizzes`)
- `score` (number) — computed by server
- `total` (number) — maximum possible points
- `answers` (array) — `[{ question: ObjectId, answerIndex: Number }]`
- `takenAt` (date)
- `duration` (number) — seconds the user took (optional)
- `metadata` (object) — e.g., `{ ip, userAgent }` (optional)

Indexes:

- `user` — for result history
- `quiz` — for leaderboard queries

# Database Design — Online Quiz Platform (refined)

This document specifies a production-ready MongoDB design tailored to the faculty requirements.
It includes collection schemas, Mongoose snippets, indexes, sample API payloads, and common queries for
the features you listed: teacher quiz creation (title, duration, rules), question bank CRUD, timed quiz-taking,
automatic scoring, result history, leaderboard, and teacher monitoring.

Table of contents

- Overview & goals
- Collections: `users`, `quizzes`, `questions`, `results`, `analytics`, `audit_logs`
- Mongoose schema snippets
- Example API payloads
- Indexes & access patterns
- Aggregations: leaderboard, score summary, participation metrics
- Security, validation, and migration notes

---

## Overview & goals

Functional requirements recap (from faculty):

1. Teachers can create quizzes with title, duration (time limit), and rules.
2. Add, edit, and delete questions from a question bank.
3. Students take quizzes within a fixed time limit (timer enforced client-side and validated server-side).
4. Automatic scoring for objective questions (MCQ/multiple choice).
5. Students can view result history and score summaries.
6. Teachers can monitor participation and score records (leaderboards, aggregates).

Design principles:

- Use references (ObjectId) for relationships to keep question banks and quiz metadata manageable.
- Minimize exposure of correct answers (never return `correctIndex` to clients).
- Cache computed stats where needed to avoid heavy aggregations on read.

---

## Collections

1. `users`

- Purpose: authentication and profile.
- Fields:
  - `_id`: ObjectId
  - `name`: String
  - `email`: String (unique, indexed)
  - `identifier`: String (optional unique student/teacher id)
  - `passwordHash`: String
  - `role`: String enum `['student','teacher']` (indexed)
  - `active`: Boolean (default true)
  - `createdAt`, `updatedAt`: Date
  - `lastLogin`: Date

2. `quizzes`

- Purpose: quiz metadata and runtime settings.
- Fields:
  - `_id`: ObjectId
  - `title`: String (required)
  - `description`: String
  - `timeLimit`: Number (seconds; 0 => no limit)
  - `rules`: String (human readable) or `rulesList: [String]` if structured
  - `creator`: ObjectId -> `users` (creator id)
  - `isActive`: Boolean (default true)
  - `settings`: Object (e.g. `{ shuffleQuestions: Boolean, attemptsAllowed: Number, showAnswersAfterSubmit: Boolean }`)
  - `tags`: [String]
  - `stats`: { attempts: Number, avgScore: Number, lastAttemptAt: Date } (optional cached)
  - `createdAt`, `updatedAt`: Date

3. `questions`

- Purpose: question bank entries linked to quizzes.
- Fields:
  - `_id`: ObjectId
  - `quiz`: ObjectId -> `quizzes` (required)
  - `text`: String
  - `type`: String enum `['mcq','multi','boolean','short','long']`
  - `options`: [{ id: Number, text: String }] — for objective questions
  - `correctIndex`: Number (internal only; do not return to client)
  - `points`: Number (default 1)
  - `explanation`: String (optional, shown after grading if allowed)
  - `createdBy`: ObjectId -> `users`
  - `createdAt`, `updatedAt`: Date

4. `results`

- Purpose: store final attempts and computed scores.
- Fields:
  - `_id`: ObjectId
  - `user`: ObjectId -> `users`
  - `quiz`: ObjectId -> `quizzes`
  - `score`: Number (computed)
  - `total`: Number (total possible)
  - `answers`: [{ question: ObjectId, answerIndex: Number, timeTaken: Number? }]
  - `takenAt`: Date
  - `duration`: Number (seconds user spent)
  - `metadata`: { ip: String, userAgent: String }

5. `analytics` (optional)

- Purpose: pre-aggregated per-quiz metrics to support teacher dashboards without heavy realtime aggregation.
- Fields: `{ quiz, date, attempts, avgScore, passRate }`

6. `audit_logs` (optional)

- Purpose: record teacher actions for compliance (create/update/delete quizzes/questions)
- Fields: `{ actor, action, targetCollection, targetId, diff, timestamp }`

---

## Mongoose schema snippets

`models/User.js` (excerpt)

```js
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, index: true },
    identifier: { type: String, unique: true, sparse: true },
    passwordHash: String,
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
      index: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
```

`models/Quiz.js`

```js
const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    timeLimit: { type: Number, default: 0 }, // seconds
    rules: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    settings: { type: Object, default: {} },
    stats: { attempts: Number, avgScore: Number },
  },
  { timestamps: true },
);
```

`models/Question.js`

```js
const QuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["mcq", "multi", "boolean", "short", "long"],
      default: "mcq",
    },
    options: [{ id: Number, text: String }],
    correctIndex: Number, // server only
    points: { type: Number, default: 1 },
  },
  { timestamps: true },
);
```

`models/Result.js`

```js
const ResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", index: true },
    score: Number,
    total: Number,
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        answerIndex: Number,
      },
    ],
    duration: Number,
    metadata: Object,
  },
  { timestamps: { createdAt: "takenAt" } },
);
```

Notes:

- When returning `questions` to clients use `.select('-correctIndex')` or map out the field.

---

## Example API payloads

- Create quiz (teacher):

```json
POST /api/quizzes
{
  "title": "Midterm: Data Structures",
  "description": "CSE 4165 midterm",
  "timeLimit": 1800,
  "rules": "No external resources"
}
```

- Add question (teacher):

```json
POST /api/questions
{
  "quiz": "<quizId>",
  "text": "What is binary search complexity?",
  "type": "mcq",
  "options": [{"text":"O(n)"},{"text":"O(log n)"}],
  "correctIndex": 1,
  "points": 2
}
```

- Submit result (student):

```json
POST /api/results
{
  "quiz": "<quizId>",
  "answers": [ { "question": "<q1>", "answerIndex": 1 }, { "question": "<q2>", "answerIndex": 0 } ],
  "duration": 600
}
```

Server behaviour on submit:

- Validate that quiz exists and is active.
- Optionally check that `duration <= quiz.timeLimit` (if `timeLimit>0`) or accept duration but flag overshoot.
- Load the `questions` for the answered question ids (server reads `correctIndex`) and compute `score` and `total`.
- Insert a `results` document with computed `score` and `total` and push/update `quizzes.stats` and `analytics` counters asynchronously.

---

## Indexes & access patterns

Essential indexes:

- `users.email` (unique)
- `quizzes.creator`, `quizzes.isActive`, `quizzes.createdAt`
- `questions.quiz` (fetch questions by quiz)
- `results.user` and compound `{ user:1, takenAt:-1 }` for history
- `results.quiz` and compound `{ quiz:1, score:-1, takenAt:1 }` for leaderboard

Access patterns:

- Fetch active quizzes: `db.quizzes.find({ isActive: true }).sort({ createdAt: -1 })`
- Fetch questions for quiz: `db.questions.find({ quiz })`
- Leaderboard (top N): `db.results.find({ quiz }).sort({ score: -1, takenAt: 1 }).limit(N)`
- Score summary for user: `db.results.aggregate([{ $match:{ user } }, { $group:{ _id:null, avgScore:{ $avg:'$score' }, totalAttempts:{ $sum:1 } } }])`

---

## Aggregations / Example queries

- Leaderboard with user info:

```js
db.results.aggregate([
  { $match: { quiz: ObjectId("<quizId>") } },
  { $sort: { score: -1, takenAt: 1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  { $project: { score: 1, total: 1, "user.name": 1, takenAt: 1 } },
]);
```

- Participation & average score (per quiz):

```js
db.results.aggregate([
  {
    $group: {
      _id: "$quiz",
      attempts: { $sum: 1 },
      avgScore: { $avg: "$score" },
    },
  },
]);
```

---

## Security & validation

- Always authenticate protected endpoints with JWT and authorize teacher-only routes server-side.
- Never return `correctIndex` in question list endpoints; implement server-side `.select('-correctIndex')` or transform before response.
- Sanitize all inputs (server uses `express-mongo-sanitize`).
- Validate payloads (use `express-validator` or `Joi`) and enforce types (e.g., `timeLimit` numeric).

---

## Operational considerations

- Caching: maintain cached `quizzes.stats` or an `analytics` collection to avoid heavy aggregation when showing dashboards.
- Write throughput: if you expect many concurrent quiz submissions, ensure `results` insert throughput and index write cost is acceptable.
- Sharding: shard by `quiz` or `user` if dataset grows very large; design compound indexes accordingly.

---

## Migration notes

- Backfilling `rules`: a simple script can set `rules: ''` where missing or parse older text into `rulesList`.
- If you change `rules` to structured items, create a migration that splits existing `rules` on newline characters.

---

## Deliverables I can add next

- JSON Schema validations for API requests.
- Full Mongoose model files (ready-to-drop in `backend/models`).
- A PlantUML ER diagram file.

If you want any of those generated automatically, tell me which one to create next.

File: `databse.md` (updated)
