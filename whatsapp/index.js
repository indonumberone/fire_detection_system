import pkg from "@whiskeysockets/baileys";
import pino from "pino";
import NodeCache from "node-cache";
import readline from "readline";
import handler from "./lib/handler.js";
import express from "express";
import bodyParser from "body-parser";
import { webhook } from "./lib/webhook.js";

const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  PHONENUMBER_MCC,
} = pkg;

const useStore = false;

const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
});

const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const store = useStore ? makeInMemoryStore({ logger }) : undefined; // Initialize store if it's enabled
store?.readFromFile("store.json");

setInterval(() => {
  store?.writeToFile("store.json");
}, 60000 * 60);

const msgRetryCounterCache = new NodeCache();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const P = pino({
  level: "silent",
});

export const app = express();
export const port = 3030;

async function start() {
  let { state, saveCreds } = await useMultiFileAuthState("AUTH");
  let { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P),
    },
    msgRetryCounterCache,
  });
  store?.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question("Enter your active whatsapp number: ");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`Pairing with this code: ${code}`);
  }

  // Handle connection updates
  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const update = events["connection.update"];
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output &&
          lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        ) {
          start();
        } else {
          console.log("Connection closed. You are logged out.");
        }
      }
      console.log("Connection update:", update);
      webhook(sock);
    }
  });
  sock.ev.on("messages.upsert", async (m) => {
    m.messages.forEach(async (message) => {
      await handler(sock, message);
      //   console.log(JSON.stringify(m, undefined, 2));
      // console.log("replying to", m.messages[0].key.remoteJid);
    });
  });
  return sock;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});
app.listen(port);

start();
