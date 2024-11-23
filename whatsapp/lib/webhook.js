import { app } from "../index.js";
import { returnMessage } from "./returnMessage.js";
// let i = 0;
export const webhook = async (sock) => {
  app.post("/webhook", async (req, res) => {
    try {
      if (
        !req.body ||
        !req.body.sensor ||
        !req.body.risk ||
        !req.body.system_status ||
        !req.body.tempat
      ) {
        console.log(req.body);
        return res.status(400).send({ status: "Error", message: "Body salah" });
      }
      const { sensor, system_status, risk, tempat } = req.body;
      const balas = await returnMessage(
        sensor,
        system_status,
        risk,
        tempat,
        ""
      );
      console.log(balas);
      await sock.sendMessage("120363310840644091@g.us", {
        text: balas,
      });
      res.status(200).send("berhasil terkirim");
      console.log(req.body);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ status: "Error", message: "Internal Server Error" });
    }
  });
};
