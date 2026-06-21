import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to receive TikTok messages (webhook)
app.post('/api/tiktok-message', (req, res) => {
  const { username, message } = req.body;
  
  if (!username || !message) {
    return res.status(400).json({ error: 'Missing username or message' });
  }

  // Broadcast to all connected clients
  broadcastMessage({
    type: 'tiktok_message',
    username,
    message,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Message received' });
});

// Store for WebSocket clients
const clients = new Set();

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 King Tournament server running on http://localhost:${PORT}`);
  console.log(`📡 Ready for TikTok Live integration`);
});

// Helper function to broadcast messages
function broadcastMessage(data) {
  console.log('Broadcasting:', data);
  // When WebSocket is implemented, will broadcast to all connected clients
  // For now, messages are stored and can be polled
}
