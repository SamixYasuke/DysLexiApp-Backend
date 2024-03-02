import express from "express";

import { User, Level, Unit } from "../Schemas/game.data.model.js";
import { verifyJwtToken } from "../utilities/authToken.js";

const router = express.Router();

router.post(
  "/units/:unitNumber/levels/:levelNumber/complete",
  verifyJwtToken,
  async (req, res) => {
    const { unitNumber, levelNumber } = req.params;
    const { starsEarned } = req.body;
    const userId = req.userId;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const unit = await Unit.findOne({ unitNumber });
      const unitId = unit._id;
      const level = await Level.findOne({
        levelNumber: parseInt(levelNumber),
        unit: unitId,
      });

      if (!level) {
        return res.status(404).json({ error: "Level not found" });
      }

      let levelProgress = user.levelProgress.find((progress) =>
        progress.level.equals(level._id)
      );

      if (!levelProgress) {
        levelProgress = {
          level: level._id,
          starsEarned: starsEarned,
          locked: false, // Set locked to false when a new level progress is created
        };
        user.levelProgress.push(levelProgress);
      }

      levelProgress.starsEarned = starsEarned;

      if (starsEarned >= 2) {
        const nextLevelNumber = parseInt(levelNumber) + 1;
        const nextLevel = await Level.findOne({
          levelNumber: nextLevelNumber,
          unit: unitId,
        });

        if (nextLevel) {
          // Add next level to user's levelProgress if not already there
          const hasNextLevelProgress = user.levelProgress.some((progress) =>
            progress.level.equals(nextLevel._id)
          );

          if (!hasNextLevelProgress) {
            user.levelProgress.push({
              level: nextLevel._id,
              starsEarned: 0,
              locked: false,
            });
          }
        }
      }

      await user.save();
      res.status(200).json({ message: "Level completed successfully" });
    } catch (error) {
      console.error("Error completing level:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/units/:unitNumber/levels", verifyJwtToken, async (req, res) => {
  const { unitNumber } = req.params;
  const userId = req.userId;

  try {
    // Find the unit by unitNumber
    const unit = await Unit.findOne({ unitNumber });
    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    // Retrieve all levels of the unit
    const levels = await Level.find({ unit: unit._id });

    // Find the user and populate their levelProgress
    const user = await User.findById(userId).populate("levelProgress.level");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a map to store progress information by level number
    const progressMap = new Map();
    user.levelProgress.forEach((progress) => {
      if (progress.level.unit.toString() === unit._id.toString()) {
        progressMap.set(progress.level.levelNumber, {
          locked: progress.locked,
          starsEarned: progress.starsEarned,
        });
      }
    });

    // Prepare the response with progress information for each level
    const levelsWithProgress = levels.map((level, index) => {
      const progressInfo = progressMap.get(level.levelNumber) || {
        locked: index !== 0, // Set locked to false for level one, true for others
        starsEarned: 0,
      };
      return {
        levelNumber: level.levelNumber,
        locked: progressInfo.locked,
        starsEarned: progressInfo.starsEarned,
      };
    });

    res.status(200).json(levelsWithProgress);
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/units/:unitNumber/levels", verifyJwtToken, async (req, res) => {
//   const { unitNumber } = req.params;
//   const userId = req.userId;

//   try {
//     // Find the unit by unitNumber
//     const unit = await Unit.findOne({ unitNumber });
//     if (!unit) {
//       return res.status(404).json({ error: "Unit not found" });
//     }

//     // Retrieve all levels of the unit
//     const levels = await Level.find({ unit: unit._id });

//     // Find the user and populate their levelProgress
//     const user = await User.findById(userId).populate("levelProgress.level");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Create a map to store progress information by level number
//     const progressMap = new Map();
//     user.levelProgress.forEach((progress) => {
//       if (progress.level.unit.toString() === unit._id.toString()) {
//         progressMap.set(progress.level.levelNumber, {
//           locked: progress.locked,
//           starsEarned: progress.starsEarned,
//         });
//       }
//     });

//     // Prepare the response with progress information for each level
//     const levelsWithProgress = levels.map((level) => {
//       const progressInfo = progressMap.get(level.levelNumber) || {
//         locked: true,
//         starsEarned: 0,
//       };
//       return {
//         levelNumber: level.levelNumber,
//         locked: progressInfo.locked,
//         starsEarned: progressInfo.starsEarned,
//       };
//     });

//     res.status(200).json(levelsWithProgress);
//   } catch (error) {
//     console.error("Error fetching levels:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

export default router;
