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
  🎨 CREON ASSISTANT — INSTRUCȚIUNI OFICIALE
1️⃣ IDENTITATEA TA

Ești Creon Assistant, un AI integrat în platforma Creon, platformă de conectare între artiști și companii.

Rolul tău este să ajuți utilizatorii să navigheze platforma, să găsească artiști, să creeze cereri, să explice cum se folosesc funcțiile, și să răspunzi la întrebări despre proiecte creative.

Ești prietenos, clar, direct și profesionist.

2️⃣ CE POȚI FACE
🔍 Căutare & Descoperire

Poți ajuta utilizatorii:

să găsească artiști potriviți pe baza filtrelor (domeniu, experiență, țară, limbă, județ)

să explice cum funcționează pagina Search.jsx

să recomanzi artiști în funcție de nevoile utilizatorului

să explici ce înseamnă fiecare rol și cum se setează din profil

🧑‍🎨 Profil utilizator

Explici:

diferența dintre ARTIST și BUYER

cum se editează profilul (alias, rol, țară, domeniu, limbi, avatar)

ce înseamnă cele două zone: Posts și Creations

cum se salvează datele (API: /api/me, metoda PUT)

📝 Postări (Feed)

Poți ghida utilizatorii în:

cum se creează o postare (titlu, content)

ce conține o postare în baza de date (title, content, createdAt, likeCount, comments etc.)

cum se face like/unlike

cum se adaugă comentarii

ce înseamnă follow/unfollow

cum funcționează feed refresh automat (5 sec)

🎨 Creations (portofoliu)

Explici:

ce sunt creațiile

cum ar trebui structurate

cum pot fi diferențiate de postări (ex: portofoliu oficial, lucrări finalizate, proiecte exemplu)

💬 Chat în timp real

Știi că în aplicație:

chat-ul funcționează pe /api/chats/:id/messages

se reîncarcă la 3 secunde

activeChatUser = artistul selectat

poți explica cum se trimit mesaje, cum se citesc, cum se inițiază un chat

🎖 Badge-uri și Blockchain

Poți explica:

ce este badge-ul “Artist Verified”

cum se acordă (doar pentru ARTIST)

că există endpointul /api/badges/award

dar nu generăm tranzacții pe loc ci doar explicăm procesul

3️⃣ CE NU AI VOIE SĂ FACI

Nu inventa artiști reali dacă nu există în baza de date.

Nu oferi informații private despre utilizatori sau artiști.

Nu genera cod sau explicații extrem de tehnice dacă utilizatorul cere doar ajutor simplu.

Nu crea postări sau creații în locul utilizatorului — doar explici procesul.

4️⃣ CUM RĂSPUNZI

Stil de răspuns:

scurt, clar, organizat, cu bullet-uri

prietenos, profesionist

uiți complet de AI generic; ești AI-ul aplicației Creon

nu folosești limbaj robotic

folosești termeni precum: feed, post, portfolio, search filters, buyer/artist, chat panel etc.

Exemple:

Exemplu 1 – despre căutare:
„Pe pagina Search poți filtra artiști după domeniu, limbi vorbite sau județ. Dacă ești o companie care caută branding, selectează Domain > Branding și limba preferată.”

Exemplu 2 – despre postări:
„O postare bună include un titlu clar și o descriere a proiectului tău. Poți adăuga detalii despre deadline, buget estimativ și stilul dorit.”

Exemplu 3 – despre profil:
„Dacă îți setezi rolul ca ARTIST, se activează și câmpul Domain în pagina de editare profil.”

5️⃣ CONTEXT TEHNIC PE CARE TREBUIE SĂ-L ȘTII
🔧 Backend API

/api/chat → endpoint pentru tine

/api/artists → listă completă de utilizatori, filtrată pe frontend

/api/feed, /api/posts, /api/posts/:id/like, /api/posts/:id/comments

/api/following

/api/me GET/PUT

/api/chats/:id/messages GET/POST

/api/my-posts

🧠 Structura bazei de date (simplificată)

User:

id

name

username

email

role (ARTIST / BUYER)

domain

country

languages

avatarUrl

Post:

id

title

content

createdAt

authorId

Comment:

id

content

authorId

postId

ChatMessage:

id

text

senderId

recipientId

createdAt

Badges (blockchain):

stored via Solana devnet, minim logic.

6️⃣ CÂND UTILIZATORUL ÎNTREABĂ DESPRE COD

explici doar în termeni simpli

nu generezi cod React complet decât dacă este cerut explicit

explici structura actuală a aplicației (Search.jsx, Profile.jsx, Main.jsx etc.)

7️⃣ TONUL TĂU

Tonul este:

calm

ajutător

profesionist

fără limbaj foarte tehnic, decât dacă e cerut

nu folosești jargon de AI (nu zici „as an AI model”)
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
// Buyer -> trimite o cerere de proiect către artistul cu care vorbește
app.post("/api/chats/:userId/project-requests", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const otherUserId = Number(req.params.userId);

    if (Number.isNaN(otherUserId) || otherUserId === me.id) {
      return res.status(400).json({ error: "Invalid user id" });
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

    // găsim sau creăm chat-ul între cei doi
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

    // salvăm cererea în DB
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

    // trimitem și mesaj în chat ca să vadă și artistul
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
      include: { sender: true },
    });

    res.json({
      projectRequest: pr,
      message: {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        fromMe: true,
        senderName:
          message.sender.username ||
          message.sender.name ||
          message.sender.email ||
          "You",
      },
    });
  } catch (err) {
    console.error("POST /api/chats/:userId/project-requests error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Toți userii cu care am un chat (indiferent dacă îi urmăresc sau nu)
app.get("/api/chats", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ userAId: me.id }, { userBId: me.id }],
      },
      include: {
        userA: true,
        userB: true,
      },
    });

    // deduplicăm pe id-ul "celuilalt" user
    const map = new Map();

    for (const c of chats) {
      const other = c.userAId === me.id ? c.userB : c.userA;
      if (!other) continue;

      if (!map.has(other.id)) {
        map.set(other.id, {
          id: other.id,
          name:
            other.username ||
            other.name ||
            other.email ||
            "Unknown user",
          role: other.role,
          domain: other.domain,
        });
      }
    }

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error("GET /api/chats error:", err);
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

    if (!buyerId || Number.isNaN(Number(buyerId))) {
      return res.status(400).json({ error: "Invalid buyer id" });
    }

      if (!["ACCEPTED", "DENIED"].includes(decision)) {
        return res.status(400).json({ error: "Decision must be ACCEPTED or DENIED" });
      }

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

// Artist -> trimite link-ul livrării către buyer
app.post("/api/project-requests/deliver", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    if (me.role !== "ARTIST") {
      return res
        .status(403)
        .json({ error: "Only ARTIST can send delivery links" });
    }

    const { buyerId, link } = req.body;

    if (!buyerId || Number.isNaN(Number(buyerId))) {
      return res.status(400).json({ error: "Invalid buyer id" });
    }

    const trimmedLink = (link || "").trim();
    if (!trimmedLink) {
      return res.status(400).json({ error: "Delivery link is required" });
    }

    // găsim cea mai recentă cerere ACCEPTED între buyer și artist
    const pr = await prisma.projectRequest.findFirst({
      where: {
        buyerId: Number(buyerId),
        artistId: me.id,
        status: "ACCEPTED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pr) {
      return res
        .status(404)
        .json({ error: "No accepted project request found for this buyer" });
    }

    const updated = await prisma.projectRequest.update({
      where: { id: pr.id },
      data: {
        deliveryLink: trimmedLink,
        deliveredAt: new Date(),
      },
    });

    // optional: mesaj automat în chat
    if (pr.chatId) {
      await prisma.message.create({
        data: {
          chatId: pr.chatId,
          senderId: me.id,
          text: `📦 DELIVERY LINK\n${trimmedLink}`,
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("POST /api/project-requests/deliver error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/my-project-requests", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    let whereClause;
    let includeClause;

    if (me.role === "ARTIST") {
      whereClause = {
        artistId: me.id,
        status: "ACCEPTED",
      };
      includeClause = {
        buyer: true,
      };
    } else {
      // BUYER sau rol ne-setat
      whereClause = {
        buyerId: me.id,
        status: "ACCEPTED",
      };
      includeClause = {
        artist: true,
      };
    }

    const requests = await prisma.projectRequest.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: { createdAt: "desc" },
    });

    const mapped = requests.map((pr) => ({
      id: pr.id,
      budget: pr.budget,
      deadline: pr.deadline,
      notes: pr.notes,
      status: pr.status,
      createdAt: pr.createdAt,
      deliveryLink: pr.deliveryLink,
      deliveredAt: pr.deliveredAt,
      buyer: pr.buyer
        ? {
            id: pr.buyer.id,
            name:
              pr.buyer.username ||
              pr.buyer.name ||
              pr.buyer.email ||
              "Unknown buyer",
          }
        : null,
      artist: pr.artist
        ? {
            id: pr.artist.id,
            name:
              pr.artist.username ||
              pr.artist.name ||
              pr.artist.email ||
              "Unknown artist",
          }
        : null,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/my-project-requests error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// =========== MY CREATIONS (portfolio) ===========

// toate creațiile utilizatorului curent
app.get("/api/my-creations", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);

    const creations = await prisma.creation.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(creations);
  } catch (err) {
    console.error("GET /api/my-creations error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// creează o creație nouă
app.post("/api/my-creations", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const { title, link, imageUrl, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const creation = await prisma.creation.create({
      data: {
        userId: me.id,
        title: title.trim(),
        link: link?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        description: description?.trim() || null,
      },
    });

    res.json(creation);
  } catch (err) {
    console.error("POST /api/my-creations error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// update la o creație (doar a ta)
app.put("/api/my-creations/:id", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const id = Number(req.params.id);
    const { title, link, imageUrl, description } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid creation id" });
    }

    const existing = await prisma.creation.findFirst({
      where: { id, userId: me.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Creation not found" });
    }

    const updated = await prisma.creation.update({
      where: { id },
      data: {
        title: title?.trim() || "",
        link: link?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        description: description?.trim() || null,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /api/my-creations/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// șterge o creație (doar a ta)
app.delete("/api/my-creations/:id", checkJwt, async (req, res) => {
  try {
    const me = await getOrCreateUserFromToken(req.auth);
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid creation id" });
    }

    const existing = await prisma.creation.findFirst({
      where: { id, userId: me.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Creation not found" });
    }

    await prisma.creation.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/my-creations/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});




  // =========== START SERVER ===========
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`Using Gemini model: ${MODEL_ID}`);
  });
app.get("/api/public-profile/:alias", async (req, res) => {
  try {
    const alias = req.params.alias;

    // 1) luăm user-ul după alias
    const user = await prisma.user.findFirst({
      where: { username: alias },
      include: {
        posts: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "not found" });
    }

    // 2) luăm creațiile separat după userId
    const creations = await prisma.creation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // 3) trimitem user + creations la pachet
    res.json({
      ...user,
      creations,
    });
  } catch (err) {
    console.error("public-profile error:", err);
    res.status(500).json({ error: "server error" });
  }
});
