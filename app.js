import express from "express";
import cors from "cors";

import connectDB from "./utilities/connectDB.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute)

connectDB(app);
