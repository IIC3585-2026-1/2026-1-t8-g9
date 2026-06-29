const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const strokes = [];

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", (socket) => {
  socket.emit("canvas-state", strokes);

  socket.on("draw", (stroke) => {
    strokes.push(stroke);
    socket.broadcast.emit("draw", stroke);
  });

  socket.on("clear-canvas", () => {
    strokes.length = 0;
    io.emit("clear-canvas");
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
