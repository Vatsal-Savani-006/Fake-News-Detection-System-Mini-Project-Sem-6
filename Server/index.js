const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const Analysis = require("./model/All_AnalysisSchem");
const User = require("./model/User");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middelware/auth");
const { login } = require("./controller/validation");

const { connecttomongodb } = require("./connect");

const app = express();
app.use(express.json());


app.use(cookieParser());


app.use(cors({
  origin: function (origin, callback) {
    // Allow all localhost origins during development
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type"]
}));

// Connect to MongoDB
let dbConnected = false;
connecttomongodb("mongodb://localhost:27017/fake-news-detection")
  .then(() => {
    dbConnected = true;
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    dbConnected = false;
  });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    server: "running",
    database: dbConnected ? "connected" : "disconnected"
  });
});

app.post("/predict", authMiddleware, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: "Database not connected" });
    }
   
    const userFromDB = await User.findOne({ email: req.user.email });
    if (!userFromDB) {
      return res.status(401).json({ error: "User not found" });
    }
    
    const userId = userFromDB._id; 
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const newsText = req.body.news;

    if (!newsText) {
      return res.status(400).json({ error: "News text is required" });
    }

    let mlResponse;
    try {
      mlResponse = await axios.post(
        "http://localhost:5000/predict",
        { news: newsText },
        { timeout: 5000 }
      );
    } catch (mlError) {
      console.error("ML Server Error:", mlError.message);
      return res.status(503).json({
        error: "ML server unavailable",
        details: "The prediction service is not responding. Make sure the ML server is running on port 5000."
      });
    }

    if (!mlResponse.data) {
      return res.status(500).json({
        error: "Empty response from ML server",
      });
    }

    const { prediction, probability } = mlResponse.data;

    if (prediction === undefined || probability === undefined) {
      return res.status(500).json({
        error: "Invalid ML response format",
        raw: mlResponse.data,
      });
    }

    const analysis = new Analysis({
      userId,
      newsText,
      prediction: prediction === "true" ? "Real" : "Fake",
      confidence: probability,
    });

    await analysis.save();

    // ✅ ALWAYS RETURN JSON
    return res.json({
      prediction: analysis.prediction,
      confidence: analysis.confidence,
    });

  } catch (err) {
    console.error("❌ Predict error:", err);

    // ✅ ALWAYS RETURN JSON EVEN ON ERROR
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message,
    });
  }
});

app.get("/my-analysis", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const userFromDB = await User.findOne({ email: userEmail });
    if (!userFromDB) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userId = userFromDB._id;

    const analyses = await Analysis.find({ userId })
      .sort({ analyzedAt: -1 });

    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();

  res.json({ message: "Signup successful" });
});

app.post("/login", login);

app.post("/logout", (req, res) => {
  // Clear the session cookie
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

app.listen(3001, () => {
  console.log("🚀 Node running on http://localhost:3001");
});
