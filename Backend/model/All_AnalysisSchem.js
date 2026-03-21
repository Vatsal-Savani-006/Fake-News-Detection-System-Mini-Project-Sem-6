const mongoose = require("mongoose");


const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  newsText: {
    type: String,
    required: true,
  },

  prediction: {
    type: String,
    enum: ["Fake", "Real"],
    required: true,
  },

  confidence: {
    type: Number, // 0.00 – 1.00
    required: true,
  },

  analyzedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);
