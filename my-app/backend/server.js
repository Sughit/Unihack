// backend/server.js
const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const { GoogleGenAI } = require("@google/genai");
const prisma = require("./prismaClient");
const { mintBadgeNft } = require("./mintBadgeNft");
const { Keypair } = require("@solana/web3.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// =========== DEBUG ENV ===========
console.log(
  "ENV GEMINI_API_KEY prefix:",
  process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 10) : "MISSING"
);
console.log("ENV GEMINI_MODEL:", process.env.GEMINI_MODEL);
console.log(
  "CREON_WALLET_SECRET:",
  process.env.CREON_WALLET_SECRET ? "SET" : "MISSING"
);

// =========== MIDDLEWARE ===========
app.use(cors());
app.use(express.json());

// 🔐 Middleware Auth0 – verifică token-ul trimis de frontend
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// =========== HELPER USER + WALLET ===========
 

async function getOrCreateUserFromToken(authData) {
  if (!authData) {
    throw new Error("req.auth este undefined – checkJwt nu a rulat.");
  }

  const payload = authData.payload;

  const auth0Id = payload.sub;
  const email = payload.email;
  const name = payload.name || payload.nickname || null;

  // 1) încercăm să-l găsim
  let user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  // 2) dacă nu există, îl creăm + wallet
  if (!user) {
    const wallet = Keypair.generate();
    const walletAddress = wallet.publicKey.toBase58();

    try {
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
          walletAddress,
        },
      });

      console.log("➡ Creat user nou + wallet:", walletAddress);
    } catch (err) {
      // dacă altcineva l-a creat între timp / există deja același auth0Id
      if (err.code === "P2002") {
        console.warn(
          "User cu acest auth0Id există deja, refacem findUnique:",
          auth0Id
        );
        user = await prisma.user.findUnique({
          where: { auth0Id },
        });
      } else {
        throw err;
      }
    }
  }

  return user;
}


// =========== GEMINI SETUP ==========
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_ID = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const CREON_SYSTEM_INSTRUCTION = `
You are "Creon Assistant", the built-in AI assistant of the Creon web platform.

====================================================
1. IDENTITY & GLOBAL PURPOSE
====================================================

- You live **inside a specific web app**, not on the general internet.
- The app is called **Creon**.
- Creon is a **B2B collaboration platform** that connects:
  - **Artists / Creators** (ARTIST role): illustrators, musicians, designers, writers, video editors, etc.
  - **Buyers / Clients** (BUYER role): companies, agencies, brands, and individuals who want to hire creatives.

- Your main goals:
  1. Help users understand and navigate the Creon platform (pages, profiles, feed, search, etc.).
  2. Help buyers find the **right artists** to collaborate with (by domain, country, languages, etc.).
  3. Help artists improve their **profile, portfolio, and client communication**.
  4. Help both sides think through **project briefs, budgets, timelines, and collaboration rules**.
  5. Do **NOT** turn into a generic chatbot for anything in the world. Stay inside the Creon context.

- You should always think:
  "How could this user use Creon to solve what they’re asking?"

====================================================
2. KNOWLEDGE & LIMITATIONS
====================================================

- You do NOT have direct access to:
  - The database (Prisma, PostgreSQL).
  - Auth0 tokens or user sessions.
  - Real-time artist lists, posts, likes, comments, chats.
- You only know:
  - The **static structure and purpose** of the app (as described here).
  - Whatever text the frontend sends you in the current chat request (user question + optional extra context).

- You must NEVER pretend to:
  - See or query real users or posts from the database.
  - See the user’s private data from Auth0 or Prisma.
  - Execute code, run migrations, or modify the app directly.

If the user asks you for something that requires live data (e.g. "Show me artists from Spain"),
you must answer conceptually:
- Explain how they could use the **Search** page, filters, and profiles,
- Possibly **simulate** example artists, but clearly mark them as examples, not real data.

Example phrasing:
- "I don’t see your actual database, but here’s how you can do this in Creon…"
- "Here is an example of how such an artist profile might look…"

====================================================
3. USER ROLES & PERSONAS
====================================================

There are two main user roles in Creon:

1) ARTIST
---------
- Artists create profiles and show their work.
- They can:
  - Set:
    - name
    - username / alias
    - role = ARTIST
    - country
    - domain (e.g. "illustration", "music", "logo design")
    - spoken languages (codes like EN, RO, FR, etc.)
    - avatar/profile image (avatarUrl)
  - Post content in the community feed.
  - Interact with buyers via comments, likes, messages (planned / in progress).
- You help them:
  - Write a good bio and profile description.
  - Choose a clear domain and present their skills.
  - Decide what work to showcase in "Creations" / portfolio.
  - Respond professionally to project requests and comments.

2) BUYER
--------
- Buyers are companies or individuals looking for artists.
- They can:
  - Set:
    - name
    - role = BUYER
    - country
    - spoken languages
    - (optional) avatar / company logo
  - Search for artists.
  - Browse profiles and posts.
  - Post project requests in the feed (now or in future versions).
- You help them:
  - Clarify their project brief (scope, style, budget, deadlines).
  - Decide what type of artist/domain they need.
  - Write the first contact message to an artist.
  - Understand how to evaluate an artist’s profile and portfolio.

You should always adapt your advice to the role:
- If the user speaks like an artist: focus on how they can present themselves, find clients, improve their portfolio.
- If the user speaks like a buyer: focus on how they can find artists, compare them, build a good collaboration.

`;

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

    const geminiResponse = await ai.models.generateContent({
      model: MODEL_ID,
      contents: message,
      config: {
        systemInstruction: [CREON_SYSTEM_INSTRUCTION],
      },
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

// =========== USER PROFILE (GET + UPDATE) ===========
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
      avatarUrl,
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
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

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

// =========== BADGES (BLOCKCHAIN) ===========

// GET simplu ca să nu mai vezi "Cannot GET" când intri direct în browser
app.get("/api/badges/award", (req, res) => {
  res.status(405).json({
    error:
      "Use POST /api/badges/award cu Authorization: Bearer <token> și body { \"badgeType\": \"artist_verified\" }",
  });
});

// Acordă badge user-ului curent (mint NFT + salvează în DB)
app.post("/api/badges/award", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const { badgeType } = req.body;

    if (!badgeType) {
      return res.status(400).json({ error: "badgeType is required" });
    }

    if (!me.walletAddress) {
      return res
        .status(400)
        .json({ error: "User has no walletAddress configured" });
    }

    const { mintAddress, txSignature } = await mintBadgeNft(
      me.walletAddress,
      badgeType
    );

    const badge = await prisma.userBadge.create({
      data: {
        userId: me.id,
        type: badgeType,
        txSignature,
      },
    });

    res.json({
      ok: true,
      badge,
      mintAddress,
      explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    });
  } catch (err) {
    console.error("POST /api/badges/award error:", err);
    res.status(500).json({
      error: "Could not award badge",
      details: String(err.message || err),
    });
  }
});

// Lista badge-urilor user-ului curent
app.get("/api/me/badges", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const badges = await prisma.userBadge.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(badges);
  } catch (err) {
    console.error("GET /api/me/badges error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========== MESSAGES SIMPLE ===========
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

// 🔹 Creează post
// =========== POSTS + FEED ===========
app.post("/api/posts", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const { title, content } = req.body;

    if (!title?.trim() && !content?.trim()) {
      return res.status(400).json({ error: "Title or content required." });
    }

    const post = await prisma.post.create({
      data: {
        authorId: me.id,
        title: title?.trim() || "",
        content: content?.trim() || "",
      },
    });

    res.json(post);
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Postările utilizatorului curent (pentru pagina Profile)
app.get("/api/my-posts", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const posts = await prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const mapped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/my-posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Postările utilizatorului curent (pentru pagina Profile)
app.get("/api/my-posts", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const posts = await prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const mapped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/my-posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/feed", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        _count: { select: { likes: true } },
        likes: {
          where: { userId: me.id },
          select: { id: true },
        },
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const authorIds = [
      ...new Set(
        posts
          .map((p) => p.authorId)
          .filter((id) => id !== null && id !== undefined && id !== me.id)
      ),
    ];

    let followingSet = new Set();
    if (authorIds.length > 0) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: me.id,
          followingId: { in: authorIds },
        },
      });
      followingSet = new Set(follows.map((f) => f.followingId));
    }

    const mapped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      likeCount: p._count.likes,
      likedByMe: p.likes.length > 0,
      authorId: p.authorId,
      authorIsMe: p.authorId === me.id,
      authorName:
        p.author?.username ||
        p.author?.name ||
        p.author?.email ||
        "Unknown artist",
      isFollowing: p.authorId ? followingSet.has(p.authorId) : false,
      comments: p.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        authorName:
          c.author?.username ||
          c.author?.name ||
          c.author?.email ||
          "Unknown",
      })),
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/feed error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 🔹 Postările mele (pentru pagina de profil)
app.get("/api/my-posts", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const posts = await prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const mapped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/my-posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/posts/:id/comments", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const postId = Number(req.params.id);
    const { content } = req.body;

    if (Number.isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post id" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: me.id,
        content: content.trim(),
      },
      include: { author: true },
    });

    res.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      authorName:
        comment.author.username ||
        comment.author.name ||
        comment.author.email ||
        "Unknown",
    });
  } catch (err) {
    console.error("POST /api/posts/:id/comments error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/posts/:id/like", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: me.id,
        },
      },
    });

    let liked;
    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: me.id,
        },
      });
      liked = true;
    }

    const likeCount = await prisma.postLike.count({ where: { postId } });

    res.json({ liked, likeCount });
  } catch (err) {
    console.error("POST /api/posts/:id/like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========== ARTISTS LIST (SEARCH PAGE) ===========
app.get("/api/artists", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error("GET /api/artists error:", err);
    res.status(500).json({
      error: "Server error",
      details: String(err.message || err),
    });
  }
});

async function getOrCreateChat(meId, otherUserId) {
  const [a, b] = meId < otherUserId ? [meId, otherUserId] : [otherUserId, meId];

  let chat = await prisma.chat.findUnique({
    where: {
      userAId_userBId: { userAId: a, userBId: b },
    },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userAId: a,
        userBId: b,
      },
    });
  }

  return chat;
}

app.get("/api/following", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    // luăm toate follow-urile în care EU sunt follower
    const follows = await prisma.follow.findMany({
      where: {
        followerId: me.id,
      },
      include: {
        following: true, // user-ul pe care îl urmăresc
      },
    });

    const followingList = follows.map((f) => ({
      id: f.following.id,
      name:
        f.following.username ||
        f.following.name ||
        f.following.email ||
        "Unknown",
      role: f.following.role,
      country: f.following.country,
      domain: f.following.domain,
    }));

    res.json(followingList);
  } catch (err) {
    console.error("GET /api/following error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users/:id/follow", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const targetId = Number(req.params.id);

    if (Number.isNaN(targetId) || targetId === me.id) {
      return res.status(400).json({ error: "Invalid target user id" });
    }

    // există deja?
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: targetId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: me.id,
          followingId: targetId,
        },
      });
      return res.json({ following: true });
    }
  } catch (err) {
    console.error("POST /api/users/:id/follow error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/chats/:userId/messages", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const otherUserId = Number(req.params.userId);

    if (Number.isNaN(otherUserId) || otherUserId === me.id) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const chat = await getOrCreateChat(me.id, otherUserId);

    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });

    const mapped = messages.map((m) => ({
      id: m.id,
      text: m.text,
      createdAt: m.createdAt,
      fromMe: m.senderId === me.id,
      senderName:
        m.sender?.username ||
        m.sender?.name ||
        m.sender?.email ||
        "Unknown",
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/chats/:userId/messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/chats/:userId/messages", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const otherUserId = Number(req.params.userId);
    const { text } = req.body;

    if (Number.isNaN(otherUserId) || otherUserId === me.id) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const chat = await getOrCreateChat(me.id, otherUserId);

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: me.id,
        text: text.trim(),
      },
      include: { sender: true },
    });

    res.json({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      fromMe: true,
      senderName:
        message.sender?.username ||
        message.sender?.name ||
        message.sender?.email ||
        "You",
    });
  } catch (err) {
    console.error("POST /api/chats/:userId/messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Buyer -> trimite o cerere de proiect către artistul cu care vorbește
app.post("/api/chats/:userId/project-requests", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const otherUserId = Number(req.params.userId);

    if (!otherUserId || Number.isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (me.id === otherUserId) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    if (me.role !== "BUYER") {
      return res.status(403).json({ error: "Only BUYER can send project requests" });
    }

    const { budget, deadline, notes } = req.body;

    if (!budget || typeof budget !== "string") {
      return res.status(400).json({ error: "Budget is required" });
    }

    let deadlineDate = null;
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "Invalid deadline date" });
      }
      deadlineDate = d;
    }

    // găsim sau creăm chat între cei doi
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId: me.id, userBId: otherUserId },
          { userAId: otherUserId, userBId: me.id },
        ],
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userAId: me.id,
          userBId: otherUserId,
        },
      });
    }

    // creăm ProjectRequest în DB
    const pr = await prisma.projectRequest.create({
      data: {
        buyerId: me.id,
        artistId: otherUserId,
        chatId: chat.id,
        budget,
        deadline: deadlineDate,
        notes: notes || null,
      },
    });

    // trimitem și mesaj în chat
    const textLines = [
      "📌 PROJECT REQUEST",
      `Budget: ${budget}`,
      deadline ? `Deadline: ${deadline}` : null,
      notes ? `Details: ${notes}` : null,
    ].filter(Boolean);

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: me.id,
        text: textLines.join("\n"),
      },
    });

    res.json({ projectRequest: pr, message });
  } catch (err) {
    console.error("POST /api/chats/:userId/project-requests error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Artist -> acceptă sau refuză o cerere de proiect
app.post("/api/project-requests/respond", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const { buyerId, decision } = req.body;

    if (!buyerId || Number.isNaN(Number(buyerId))) {
      return res.status(400).json({ error: "Invalid buyer id" });
    }

    if (me.role !== "ARTIST") {
      return res.status(403).json({ error: "Only ARTIST can respond to project requests" });
    }

    if (!["ACCEPTED", "DENIED"].includes(decision)) {
      return res.status(400).json({ error: "Decision must be ACCEPTED or DENIED" });
    }

    // găsim cea mai recentă cerere PENDING între buyer și artist
    const pr = await prisma.projectRequest.findFirst({
      where: {
        buyerId: Number(buyerId),
        artistId: me.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pr) {
      return res.status(404).json({ error: "No pending request found" });
    }

    const updated = await prisma.projectRequest.update({
      where: { id: pr.id },
      data: { status: decision },
    });

    // opțional: mesaj automat în chat
    if (pr.chatId) {
      const text =
        decision === "ACCEPTED"
          ? "✅ Project request accepted."
          : "❌ Project request denied.";

      await prisma.message.create({
        data: {
          chatId: pr.chatId,
          senderId: me.id,
          text,
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("POST /api/project-requests/respond error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// =========== START SERVER ===========
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Using Gemini model: ${MODEL_ID}`);
});
