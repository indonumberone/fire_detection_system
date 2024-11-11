import { app } from "../index.js";

export const webhook = async () => {
  app.post("/tes2", (req, res) => {
    console.log(req.body);
    res.status(200).send("letsgooo");
  });
};
