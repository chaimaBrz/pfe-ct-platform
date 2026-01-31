require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const visionRoutes = require("./src/routes/vision.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/vision", visionRoutes);
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
