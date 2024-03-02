import express from "express";

import { Unit, Level } from "../Schemas/game.data.model.js";

const router = express.Router();

router.post("/units", async (req, res) => {
  const { unitNumber } = req.body;
  try {
    const unit = new Unit({ unitNumber });
    await unit.save();

    res.status(201).json({ message: "Unit created successfully", unit });
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/units/:unitNumber/levels", async (req, res) => {
  const { unitNumber } = req.params;
  const { levelNumber } = req.body;
  try {
    const unit = await Unit.findOne({ unitNumber });
    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    const level = new Level({ levelNumber, unit: unit._id });
    await level.save();

    unit.levels.push(level);
    await unit.save();

    res.status(201).json({ message: "Level created successfully", level });
  } catch (error) {
    console.error("Error creating level:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
