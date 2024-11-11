import { downloadMediaMessage, getContentType } from "@whiskeysockets/baileys";
import { app } from "../index.js";
import { getData } from "./getData.js";
import { returnMessage } from "./returnMessage.js";
export default async function handler(sock, m) {
  const senderNumber = m.key.remoteJid;
  console.log(m.key);
  if (m.message) {
    m.mtype = getContentType(m.message);
    try {
      var body =
        m.mtype === "conversation"
          ? m.message.conversation
          : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
          ? m.message.videoMessage.caption ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage
          : m.mtype == "extendedTextMessage"
          ? m.message.extendedTextMessage.text ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.conversation
          : m.mtype == "ephemeralMessage"
          ? m.message.ephemeralMessage.message.extendedTextMessage.text
          : m.mtype == "buttonsResponseMessage"
          ? m.message.buttonsResponseMessage.selectedButtonId
          : m.mtype == "listResponseMessage"
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId
          : m.mtype == "templateButtonReplyMessage"
          ? m.message.templateButtonReplyMessage.selectedId
          : m.mtype === "messageContextInfo"
          ? m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.text
          : "";
    } catch (e) {
      console.log(e);
    }
  }

  const reply = async (text) => {
    await sock.sendMessage(
      senderNumber,
      {
        text,
      },
      { quoted: m }
    );
  };

  try {
    let prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const firstmess = body.startsWith(prefix);
    let pesan = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    m.args = body.replace(prefix, "").trim().split(/ +/).slice(1);
    console.log(m.args);
    let q = m.args.join(" ");
    app.post("/tes", (req, res) => {
      console.log(req.body);
      res.status(200).send("letsgooo");
    });
    if (firstmess) {
      switch (pesan) {
        case "q":
          {
            reply("hallo");
          }
          break;
        case "cek":
          {
            // console.log(m.args[0]);
            if (!m.args[0]) {
              reply("isi format yang benar");
            } else if (m.args[0].toUpperCase() === "PASCA") {
              reply("Please Wait...");
              const data = await getData("Pasca");
              // console.log(data.data);
              // console.log("bejir");
              const { sensor, system_status, risk, tempat } = data.data;
              const balas = await returnMessage(
                sensor,
                system_status,
                risk,
                tempat,
                "PASCA"
              );
              console.log(data.data);
              reply(balas);
            }
          }
          break;
        default:
          reply(`
cek data ?
.cek <Room>
example 
.cek Pasca
            `);
          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}
