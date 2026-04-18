import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fetch from "node-fetch";
import * as GameState from "./gameState.js";

dotenv.config({ path: "../.env" });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = 3001;

app.use(express.json());

app.post("/api/token", async (req, res) => {
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  const data = await response.json();

  if (response.ok && data.access_token) {
    res.send({ access_token: data.access_token });
  } else {
    console.error("Discord token error:", data);
    res.status(response.status || 400).send(data);
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ channelId, user }) => {
    socket.join(channelId);
    const room = GameState.joinPlayer(channelId, user);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("start_game", ({ channelId, category, language }) => {
    const room = GameState.startGame(channelId, category, language);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("submit_clue", ({ channelId, userId, clue }) => {
    const room = GameState.submitClue(channelId, userId, clue);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("submit_vote", ({ channelId, userId, targetId }) => {
    const room = GameState.submitVote(channelId, userId, targetId);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("next_round", ({ channelId, forceNewWord }) => {
    const room = GameState.nextRound(channelId, forceNewWord);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("reset", ({ channelId }) => {
    const room = GameState.resetToLobby(channelId);
    io.to(channelId).emit("state_update", room);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
