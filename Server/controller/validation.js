const User = require("../model/User");
const bcrypt = require("bcrypt");
const { setUser } = require("../services/auth");
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2️⃣ check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3️⃣ create session
    const sessionId = uuidv4();
    setUser(sessionId, { email });

    // 4️⃣ SET COOKIE (THIS IS THE IMPORTANT LINE)
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,      // true only on HTTPS
      sameSite: "lax",
    });

    // 5️⃣ send response (REQUIRED)
    return res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};
