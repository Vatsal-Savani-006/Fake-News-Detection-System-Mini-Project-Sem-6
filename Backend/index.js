const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const Analysis = require("./model/All_AnalysisSchem");
const User = require("./model/User");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middelware/auth");
const { login } = require("./controller/validation");
const { deleteUser } = require("./services/auth");

const { connecttomongodb } = require("./connect");

const app = express();
app.use(express.json());


app.use(cookieParser());


app.use(cors({
  origin: "*", // for testing (later restrict)
  credentials: true
}));

// Connect to MongoDB
let dbConnected = false;
connecttomongodb("mongodb://localhost:27017/fake-news-detection")
  .then(() => {
    dbConnected = true;
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error(" MongoDB connection error:", err.message);
    dbConnected = false;
  });

// Health check endpoint


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
      prediction: prediction === "true" ? "REAL" : "FAKE",
      confidence: probability,
    });

    await analysis.save();

    
    return res.json({
      prediction: analysis.prediction,
      confidence: analysis.confidence,
    });

  } catch (err) {
    console.error("❌ Predict error:", err);

    
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
 
  if(req.cookies.sessionId){
    const sessionId = req.cookies.sessionId;
    deleteUser(sessionId);
  }
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});


app.get('/api/analysis/statistics', authMiddleware, async (req, res) => {
  try {
    const userFromDB = await User.findOne({ email: req.user.email });
    if (!userFromDB) {
      return res.status(401).json({ error: "User not found" });
    }
    const userId = userFromDB._id;
    const analyses = await Analysis.find({ userId });

    const statistics = {
      totalAnalyses: analyses.length,
      fakeNewsDetected: analyses.filter((a) => a.prediction === 'FAKE').length,
      realNews: analyses.filter((a) => a.prediction === 'REAL').length,
      uncertain: analyses.filter((a) => a.prediction === 'UNCERTAIN').length,
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get recent analyses (latest 10)
app.get('/api/analysis/recent', authMiddleware, async (req, res) => {
  try {
    const userFromDB = await User.findOne({ email: req.user.email });
    if (!userFromDB) {
      return res.status(401).json({ error: "User not found" });
    }
    const userId = userFromDB._id;
    const analyses = await Analysis.find({ userId })
      .sort({ analyzedAt: -1 })
      .limit(10);

    const mappedAnalyses = analyses.map(a => ({
      _id: a._id,
      title: a.newsText.substring(0, 50) + '...', // assuming title is newsText truncated
      result: a.prediction,
      confidence: a.confidence,
      analyzedAt: a.analyzedAt,
    }));

    res.json(mappedAnalyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent analyses' });
  }
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get all analyses for user
app.get(
  '/api/analysis/all',
  authMiddleware,
  async (req, res) => {
    try {
      const analyses = await Analysis.find({ userId: req.user.id })
        .sort({ analyzedAt: -1 })
        .limit(50);

      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analyses' });
    }
  }
);


app.listen(3001, () => {
  console.log(" Node running on http://localhost:3001");
});
