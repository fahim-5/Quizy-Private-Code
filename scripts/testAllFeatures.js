(async () => {
  const base = "http://localhost:5002/api";
  const fetch = global.fetch;

  function log(title, obj) {
    console.log(`\n=== ${title} ===`);
    try {
      console.log(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.log(obj);
    }
  }

  try {
    // Teacher login
    let res = await fetch(base + "/auth/login", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "admin01", password: "adminpass" }),
    });
    const teacherLogin = await res.json();
    log("teacherLogin", teacherLogin);
    const adminToken = teacherLogin.token;

    // Auth protected check
    res = await fetch(base + "/auth/me", {
      method: "get",
      headers: { Authorization: "Bearer " + adminToken },
    });
    log("teacherMe", await res.json());

    // Create quiz
    res = await fetch(base + "/quizzes", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + adminToken,
      },
      body: JSON.stringify({
        title: "FeatureCheck Quiz",
        description: "For feature testing",
        timeLimit: 30,
      }),
    });
    const quizCreated = await res.json();
    log("quizCreated", quizCreated);
    const qid = quizCreated.quiz?._id || quizCreated._id;

    // Create question
    res = await fetch(base + "/questions", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + adminToken,
      },
      body: JSON.stringify({
        quiz: qid,
        text: "What is 3+2?",
        options: [{ text: "4" }, { text: "5" }, { text: "6" }],
        correctIndex: 1,
        points: 2,
      }),
    });
    const qCreate = await res.json();
    log("questionCreated", qCreate);
    const qid1 = qCreate.question?._id || qCreate._id;

    // Update question
    res = await fetch(base + `/questions/${qid1}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + adminToken,
      },
      body: JSON.stringify({ text: "What is 2+3?" }),
    });
    log("questionUpdated", await res.json());

    // Get questions for quiz (should not include correctIndex)
    res = await fetch(base + `/questions/quiz/${qid}`, {
      headers: { Authorization: "Bearer " + adminToken },
    });
    log("questionsForQuiz", await res.json());

    // Student login
    res = await fetch(base + "/auth/login", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "student01", password: "studentpass" }),
    });
    const studentLogin = await res.json();
    log("studentLogin", studentLogin);
    const studentToken = studentLogin.token;

    // Start result
    res = await fetch(base + "/results/start", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + studentToken,
      },
      body: JSON.stringify({ quiz: qid }),
    });
    const start = await res.json();
    log("startResult", start);
    const resultId = start.result?._id || start._id;

    // Submit result with correct answer
    res = await fetch(base + "/results", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + studentToken,
      },
      body: JSON.stringify({
        quiz: qid,
        answers: [{ question: qid1, answerIndex: 1 }],
        resultId,
      }),
    });
    const submit = await res.json();
    log("submitResult", submit);

    // Leaderboard (teacher)
    res = await fetch(base + `/results/teacher/leaderboard/${qid}`, {
      headers: { Authorization: "Bearer " + adminToken },
    });
    log("leaderboard", await res.json());

    // Participation summary
    res = await fetch(base + "/results/teacher/participation", {
      headers: { Authorization: "Bearer " + adminToken },
    });
    log("participation", await res.json());

    // Student result history and summary
    res = await fetch(base + "/results/me", {
      headers: { Authorization: "Bearer " + studentToken },
    });
    log("myResults", await res.json());
    res = await fetch(base + "/results/me/summary", {
      headers: { Authorization: "Bearer " + studentToken },
    });
    log("mySummary", await res.json());

    // Auth negative test: access protected without token
    res = await fetch(base + "/results/me");
    log("noAuthAccess", { status: res.status, body: await res.text() });

    // Delete question
    res = await fetch(base + `/questions/${qid1}`, {
      method: "delete",
      headers: { Authorization: "Bearer " + adminToken },
    });
    log("questionDeleted", await res.json());

    console.log("\nFeature checks completed");
  } catch (err) {
    console.error("Test script error", err);
  }
})();
