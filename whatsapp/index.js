import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import NodeCache from "node-cache";
import readline from "readline";
import handler from "./lib/handler.js";
import express from "express";
import bodyParser from "body-parser";
import { webhook } from "./lib/webhook.js";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("login");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        "connection closed due to",
        lastDisconnect.error,
        ", reconnecting",
        shouldReconnect
      );

      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  sock.ev.on("creds.update", saveCreds);
  webhook(sock);

  sock.ev.on("messages.upsert", async (m) => {
    m.messages.forEach(async (message) => {
      await handler(sock, message);
    });
  });
}
export const app = express();
export const port = 3030;

app.use(cors());
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
});
app.use(limiter);
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send({
      status: "Error",
      message: "Body salah",
    });
  }
  next(err);
});
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});
app.listen(port);

connectToWhatsApp();
