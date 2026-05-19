(async () => {
  const base = "http://localhost:5002/api";
  const fetch = global.fetch;

  function log(title, obj) {
    console.log("\n=== " + title + " ===");
    console.log(JSON.stringify(obj, null, 2));
  }

  // Teacher login
  let res = await fetch(base + "/auth/login", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "admin01", password: "adminpass" }),
  });
  const teacherLogin = await res.json();
  log("teacherLogin", teacherLogin);
  const teacherToken = teacherLogin.token;
  // verify token by calling /me
  res = await fetch(base + "/auth/me", {
    method: "get",
    headers: { Authorization: "Bearer " + teacherToken },
  });
  const me = await res.json();
  log("teacherMe", me);

  // Create short quiz (2s)
  res = await fetch(base + "/quizzes", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + teacherToken,
    },
    body: JSON.stringify({
      title: "Short Quiz",
      description: "2s quiz",
      timeLimit: 2,
      rules: "",
    }),
  });
  const shortQuiz = await res.json();
  log("created shortQuiz", shortQuiz);
  const shortQuizId = shortQuiz.quiz._id || shortQuiz._id;

  // Create normal quiz (60s)
  res = await fetch(base + "/quizzes", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + teacherToken,
    },
    body: JSON.stringify({
      title: "Normal Quiz",
      description: "60s quiz",
      timeLimit: 60,
      rules: "",
    }),
  });
  const normalQuiz = await res.json();
  log("created normalQuiz", normalQuiz);
  const normalQuizId = normalQuiz.quiz._id || normalQuiz._id;

  // Add one question to each quiz
  res = await fetch(base + "/questions", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + teacherToken,
    },
    body: JSON.stringify({
      quiz: shortQuizId,
      text: "1+1=?",
      options: [{ text: "1" }, { text: "2" }, { text: "3" }],
      correctIndex: 1,
    }),
  });
  const qShort = await res.json();
  log("qShort", qShort);

  res = await fetch(base + "/questions", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + adminToken,
    },
    body: JSON.stringify({
      quiz: normalQuizId,
      text: "2+2=?",
      options: [{ text: "2" }, { text: "3" }, { text: "4" }],
      correctIndex: 2,
    }),
  });
  const qNormal = await res.json();
  log("qNormal", qNormal);

  // Student login
  res = await fetch(base + "/auth/login", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "student01", password: "studentpass" }),
  });
  const studentLogin = await res.json();
  log("studentLogin", studentLogin);
  const studentToken = studentLogin.token;

  // Test 1: short quiz (expect time exceeded)
  res = await fetch(base + "/results/start", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + studentToken,
    },
    body: JSON.stringify({ quiz: shortQuizId }),
  });
  const startShort = await res.json();
  log("startShort", startShort);
  const resultIdShort = startShort.result._id || startShort._id;

  // wait 3 seconds (exceed 2s limit)
  await new Promise((r) => setTimeout(r, 3000));

  // submit
  res = await fetch(base + "/results", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + studentToken,
    },
    body: JSON.stringify({
      quiz: shortQuizId,
      answers: [
        { question: qShort.question._id || qShort._id, answerIndex: 1 },
      ],
      resultId: resultIdShort,
    }),
  });
  const submitShort = await res.json();
  log("submitShort", submitShort);

  // Test 2: normal quiz (submit immediately)
  res = await fetch(base + "/results/start", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + studentToken,
    },
    body: JSON.stringify({ quiz: normalQuizId }),
  });
  const startNormal = await res.json();
  log("startNormal", startNormal);
  const resultIdNormal = startNormal.result._id || startNormal._id;

  // submit immediately
  res = await fetch(base + "/results", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + studentToken,
    },
    body: JSON.stringify({
      quiz: normalQuizId,
      answers: [
        { question: qNormal.question._id || qNormal._id, answerIndex: 2 },
      ],
      resultId: resultIdNormal,
    }),
  });
  const submitNormal = await res.json();
  log("submitNormal", submitNormal);

  console.log("\nAll tests done");
})();
