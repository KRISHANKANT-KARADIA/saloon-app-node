import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinSaloonRoom", (saloonId) => {
    socket.join(saloonId);
    console.log("Owner joined room:", saloonId);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
