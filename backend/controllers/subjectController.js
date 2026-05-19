import Subject from "../models/Subject.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

const createSubject = async (req, res, next) => {
  try {
    const { name, code, enrollKey } = req.body;
    if (!name || !code || !enrollKey)
      return res
        .status(400)
        .json({ success: false, message: "name, code and enrollKey required" });

    // ensure code uniqueness
    const exists = await Subject.findOne({ code: String(code).trim() });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Subject code already exists" });

    const payload = {
      name: String(name).trim(),
      code: String(code).trim(),
      enrollKey: String(enrollKey).trim(),
      createdBy: req.user ? req.user._id : undefined,
    };

    const subject = await Subject.create(payload);
    res.status(201).json({ success: true, subject });
  } catch (err) {
    next(err);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === "string" && req.query.search.trim()
        ? String(req.query.search).trim()
        : null;
    const mine = req.query.mine === "true" || req.query.mine === "1";
    const teacherId = req.query.teacherId || null;
    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&"),
        "i",
      );
      // also allow searching by teacher name
      const userDocs = await User.find({ name: { $regex: regex } }).select(
        "_id",
      );
      const userIds = userDocs.map((u) => u._id);
      const subjects = await Subject.find({
        $or: [
          { code: { $regex: regex } },
          { name: { $regex: regex } },
          { createdBy: { $in: userIds } },
        ],
      })
        .limit(200)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name identifier");
      return res.json({ success: true, subjects });
    }

    // If requesting only the current teacher's subjects and an authenticated
    // user is present, filter by createdBy. Or, if a teacherId query param
    // is provided, filter by that id. Otherwise return all subjects.
    const query = {};
    if (teacherId) {
      // return subjects either created by the teacher or where the teacher
      // appears in common enrollment/member arrays
      query.$or = [
        { createdBy: teacherId },
        { participants: teacherId },
        { students: teacherId },
        { enrolled: teacherId },
        { enrolledUsers: teacherId },
        { members: teacherId },
        { users: teacherId },
      ];
    } else if (mine && req.user && req.user.role === "teacher") {
      query.createdBy = req.user._id;
    }

    const subjects = await Subject.find(query)
      .limit(200)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name identifier");
    res.json({ success: true, subjects });
  } catch (err) {
    next(err);
  }
};

const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      "createdBy",
      "name identifier",
    );
    if (!subject)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, subject });
  } catch (err) {
    next(err);
  }
};

export default { createSubject, getSubjects, getSubject };
