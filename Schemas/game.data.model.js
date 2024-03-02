import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
  },
  starsEarned: {
    type: Number,
    default: 0,
  },
  locked: {
    type: Boolean,
    default: true,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
});

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true,
  },
  levels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
    },
  ],
});

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  levelProgress: [
    {
      level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Level",
      },
      starsEarned: {
        type: Number,
        default: 0,
      },
      locked: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

const { model } = mongoose;
const User = model("User", userSchema);
const Level = model("Level", levelSchema);
const Unit = model("Unit", unitSchema);

export { User, Level, Unit };
