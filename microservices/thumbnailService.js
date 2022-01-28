"use strict";
const cote = require("cote");
var jimp = require("jimp");

const responder = new cote.Responder(
  {
    name: "thumbnail responder",
  },
  { log: false, statusLogsEnabled: false }
);

responder.on("createThumbnail", async (req) => {
  const image = await jimp.read(req.image);
  return image.scaleToFit(100, 100).write(dstImagePath);
});

console.log("thumbnail service starts");
