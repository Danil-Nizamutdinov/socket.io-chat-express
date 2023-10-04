const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

const http = require("http").Server(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello",
  });
});

app.get("/about", (req, res) => {
  res.json({
    message: "Chat",
  });
});

const users = [];
const messages = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);

  socket.on("message", (data) => {
    messages.push(data);
    io.emit("getMessages", messages); // после отправки сообщение отпр обнов массив сообщений
  });

  socket.on("newUser", (data) => {
    console.log("newUser");
    users.push(data);
    io.emit("getUsers", users);
    io.emit("getMessages", messages); // после входа userу загружаются все сообщения
  });

  io.emit("getUsers", users); // что бы после перезагрузки стр в state add user
  io.emit("getMessages", messages); // что бы после перезагрузки стр в state add messages

  socket.on("logout", (id) => {
    const index = users.findIndex((obj) => obj.id === id);
    if (index !== -1) {
      users.splice(index, 1);
    }
    io.emit("getUsers", users);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnect`);
  });
});

http.listen(PORT, () => {
  console.log("server working");
});
