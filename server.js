const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

let users = new Map(); // username => socket

server.on('connection', (socket) => {
  let username = null;

  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'register') {
        username = data.username;
        users.set(username, socket);
        console.log(`User registered: ${username}`);
        return;
      }

      if (data.type === 'message') {
        const toSocket = users.get(data.to);
        if (toSocket && toSocket.readyState === WebSocket.OPEN) {
          const payload = JSON.stringify({
            from: username,
            message: data.message
          });
          toSocket.send(payload);
        }
      }
    } catch (err) {
      console.log("Invalid message:", msg);
    }
  });

  socket.on('close', () => {
    if (username) users.delete(username);
    console.log(`User disconnected: ${username}`);
  });
});

console.log("WebSocket server is running...");
