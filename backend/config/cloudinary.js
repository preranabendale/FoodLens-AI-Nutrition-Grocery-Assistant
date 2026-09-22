
const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("");
console.log("======================================");
console.log("CLOUDINARY CONFIG");
console.log("======================================");

console.log(
  "Cloud Name:",
  cloudName ? "Loaded " : "Missing "
);

console.log(
  "API Key:",
  apiKey ? "Loaded " : "Missing "
);

console.log(
  "API Secret:",
  apiSecret ? "Loaded " : "Missing "
);

console.log("======================================");

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

module.exports = cloudinary;
