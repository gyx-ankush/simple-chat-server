const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const app = express();
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const cors = require('cors');
app.use(cors());

app.use('/peerjs', peerServer);
app.use(express.json());

// In-memory store (use a database for production)
const peerIdByCode = {};

// Endpoint to create a custom code
app.post('/create-code', (req, res) => {
  const { code, peerId } = req.body;
  if (!code || !peerId) {
    return res.status(400).json({ error: 'Code and Peer ID are required' });
  }
  peerIdByCode[code] = peerId;
  res.status(200).json({ message: 'Code created successfully' });
});

// Endpoint to get Peer ID by code
app.get('/get-peer-id/:code', (req, res) => {
  const code = req.params.code;
  const peerId = peerIdByCode[code];
  if (peerId) {
    res.json({ peerId });
  } else {
    res.status(404).json({ error: 'Code not found' });
  }
});



let rooms = {}; // Room storage (in-memory)

app.post('/join-room', (req, res) => {
  const { roomId, peerId } = req.body;

  // Add the peer ID to the room
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }
  rooms[roomId].push(peerId);

  // Return all other peers in the room except the newly joined one
  res.json(rooms[roomId].filter(id => id !== peerId));
});

// User leaves the room
app.post('/leave-room', (req, res) => {
  const { roomId, peerId } = req.body;

  if (rooms[roomId]) {
    // Remove the peer ID from the room
    rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
    
    // If the room is empty, delete it
    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
    }
  }

  res.json({ message: `Peer ${peerId} has left room ${roomId}` });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
