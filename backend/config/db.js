const mongoose = require("mongoose");

async function connectDB(uri) {
  // Priority: explicit `uri` arg -> MONGODB_URI -> MONGO_URI -> local default
  const mongoUri =
    uri ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/onlinequizplatfrom";
  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const dbName =
      (conn && conn.connection && conn.connection.name) || "unknown";
    console.log("MongoDB connected");
    console.log(`  Database: ${dbName}`);
    console.log(`  URI: ${mongoUri}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

module.exports = connectDB;
