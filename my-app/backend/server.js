// backend/server.js
const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

async function getOrCreateUserFromToken(auth) {
  const payload = auth.payload;
  const email = payload.email;
  const name = payload.name;
  const auth0Id = payload.sub;

  if (!email) {
    throw new Error("Tokenul de Auth0 nu conține email.");
  }

  // 1. Căutăm user după email
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Dacă nu există -> creăm
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        auth0Id,
      },
    });
    return user;
  }

  // 3. Dacă există -> sincronizăm ce vine din Auth0
  const updates = {};

  if (!user.auth0Id && auth0Id) updates.auth0Id = auth0Id;
  if (name && name !== user.name) updates.name = name;

  if (Object.keys(updates).length > 0) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
  }

  return user;
}

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

app.get("/api/me", checkJwt, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req.auth);
    res.json(user);
  } catch (err) {
    console.error("GET /api/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/me", checkJwt, async (req, res) => {
  try {
    const baseUser = await getOrCreateUserFromToken(req.auth);

    const { username, role, country, domain, languages } = req.body;

    const dataToUpdate = {
      username: username ?? baseUser.username,
      role: role ?? baseUser.role,
      country: country ?? baseUser.country,
      languages: languages ?? baseUser.languages,
      domain:
        role === "ARTIST"
          ? domain ?? baseUser.domain
          : role === "BUYER"
          ? null
          : baseUser.domain,
    };

    const updatedUser = await prisma.user.update({
      where: { id: baseUser.id },
      data: dataToUpdate,
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("PUT /api/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
