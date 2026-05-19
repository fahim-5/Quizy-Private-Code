import Question from "../models/Question.js";

const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

const getQuestionsForQuiz = async (req, res, next) => {
  try {
    // Teachers (authenticated) should receive correctIndex so they can set/verify answers.
    const query = Question.find({ quiz: req.params.quizId });
    if (!(req.user && req.user.role === "teacher")) {
      query.select("-correctIndex");
    }
    const questions = await query;
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const query = Question.findById(req.params.id);
    if (!(req.user && req.user.role === "teacher")) {
      query.select("-correctIndex");
    }
    const question = await query;
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const updates = req.body;
    const question = await Question.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });

    // If requester is not teacher, strip correctIndex in response
    const out = question.toObject();
    if (!(req.user && req.user.role === "teacher")) {
      delete out.correctIndex;
    }

    res.json({ success: true, question: out });
  } catch (err) {
    next(err);
  }
};

export default {
  createQuestion,
  getQuestionsForQuiz,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
