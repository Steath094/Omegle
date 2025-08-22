import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { UserManager } from "./managers/UserManager.js";

const app = express();
app.use(express.json());

// Create a single HTTP server
const httpServer = createServer(app);

// Attach socket.io to the same server
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  console.log("new user joined");
  userManager.addUser("random", socket);

  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  });
});

// Listen on ONE port only
httpServer.listen(3000, () => {
  console.log("Server (Express + Socket.IO) listening on port 3000");
});
