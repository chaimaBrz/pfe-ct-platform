const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const visionRoutes = require("./src/routes/vision.routes");
const protocolRoutes = require("./src/routes/protocol.routes");
const studyRoutes = require("./src/routes/study.routes");
const sessionRoutes = require("./src/routes/session.routes");
const imageRoutes = require("./src/routes/image.routes");
const pairwiseRoutes = require("./src/routes/pairwise.routes");
const publicRoutes = require("./src/routes/public.routes");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ static
app.use("/demo", express.static(path.join(__dirname, "demo")));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/vision", visionRoutes);
app.use("/protocols", protocolRoutes);
app.use("/studies", studyRoutes);
app.use("/sessions", sessionRoutes);
app.use("/images", imageRoutes);
app.use("/pairwise", pairwiseRoutes);
app.use("/public", publicRoutes);

module.exports = app;
