import express from "express";
import bcrypt from "bcrypt";
import { User } from "../Schemas/game.data.model.js";
import { generateAuthToken } from "../utilities/authToken.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { user_name, first_name, last_name, date_of_birth, age, password } =
    req.body;
  try {
    const userExists = await User.findOne({ user_name });

    if (userExists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      user_name,
      first_name,
      last_name,
      date_of_birth,
      age,
      password: hashedPassword,
    });

    await newUser.save();
    const authToken = generateAuthToken(newUser);
    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      authToken,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { user_name, password } = req.body;
  try {
    const user = await User.findOne({ user_name });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const authToken = generateAuthToken(user);
    // Return user object without the password
    return res
      .status(200)
      .json({
        authToken,
        user: {
          _id: user._id,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: user.date_of_birth,
          age: user.age,
        },
      });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while logging in user" });
  }
});

export default router;
