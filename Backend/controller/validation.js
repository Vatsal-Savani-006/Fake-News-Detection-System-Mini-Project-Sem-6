const User = require("../model/User");
const bcrypt = require("bcrypt");
const { setUser } = require("../services/auth");
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //create session
    const sessionId = uuidv4();
    setUser(sessionId, { email: user.email, id: user._id.toString() });

    //SET COOKIE 
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,     
      sameSite: "lax",
    });

    //send response 
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
