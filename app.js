import express from "express";
import cors from "cors";
import empRoutes from './Routes/HR/Master/Employee/empRoutes.js';
import catgRoutes from './Routes/HR/Master/Category/catgRoutes.js';
import deptRoutes from './Routes/HR/Master/Department/deptRoutes,.js';
import desgRoutes from './Routes/HR/Master/Designation/desgRoutes.js';
import locRoutes from './Routes/HR/Master/Location/locRoutes.js';
import prateRoutes from "./Routes/HR/Master/Piece Rate/RateRoutes.js";
import vehicleRoutes from "./Routes/HR/Master/Vehicle/vehicleRoutes.js"
import prodRoutes from "./Routes/HR/Master/Products/prodRoutes.js"
import productionRoutes from "./Routes/HR/Transaction/Production/productionRoutes.js"
import attendRoutes from "./Routes/HR/Transaction/Attendance/attendRoutes.js";
import EntryRoutes from "./Routes/Gatepass/Entry/EntryRoutes.js"
import InOutRoutes from "./Routes/Gatepass/InOut/InOut.js"
import SocMembers from "./Routes/Society/Master/MasterRoutes.js"
import authRoutes from "./Routes/Authentication/AuthRoutes.js"
import postRoutes from "./Routes/Gatepass/Post/Post.js"
import reportRoutes from "./Routes/Gatepass/Reports/Report/reportRoutes.js"
import bookMeetRoutes from "./Routes/BookMeet/bookMeetRoutes.js"
import viewvehreq from "./Routes/Vehicle/CreateRoutes.js";
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const port = 5002;

app.use(cors());

/// Create an HTTP server using Express app
const server = http.createServer(app);
// Create a WebSocket server attached to the HTTP server
export const wsServer = new WebSocketServer({ server });

// WebSocket connection handling
wsServer.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// WebSocket server error handling
wsServer.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// Enable CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(empRoutes);
app.use(catgRoutes);
app.use(deptRoutes);
app.use(desgRoutes);
app.use(locRoutes);
app.use(prateRoutes);
app.use(vehicleRoutes);
app.use(prodRoutes);
app.use(productionRoutes);
app.use(attendRoutes);
app.use(EntryRoutes);
app.use(InOutRoutes);
app.use(SocMembers);
app.use(authRoutes);
app.use(postRoutes);
app.use(reportRoutes);
app.use(bookMeetRoutes);
app.use(viewvehreq);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});