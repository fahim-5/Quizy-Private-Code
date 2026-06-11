---

# 🧠 QuizMaster — Complete UX/UI Design Spec

## 1. AUTHENTICATION SYSTEM (First Priority)

### Purpose
Separate secure access for Teachers and Students. No mixing of roles.

### Screens & Flow

| Screen | Elements | Behavior |
|--------|----------|----------|
| **Landing / Role Select** | Two large buttons: 👩‍🏫 I'm a Teacher & 👩‍🎓 I'm a Student | Clicking shows respective login form |
| **Teacher Login** | Email, Password, "Login" button, "Forgot password?" link | After login → Teacher Dashboard |
| **Student Login** | Student ID or Email, Password or Access Code, "Join Quiz" button | After login → Student Lobby |
| **Register (Teacher only)** | Name, Email, Password, Confirm, Institution (required) | New teacher account creation. Role must be explicitly selected. Passwords must be at least 6 characters. Emails must be unique across the platform. |
| **Register (Student)** | Name, Roll/ID, Class section, Institution (required), Access Code from teacher | Student registration requires explicit `role` selection. Student `identifier` (Roll/ID) must be unique only within the same `institution` (different institutions may use the same ID). Passwords must be at least 6 characters. |

### Visual Notes

---

## **Registration Updates (May 2026)**

- **Password minimum**: Passwords must be at least **6 characters**. Enforced on both client (frontend) and server (backend) with a clear message: "Password must be at least 6 characters long".
- **Unique email**: Email is unique globally. Attempting to register with an email already in use returns: **"This email already has an account"**.
- **Institution-scoped identifier (ID)**: The login `ID` (identifier) is unique _per institution_. Two users in the same institution cannot register with the same ID (error shown: **"This ID already has an account for this institution"**). Different institutions may have overlapping IDs.
- **Institution required**: The `institution` field is mandatory at registration so the system can scope identifiers correctly.
- **Role selection required**: The role radio buttons (Student / Teacher) are intentionally **not pre-selected** — the user must explicitly choose a role. Registration will be blocked until a valid role is selected.
- **Improved error messages**: Backend error handling now translates database duplicate-index errors into human-friendly messages (email or identifier+institution) rather than raw DB text.
- **Client-side validation**: Frontend validates required fields, password length, lowercases the email, and requires role selection before submitting.
- **Server-side validation & enforcement**: Backend validates inputs, enforces password length, checks email uniqueness globally, and checks identifier uniqueness scoped to institution. Returns clear 400 responses for user-facing errors.
- **Migration script**: A migration script `backend/scripts/migrate-identifier-institution-index.js` is included to:
  - Find existing duplicate `identifier`+`institution` groups,
  - Rename duplicates (keeps first) to avoid collisions,
  - Drop any old single-field unique index on `identifier`, and
  - Create a compound unique index on `{ identifier: 1, institution: 1 }`.

**Files changed / added** (implementation):

- `frontend/src/pages/Register.jsx` — require role, client password length check, email normalization.
- `backend/middleware/validation.js` — increased password min to 6, added institution and role validation.
- `backend/controllers/authController.js` — explicit checks for institution/role, clearer duplicate checks.
- `backend/models/User.js` — password minlength 6; compound index `{identifier, institution}`; removed global identifier unique.
- `backend/middleware/errorHandler.js` — friendly duplicate-key messages.
- `backend/scripts/migrate-identifier-institution-index.js` — migration/normalization script.

These changes ensure real-world institutional IDs behave as expected and provide clearer UX when users attempt to register with conflicting data.

- Big, clear error messages ("Wrong password" in red)
- "Switch to Student/Teacher" link at bottom

### Registration rules (backend + frontend)

- Password: minimum 6 characters (client + server validation).
- Email: unique globally; attempting to register an email already in use returns: "This email already has an account".
- Identifier (student/teacher ID): uniqueness is scoped to `institution` (compound unique index `{ identifier, institution }`). If the same identifier is used within the same institution the API returns: "This ID already has an account for this institution". Different institutions may have the same identifier.
- Institution: required field during registration.
- Role: must be explicitly selected by the user (no default selection). Registration will be rejected if `role` is missing or invalid.
- Radio inputs: do not pre-select `student` — the user must choose `Student` or `Teacher` before submitting.
- Error handling: server returns clear, user-friendly messages for validation and duplicate-key errors. Frontend displays those messages verbatim to the user.
- Migration: a migration script was added at `backend/scripts/migrate-identifier-institution-index.js` which:
  - Normalizes existing duplicates by renaming conflicting identifiers (keeps the first, appends suffixes to duplicates),
  - Drops any old single-field unique index on `identifier` if present,
  - Creates the compound unique index on `{ identifier, institution }` to enforce the rule going forward.

These changes ensure real-world behaviour: students from different institutions can share the same roll number, while duplicates inside the same institution are prevented with clear feedback.

---

## Recent UI Updates — Profile & Settings (May 2026)

Summary: small but important UX improvements were implemented to the Profile and Settings pages to simplify the interface and increase security when changing sensitive information.

- **Profile page**
  - Replaced the old inline avatar with a shared `Avatar` component used across the app (Navbar and Profile) so visuals are consistent.
  - Enlarged the displayed user name for stronger visual hierarchy (`text-4xl` / `text-5xl` on larger screens).
  - Removed non-essential action buttons from the profile card: **Edit Profile**, **Manage Quizzes**, and **My Courses** were removed from the main actions area to reduce clutter. The edit workflow is still available via the Save/Cancel controls when the user enters edit mode.

- **Settings page**
  - Consolidated actions into a single **Save Update** button. The separate inline "Change password" button was removed.
  - If the user changes their email or requests a password change, the system now requires verification via a 6‑digit code sent to the (new) email before committing changes — matching the registration verification pattern. This prevents unauthorized email changes and ensures the email is valid.
  - A verification modal prompts for the 6‑digit code; after successful verification the backend applies the password change (if requested) and then updates profile fields.
  - The verification flow reuses the existing email/code pattern and endpoints (server sends a code, user verifies it, then update is applied).

Backend & Frontend artifacts changed for this flow:

- Backend
  - `User` model: added `passwordResetCode` and `passwordResetExpires` fields to store the 6‑digit code (hashed) and expiry.
  - `authController`: added endpoints to request a reset code (`POST /api/auth/forgot-password`), verify a code (`POST /api/auth/verify-reset`), and reset password (`POST /api/auth/reset-password`). These are the same primitives used for registration verification.
  - Temporary: added debug logging to `middleware/auth.js`'s `protect` middleware to assist with token/401 diagnostics during development.

- Frontend
  - Added `frontend/src/pages/Forgot.jsx` — a small three-step UI for requesting a reset code, verifying it, and updating the password (reusable by the Settings flow).
  - Added `frontend/src/components/Avatar.jsx` — reusable avatar component used by `Navbar.jsx` and `Profile.jsx` to keep visuals consistent.
  - Updated `frontend/src/pages/Profile.jsx` — uses `Avatar` and shows larger username; removed the extra action buttons and left only Save/Cancel in edit mode.
  - Updated `frontend/src/pages/Settings.jsx` — single `Save Update` flow; verification modal shown when email/password changed; applies change only after successful code verification.

Notes & developer checklist

- Ensure email SMTP env vars are configured (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`) so verification codes are delivered during testing.
- The code is hashed in the DB and expires in 15 minutes to keep the flow secure.
- The Settings flow intentionally reuses the reset/verification primitives to minimize backend surface area and keep behaviour consistent with registration.

## 2. TEACHER SIDE — Full Control Panel

### 2.1 Teacher Dashboard (After Login)

| Section             | Content                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Header**          | Welcome, [Teacher Name], today's date, Logout button                                                                      |
| **Quick Actions**   | ➕ Create New Quiz, 📊 View Reports, 👥 Manage Students                                                                   |
| **Active Quizzes**  | List of quizzes with: Title, Code, Status (Live/Paused/Ended), # of participants, Actions (Edit / Start / Stop / Results) |
| **Quiz Templates**  | Saved draft quizzes, copy & reuse                                                                                         |
| **Recent Activity** | Last 5 student submissions with scores                                                                                    |

### 2.2 Create / Edit Quiz (Step-by-step)

**Step 1 — Basic Info**

- Quiz title (required)
- Subject / Grade
- Time limit (minutes) — optional
- Attempts allowed (1 or multiple)

**Step 2 — Add Questions**

- Question types supported: MCQ, True/False, Short answer
- Each question card shows:
  - Question text field
  - Option A, B, C, D (for MCQ)
  - Correct answer selector
  - Points value (1–100)
  - ➕ Add Question button
  - ✏️ Edit / 🗑️ Delete icons

**Step 3 — Settings**

- Shuffle questions? (Yes/No toggle)
- Show answers after submission? (Yes/No)
- Access: Public (any student with code) or Private (specific class list)

**Step 4 — Publish**

- Generate unique 6-digit Quiz Code
- Option to copy code or share link
- Set Live / Draft

### 2.3 Live Quiz Monitor (Real-time)

| Panel  | Shows                                                                |
| ------ | -------------------------------------------------------------------- |
| Left   | List of currently joined students (names + status: answering / done) |
| Center | Live question results: % correct / wrong per question                |
| Right  | Controls: Pause Quiz, End Quiz, Send announcement to all             |
| Bottom | Individual student answers (expandable)                              |

### 2.4 Reports & Analytics

- Overall class average score
- Question-wise difficulty (easy/medium/hard based on % correct)
- Top 5 performing students
- Export as CSV / PDF
- Student detailed report (click on name → see each answer)

---

## 3. STUDENT SIDE — Simple & Focused

### 3.1 Student Lobby (After Login)

| Element           | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| Header            | "Hello, [Student Name]", class name, logout                      |
| Join Quiz Box     | Big input field: "Enter 6-digit Quiz Code" + green "Join" button |
| Upcoming Quizzes  | List of quizzes assigned by teacher (title, date, duration)      |
| Completed Quizzes | Past attempts with scores and review link                        |

### 3.2 Taking a Quiz (Full-screen focus mode)

**Before start:**

- Instructions card: number of questions, time limit, points
- "Start Quiz" button — big, green

**During quiz:**

- Top bar: Question counter (Q3/10), timer (if set), points earned so far
- Main card: Question text + options (radio buttons for MCQ)
- Navigation: Previous, Next, Submit Quiz buttons
- Question palette (sidebar or bottom strip): shows all question numbers; answered ones are highlighted
- Auto-save on each answer

**After submission:**

- Score screen: Points earned / total points, percentage
- If teacher allows: Show correct answers with explanations
- "Back to Lobby" button
- Option to retry (if allowed)

---

## 4. GLOBAL DESIGN SYSTEM (Visual Consistency)

### Color Palette

| Role / Element    | Color          | Hex     |
| ----------------- | -------------- | ------- |
| Primary (Teacher) | Deep Indigo    | #3B3F9C |
| Primary (Student) | Vibrant Teal   | #0F7B6E |
| Success           | Green          | #10B981 |
| Warning           | Amber          | #F59E0B |
| Danger            | Red            | #EF4444 |
| Background        | Soft Gray-Blue | #F8FAFC |
| Cards             | White          | #FFFFFF |
| Text Dark         | Slate Gray     | #1E293B |

### Typography

| Element          | Font Weight | Size    |
| ---------------- | ----------- | ------- |
| App title        | Bold        | 28px    |
| Section headings | Semi-bold   | 20px    |
| Body text        | Regular     | 16px    |
| Small metadata   | Regular     | 13px    |
| Buttons          | Medium      | 14–16px |

### Spacing Rhythm

- 8px base unit
- Card padding: 24px
- Between elements: 12–16px
- Button height: 48px (touch-friendly)

### Icons

Use outline style (Feather or Lucide):

- 👤 User, 🔒 Lock, 📋 Quiz, 📊 Chart, ⏱️ Timer, ✏️ Edit, 🗑️ Trash, 📎 Copy, 🚪 Logout

### Mobile & Tablet Adaptations

- Stack columns on mobile
- Touch targets minimum 44x44px
- Question palette becomes horizontal scroll on small screens
- Bottom sheet for answer options

---

## 5. USER EXPERIENCE (UX) PRINCIPLES

### For Teachers

- **One-click publish** — after creating quiz, one button makes it live
- **Bulk import** — upload questions via CSV or copy-paste from Word
- **Duplicate quiz** — reuse last week's quiz with new date
- **Live notifications** — when student submits, teacher sees real-time (optional sound)

### For Students

- **Zero distraction** — no ads, no unrelated content during quiz
- **Auto-resume** — if browser closes, student can re-enter with same code and continue where left off (if time remains)
- **Clear feedback** — green check for correct, red X for wrong after submission
- **Keyboard shortcuts** — press Enter to submit, number keys 1-4 to select options

### Both Roles

- **Dark mode** toggle (optional but nice)
- **Offline warning** — if connection lost, show banner "Reconnecting..."
- **Session timeout** — after 30 min inactivity, logout for security

---

## 6. PAGE LAYOUTS (Wireframe style)

### Authentication Screen

```
┌─────────────────────────────────────────────┐
│                  🧠 QuizMaster               │
│                                             │
│  ┌─────────────┐    ┌─────────────┐        │
│  │ 👩‍🏫 Teacher │    │ 👩‍🎓 Student │        │
│  └─────────────┘    └─────────────┘        │
│                                             │
│  [ Email ]                                  │
│  [ Password ]                               │
│  [ Login ]                                  │
│                                             │
│  Don't have account? Register              │
└─────────────────────────────────────────────┘
```

### Teacher Dashboard

```
┌─ Header: Welcome back, Ms. Johnson ─ Logout ─┐
│                                               │
│ [ + New Quiz ]  [ Reports ]  [ Manage Class ] │
│                                               │
│ ─── Active Quizzes ───                        │
│ ┌─────────────────────────────────────┐      │
│ │ 📘 Science Quiz  │ Code: X7G2P │ Live│      │
│ │ 12 students      │ [Results] [Stop]│      │
│ └─────────────────────────────────────┘      │
│ ┌─────────────────────────────────────┐      │
│ │ 📗 Math Revision │ Code: Q4R9M │Paused│      │
│ └─────────────────────────────────────┘      │
└───────────────────────────────────────────────┘
```

### Student Quiz Screen

```
┌─ Q3/10 │ ⏱️ 04:32 left │ 🏆 15 points ──────┐
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ What is the capital of France?     │     │
│  │                                    │     │
│  │ ○ Berlin                           │     │
│  │ ○ Madrid                           │     │
│  │ ○ Paris                            │     │
│  │ ○ Lisbon                           │     │
│  └────────────────────────────────────┘     │
│                                              │
│  [ Previous ]      [ Next ]    [ Submit ]   │
│                                              │
│  Questions: 1 2 3● 4 5 6 7 8 9 10           │
└──────────────────────────────────────────────┘
```

---

## 7. TEACHER-STUDENT INTERACTION FLOW

1. **Teacher** logs in → creates quiz → publishes → gets **6-digit code**
2. **Teacher** shares code with students (via screen, email, or WhatsApp)
3. **Student** logs in → enters code → joins lobby → waits for teacher to start
4. **Teacher** clicks "Start Quiz" on monitor → all students see Q1 simultaneously
5. **Student** answers all questions → submits
6. **Teacher** sees results live → ends quiz → grades (if manual) or auto-graded
7. **Student** sees score → can review answers (if enabled)
8. **Teacher** downloads report → exports grades

---

## 8. KEY FEATURES SUMMARY (Checklist)

| Auth                   | Teacher                          | Student                   |
| ---------------------- | -------------------------------- | ------------------------- |
| ✅ Role-based login    | ✅ Create/edit quizzes           | ✅ Join with code         |
| ✅ Secure registration | ✅ Live monitoring               | ✅ Timer & auto-submit    |
| ✅ Password reset      | ✅ Auto-grading (MCQ)            | ✅ Question palette       |
| ✅ Session management  | ✅ Manual grading (short answer) | ✅ Review answers         |
|                        | ✅ CSV export results            | ✅ View past scores       |
|                        | ✅ Question bank                 | ✅ Leaderboard (optional) |

---

## 9. DELIVERABLES FOR YOU (as design file)

To implement this, create:

1. **Figma / Sketch / Penpot file** with:
   - 3 auth screens
   - 5 teacher screens (dashboard, create quiz, live monitor, reports, class mgmt)
   - 4 student screens (lobby, quiz active, results, history)

2. **Component library** (buttons, cards, inputs, modals, toast notifications)

3. **User flow diagram** connecting all screens

4. **Style guide** (colors, fonts, spacing, icons)

---

This design ensures **teachers have full control** and **students stay focused**. Authentication blocks wrong access, and every interaction is optimized for quiz purposes only.

Let me know if you want me to refine any specific screen or add more micro-interactions!
