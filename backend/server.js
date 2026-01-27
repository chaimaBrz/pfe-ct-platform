require("dotenv").config();
const app = require("./src/app");

const prisma = require("./src/db/prisma");

app.get("/health-db", async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ status: "ok", users: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
