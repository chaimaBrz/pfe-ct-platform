const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

module.exports = app;
