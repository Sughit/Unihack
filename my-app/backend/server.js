// backend/server.js
const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test simplu
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend + Prisma merg ✅" });
});

// --- MESAJE CHAT ---
// ia mesaje pentru un chat (ex: /api/messages?chatName=RAPPERUL%23tău)
app.get("/api/messages", async (req, res) => {
  const { chatName } = req.query;

  try {
    const where = chatName ? { chatName } : {};

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    console.error("GET /api/messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// adaugă un mesaj nou
app.post("/api/messages", async (req, res) => {
  const { chatName, text } = req.body;

  if (!chatName || !text || !text.trim()) {
    return res
      .status(400)
      .json({ error: "chatName și text sunt obligatorii" });
  }

  try {
    const msg = await prisma.message.create({
      data: { chatName, text: text.trim() },
    });
    res.json(msg);
  } catch (err) {
    console.error("POST /api/messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// (OPȚIONAL) dacă ai model User în schema.prisma și vrei să-l testezi
// app.get("/api/users", async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.json(users);
///   } catch (err) {
//     console.error("GET /api/users error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
