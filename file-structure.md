online-quiz-system/
│
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── assets/                # CSS, images
│   │   │   ├── styles/
│   │   │   └── images/
│   │   │
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuizCard.jsx
│   │   │   └── Timer.jsx
│   │   │
│   │   ├── pages/                 # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TakeQuiz.jsx
│   │   │   ├── Result.jsx
│   │   │   └── AdminPanel.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── services/              # API calls (Axios/Fetch)
│   │   │   └── api.js
│   │   │
│   │   ├── context/               # Global state (Auth)
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/                 # Custom hooks
│   │   │   └── useAuth.js
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/                        # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   │
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── questionController.js
│   │   └── resultController.js
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   ├── Question.js
│   │   └── Result.js
│   │
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── questionRoutes.js
│   │   └── resultRoutes.js
│   │
│   ├── middleware/               # Auth & validation
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── utils/
│   │   └── generateToken.js      # JWT
│   │
│   ├── app.js                    # Express app config
│   ├── server.js                 # Entry point
│   │
│   └── package.json
│
├── .env                          # Environment variables
├── .gitignore
└── README.md