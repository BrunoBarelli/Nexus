import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { RoomManager } from './RoomManager.js';
import { SignalingHandler } from './SignalingHandler.js';
import { DiscordBot } from './DiscordBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: PUBLIC_URL,
    methods: ['GET']
  },
  maxHttpBufferSize: 1e5
});

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/streamer', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/streamer.html'));
});

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.NEXUS_CONFIG = { googleClientId: ${JSON.stringify(process.env.GOOGLE_CLIENT_ID || null)} };`);
});

const roomManager = new RoomManager('nexus-room');
const signaling = new SignalingHandler(io, roomManager);

io.on('connection', (socket) => {
  console.log(`[Conexao] Socket: ${socket.id}`);
  signaling.register(socket);
});

server.listen(PORT, async () => {
  console.log(`[NEXUS LIVE] Servidor online: http://localhost:${PORT}`);

  try {
    const bot = new DiscordBot({
      token: process.env.DISCORD_TOKEN,
      clientId: process.env.CLIENT_ID,
      publicUrl: PUBLIC_URL
    });
    await bot.start();
  } catch (err) {
    console.error('[Discord] Falha ao iniciar o bot:', err.message);
  }
});