import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import internalRoutes from './routes/internal.js';
dotenv.config();
import { initSocket } from './socket.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/internal", internalRoutes);
const server = http.createServer(app);
initSocket(server);
server.listen(process.env.PORT, () => {
    console.log(`Realtime service is running port ${process.env.PORT}`);
});
