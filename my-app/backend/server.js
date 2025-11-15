// backend/server.js
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const { GoogleGenAI } = require("@google/genai");
const prisma = require("./prismaClient");
require("dotenv").config();

// pentru debug env Gemini
console.log(
  "ENV GEMINI_API_KEY prefix:",
  process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 10) : "MISSING"
);
console.log("ENV GEMINI_MODEL:", process.env.GEMINI_MODEL);

const app = express();
const PORT = process.env.PORT || 4000;

// =========== MIDDLEWARE ===========
app.use(cors());
app.use(express.json());

// 🔐 Middleware Auth0 – verifică token-ul trimis de frontend
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// 🔧 Helper: creează sau găsește user-ul în DB pe baza token-ului Auth0
async function getOrCreateUserFromToken(authData) {
  if (!authData) {
    throw new Error("req.auth este undefined – checkJwt nu a rulat.");
  }

  const payload = authData.payload;
  const auth0Id = payload.sub;          // ex: "auth0|abc123"
  const email = payload.email || null;  // poate lipsi din token
  const name = payload.name || null;

  if (!auth0Id) {
    throw new Error("Tokenul de Auth0 nu conține sub (auth0Id).");
  }

  // Un singur query: dacă există -> update, dacă nu -> create
  const user = await prisma.user.upsert({
    where: { auth0Id },          // caută după auth0Id (UNIQUE)
    create: {
      auth0Id,
      email,
      name,
    },
    update: {
      email,
      name,
    },
  });

  return user;
}

// =========== GEMINI SETUP ==========
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_ID = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// =========== HEALTHCHECK ===========
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend + Prisma + Auth0 + Gemini server ✅",
  });
});

// =========== GEMINI CHAT ===========
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message este obligatoriu" });
    }

    console.log(">>> /api/chat message:", message);

    // apel către Gemini cu noul SDK
    const geminiResponse = await ai.models.generateContent({
      model: MODEL_ID,
      contents: message,
    });

    const text = geminiResponse.text;

    console.log(">>> gemini text:", text);

    res.json({ reply: text });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    res.status(500).json({
      error: "Gemini request failed",
      details: String(err.message || err),
    });
  }
});

// =========== PRISMA MESSAGES ===========
// ia mesaje pentru un chat (ex: /api/messages?chatName=RAPPERUL%23TAU)
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

// 🔹 Returnează user-ul curent (și îl creează dacă nu există)
app.get("/api/me", checkJwt, async (req, res) => {
  try {
    console.log("Hit /api/me, auth payload:", req.auth?.payload);
    const user = await getOrCreateUserFromToken(req.auth);
    res.json(user);
  } catch (err) {
    console.error("GET /api/me:", err);
    res.status(500).json({
      error: err.message,
      code: err.code || null,
    });
  }
});

// 🔹 Update atribute user (username, role, country, domain, languages)
app.put("/api/me", checkJwt, async (req, res) => {
  try {
    const baseUser = await getOrCreateUserFromToken(req.auth);

    const {
      username,
      role,
      country,
      domain,
      languages,
      email,
      name,
    } = req.body;

    const updates = {};

    if (username !== undefined) updates.username = username;
    if (role !== undefined) {
      updates.role = role;
      if (role === "ARTIST") {
        if (domain !== undefined) updates.domain = domain;
      } else if (role === "BUYER") {
        updates.domain = null;
      }
    }
    if (country !== undefined) updates.country = country;
    if (languages !== undefined) updates.languages = languages;
    if (email !== undefined) updates.email = email;
    if (name !== undefined) updates.name = name;

    const updatedUser = await prisma.user.update({
      where: { id: baseUser.id },
      data: updates,
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("PUT /api/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Using Gemini model: ${MODEL_ID}`);
});
