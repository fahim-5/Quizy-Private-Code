# 📘 Online Quiz Platform (CSE 4165 Project - MERN Stack)

## 📌 Project Overview

This project is an **Online Quiz Platform** developed for the **CSE 4165 course**, now implemented using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

The system enables:

- **Teachers** to create and manage quizzes
- **Students** to participate in quizzes with time constraints and view results

The architecture follows a **modern API-driven full-stack model**, ensuring scalability and clean separation of concerns.

---

## 🎯 Tech Stack

### 🖥️ Frontend

- HTML, CSS, JavaScript (via React.js)
- Component-based UI architecture
- Client-side validation

### ⚙️ Backend

- Node.js + Express.js
- RESTful API design
- JWT-based authentication

### 🗄️ Database

- MongoDB (NoSQL)
- Mongoose ODM for schema modeling

---

## 🏗️ Project Requirements (As Provided by Instructor)

This project satisfies all required constraints:

- Frontend using **HTML, CSS, JavaScript**
- Backend implemented with **server-side logic (Node.js replacing PHP)**
- Database using **MongoDB (alternative to MySQL)**
- Proper **UI design and validation**
- Full **CRUD operations** implemented via API

---

## 📂 Project Structure

```id="mernreadme1"
online-quiz-system/
│
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/                        # Backend (Node + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── app.js
│   └── server.js
│
├── .env
└── README.md
```

---

## 🔥 Core Features

### 👨‍💼 Teacher Panel

- Create, update, delete quizzes
- Manage question bank
- Monitor student performance

### 👨‍🎓 Student Panel

- Attempt quizzes with timer
- View scores and history
- Participate in leaderboard

### ⚙️ System Capabilities

- Automatic scoring system
- Real-time timer handling
- REST API-based communication
- Secure authentication

---

## 🔄 CRUD Operations Coverage

| Resource  | CRUD Support |
| --------- | ------------ |
| Users     | Create, Read |
| Quizzes   | Full CRUD    |
| Questions | Full CRUD    |
| Results   | Create, Read |

---

## ⚙️ Installation & Setup Instructions

### 1️⃣ Clone Repository

```bash id="mernreadme2"
git clone https://github.com/your-repo/online-quiz-system.git
cd online-quiz-system
```

---

### 2️⃣ Setup Backend (Server)

```bash id="mernreadme3"
cd backend
npm install
```

Create `.env` file in the `backend` folder (or project root):

```env id="mernreadme4"
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run server from the `backend` folder:

```bash id="mernreadme5"
cd backend
npm run dev
```

---

### 3️⃣ Setup Frontend (Client)

```bash id="mernreadme6"
cd frontend
npm install
npm run dev
```

Access app (Vite default):

```id="mernreadme7"
http://localhost:5173
```

---

## 🔐 Authentication Flow

- User registers via API
- Password hashed using `bcrypt`
- JWT token generated on login
- Protected routes via middleware

---

## 📊 Pros & Limitations

### ✅ Strengths

- Modern scalable architecture
- Clean frontend/backend separation
- API-first design
- Industry-relevant tech stack

### ❌ Limitations

- Higher complexity than PHP
- Requires proper API design discipline
- MongoDB schema design must be handled carefully

---

## 🚀 Future Enhancements

- Real-time quiz using WebSockets
- AI-based question generation
- Analytics dashboard
- Mobile app integration

---

## 🧠 Strategic Insight

This implementation transforms a simple academic project into a **production-grade system blueprint**.

- প্রস্তুত SaaS model-এ scale করার জন্য
- Microservices architecture-এ migrate করা possible
- EdTech platform হিসেবে evolve করার capability আছে

---

## 👨‍💻 Author

CSE Student
Focus: Full Stack Engineering, Scalable Systems, Product-Oriented Development

---
