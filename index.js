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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
